import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import * as cheerio from "cheerio";
import http from "http";
import https from "https";
import dns from "dns/promises";
import dnsCallback, { LookupAddress } from "dns";
import net, { LookupFunction } from "net";
import { getDb } from "./db";
import { CrawledPage } from "./entities";
import { Product } from "../../../types/bot";
import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";

export function isPrivateIp(ip: string): boolean {
  if (ip === "::1" || ip === "::" || ip === "0.0.0.0") return true;

  if (ip.toLowerCase().startsWith("::ffff:")) {
    ip = ip.slice("::ffff:".length);
  }

  const parts = ip.split(".").map(Number);
  if (parts.length === 4) {
    const [b0, b1] = parts;
    if (b0 === 10) return true; // 10.0.0.0/8
    if (b0 === 127) return true; // 127.0.0.0/8
    if (b0 === 169 && b1 === 254) return true; // 169.254.0.0/16
    if (b0 === 192 && b1 === 168) return true; // 192.168.0.0/16
    if (b0 === 172 && b1 >= 16 && b1 <= 31) return true; // 172.16.0.0/12
    if (b0 === 0) return true; // 0.0.0.0/8
    if (b0 === 100 && b1 >= 64 && b1 <= 127) return true; // 100.64.0.0/10
    if (b0 === 198 && (b1 === 18 || b1 === 19)) return true; // 198.18.0.0/15
    if (b0 >= 224) return true; // multicast, reserved, broadcast
  }

  if (net.isIPv6(ip)) {
    const lower = ip.toLowerCase();
    if (
      lower.startsWith("fe80:") ||
      lower.startsWith("fc") ||
      lower.startsWith("fd") ||
      lower.startsWith("ff") // multicast
    ) {
      return true;
    }
  }

  return false;
}

export async function isSafePublicUrl(targetUrl: string): Promise<boolean> {
  try {
    const parsed = new URL(targetUrl);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return false;
    }

    const hostname = parsed.hostname.toLowerCase();
    if (
      hostname === "localhost" ||
      hostname.endsWith(".localhost") ||
      hostname.endsWith(".local") ||
      hostname.endsWith(".internal")
    ) {
      return false;
    }

    if (net.isIP(hostname)) {
      return !isPrivateIp(hostname);
    }

    const addresses = await dns.lookup(hostname, { all: true });
    for (const record of addresses) {
      if (isPrivateIp(record.address)) {
        return false;
      }
    }
    return true;
  } catch {
    return false;
  }
}

// Resolves DNS at connect time and refuses private addresses, so a hostname that passed
// isSafePublicUrl can't be re-pointed (DNS rebinding) at an internal IP before the request.
const guardedLookup: LookupFunction = (hostname, options, callback) => {
  dnsCallback.lookup(hostname, { ...options, all: true }, (err, result) => {
    if (err) return callback(err, []);
    const addresses = result as unknown as LookupAddress[];
    if (addresses.length === 0 || addresses.some((a) => isPrivateIp(a.address))) {
      return callback(new Error(`[SSRF Guard] ${hostname} resolves to a non-public address`), []);
    }
    if (options.all) return callback(null, addresses);
    callback(null, addresses[0].address, addresses[0].family);
  });
};

const safeHttpAgent = new http.Agent({ lookup: guardedLookup });
const safeHttpsAgent = new https.Agent({
  lookup: guardedLookup,
  rejectUnauthorized: process.env.NODE_ENV !== "development",
});

const MAX_REDIRECTS = 5;

// Shape of Shopify's public /products/<handle>.json response (fields we read).
interface ShopifyProductJson {
  title?: string;
  body_html?: string | null;
  vendor?: string;
  product_type?: string;
  image?: { src?: string } | null;
  images?: { src?: string }[];
  options?: { name?: string; values?: string[] }[];
  variants?: { price?: string; available?: boolean }[];
}

/**
 * GET for user-supplied URLs. Follows redirects manually so every hop is re-checked with
 * isSafePublicUrl, instead of letting axios follow a public URL into an internal one.
 */
export async function safeGet<T = unknown>(
  url: string,
  config: AxiosRequestConfig = {},
): Promise<{ response: AxiosResponse<T>; finalUrl: string }> {
  let currentUrl = url;

  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    if (!(await isSafePublicUrl(currentUrl))) {
      throw new Error(`[SSRF Guard] Blocked unsafe URL: ${currentUrl}`);
    }

    const response = await axios.get<T>(currentUrl, {
      ...config,
      httpAgent: safeHttpAgent,
      httpsAgent: safeHttpsAgent,
      maxRedirects: 0,
      validateStatus: (status) => status >= 200 && status < 400,
    });

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers?.location;
      if (!location) {
        throw new Error(`Redirect without Location header from ${currentUrl}`);
      }
      currentUrl = new URL(location, currentUrl).href;
      continue;
    }

    return { response, finalUrl: currentUrl };
  }

  throw new Error(`Too many redirects starting from ${url}`);
}

type JsonLdValue =
  | string
  | number
  | boolean
  | null
  | JsonLdValue[]
  | { [key: string]: JsonLdValue };

type JsonLdNode = { [key: string]: JsonLdValue };

function isJsonLdNode(value: JsonLdValue): value is JsonLdNode {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function findProduct(obj: JsonLdValue): JsonLdNode | null {
  if (!obj || typeof obj !== "object") return null;

  if (Array.isArray(obj)) {
    for (const item of obj) {
      const found = findProduct(item);
      if (found) return found;
    }
    return null;
  }

  const type = obj["@type"];
  const isProductType =
    type === "Product" ||
    type === "ProductGroup" ||
    (Array.isArray(type) && (type.includes("Product") || type.includes("ProductGroup"))) ||
    (typeof type === "string" && (type.includes("Product") || type.includes("ProductGroup")));

  if (isProductType) {
    return obj;
  }

  for (const key in obj) {
    const found = findProduct(obj[key]);
    if (found) return found;
  }

  return null;
}

function cleanPriceString(price?: unknown, currency?: string): string {
  if (price === null || price === undefined || price === "" || typeof price === "boolean" || typeof price === "object") return "";
  let str = String(price).trim();
  if (
    str.toLowerCase().includes("request") ||
    str === "0" ||
    str === "$0" ||
    str === "0.00" ||
    str === "₹0"
  ) {
    return "";
  }

  const curr = currency || (str.match(/INR|USD|EUR|GBP|₹|\$|€|£/i)?.[0]);
  if (!str.includes("₹") && !str.includes("$") && !str.includes("€") && !str.includes("£") && !str.includes("Rs")) {
    if (curr === "INR" || curr === "₹") {
      str = `₹${str}`;
    } else if (curr === "USD" || curr === "$") {
      str = `$${str}`;
    } else if (curr === "EUR" || curr === "€") {
      str = `€${str}`;
    } else if (curr === "GBP" || curr === "£") {
      str = `£${str}`;
    } else if (curr) {
      str = `${str} ${curr}`;
    }
  }

  return str;
}

async function extractProductFromPage(
  html: string,
  text: string,
  url: string,
): Promise<Product | null> {
  try {
    if (url.includes("/products/")) {
      try {
        const cleanUrl = url.split("?")[0].replace(/\/$/, "");
        const jsonUrl = `${cleanUrl}.json`;
        const { response: res } = await safeGet<{ product?: ShopifyProductJson }>(jsonUrl, {
          timeout: 4000,
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Linux; Android 13; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36",
            Accept: "application/json",
          },
        });
        if (res.data && res.data.product) {
          const sp = res.data.product;
          const variant = sp.variants?.[0];
          const rawPrice = variant?.price;
          const isIndia = url.includes(".in") || url.includes("india");
          const currency = isIndia ? "INR" : "USD";
          const formattedPrice = cleanPriceString(rawPrice, currency);

          const image = sp.image?.src || sp.images?.[0]?.src || "";
          const brand = sp.vendor || undefined;
          const category = sp.product_type || undefined;

          let optColor: string | undefined;
          let optSize: string | undefined;
          if (Array.isArray(sp.options)) {
            for (const opt of sp.options) {
              const nameLower = String(opt.name || "").toLowerCase();
              if (nameLower.includes("color") || nameLower.includes("colour")) {
                optColor = opt.values?.join(", ");
              }
              if (nameLower.includes("size")) {
                optSize = opt.values?.join(", ");
              }
            }
          }

          if (sp.title) {
            return {
              name: String(sp.title).trim(),
              price: formattedPrice,
              currency,
              image,
              image_url: image,
              url: cleanUrl,
              description: sp.body_html
                ? String(sp.body_html).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").substring(0, 300).trim()
                : "",
              brand,
              category,
              metadata: {
                brand,
                category,
                color: optColor,
                size: optSize,
                inStock: variant ? variant.available !== false : true,
              },
            };
          }
        }
      } catch {}
    }

    const $ = cheerio.load(html);

    const specs: Record<string, string> = {};
    const tableNodes = $(
      "table tr, .product-overview tr, .po-expander tr, #productDetails_techSpec_section_1 tr, .tech-specs tr, .specifications tr, .specs-table tr",
    );
    if (tableNodes && typeof tableNodes.each === "function") {
      tableNodes.each((_, tr) => {
        const key = $(tr)
          .find("th, td.a-span3, td.label, .a-text-bold, td:first-child")
          .first()
          .text()
          .trim()
          .toLowerCase()
          .replace(/[:\n]/g, "");
        const val = $(tr)
          .find("td.a-span9, td.value, td:last-child")
          .first()
          .text()
          .trim();
        if (key && val && key !== val && key.length < 50 && val.length < 300) {
          specs[key] = val;
        }
      });
    }

    const tableBrand =
      specs["brand name"] ||
      specs["brand"] ||
      specs["manufacturer"] ||
      specs["byline"] ||
      "";
    const tableColor =
      specs["colour"] ||
      specs["color"] ||
      specs["shade"] ||
      "";
    const tableSize =
      specs["in size"] ||
      specs["size"] ||
      specs["garment size"] ||
      "";
    const tableStyle =
      specs["fitting type"] ||
      specs["style name"] ||
      specs["top-style"] ||
      specs["fit"] ||
      specs["style"] ||
      "";
    const tableMaterial =
      specs["fabric type"] ||
      specs["material type"] ||
      specs["material"] ||
      specs["fabric"] ||
      "";
    const tableCategory =
      specs["item type name"] ||
      specs["shirt form type"] ||
      specs["category"] ||
      specs["item type"] ||
      "";

    let jsonLdProduct: JsonLdNode | null = null;
    $("script[type='application/ld+json']").each((_, el) => {
      try {
        const content = $(el).html();
        if (!content) return;
        const json = JSON.parse(content) as JsonLdValue;

        const p = findProduct(json);
        if (p) jsonLdProduct = p;
      } catch {}
    });

    const productNode = jsonLdProduct as JsonLdNode | null;
    if (productNode) {
      const name =
        typeof productNode.name === "string" ? productNode.name : undefined;

      let price = "";
      let currency = "";
      let inStock = true;

      let offersRaw = productNode.offers;
      if (!offersRaw && Array.isArray(productNode.hasVariant) && productNode.hasVariant.length > 0) {
        const firstVar = productNode.hasVariant[0];
        if (isJsonLdNode(firstVar)) {
          offersRaw = firstVar.offers || firstVar;
        }
      }

      if (offersRaw) {
        const offers = Array.isArray(offersRaw) ? offersRaw[0] : offersRaw;
        if (isJsonLdNode(offers)) {
          if (typeof offers.price !== "undefined") {
            currency =
              typeof offers.priceCurrency === "string"
                ? offers.priceCurrency
                : "";
            price = cleanPriceString(offers.price, currency);
          }
          if (typeof offers.availability === "string") {
            inStock = !offers.availability.toLowerCase().includes("outofstock");
          }
        }
      }

      let image = "";
      const images: string[] = [];
      if (productNode.image) {
        const imageRaw = productNode.image;
        const imgList = Array.isArray(imageRaw) ? imageRaw : [imageRaw];
        for (const imgItem of imgList) {
          const rawImg = isJsonLdNode(imgItem) ? imgItem.url : imgItem;
          if (typeof rawImg === "string") {
            try {
              const fullUrl = new URL(rawImg, url).href;
              images.push(fullUrl);
              if (!image) image = fullUrl;
            } catch {
              images.push(rawImg);
              if (!image) image = rawImg;
            }
          }
        }
      }

      const description =
        typeof productNode.description === "string"
          ? productNode.description
          : "";

      let brand = tableBrand;
      if (!brand && productNode.brand) {
        brand =
          typeof productNode.brand === "string"
            ? productNode.brand
            : isJsonLdNode(productNode.brand) &&
                typeof productNode.brand.name === "string"
              ? productNode.brand.name
              : "";
      }

      const category =
        typeof productNode.category === "string"
          ? productNode.category
          : typeof productNode.categoryName === "string"
            ? productNode.categoryName
            : tableCategory || undefined;

      const color =
        typeof productNode.color === "string"
          ? productNode.color
          : tableColor || undefined;
      const size =
        typeof productNode.size === "string"
          ? productNode.size
          : tableSize || undefined;
      const material =
        typeof productNode.material === "string"
          ? productNode.material
          : tableMaterial || undefined;

      if (name) {
        return {
          name: name.trim(),
          price: cleanPriceString(price, currency),
          currency: currency || undefined,
          image: image || "",
          image_url: image || "",
          images: images.length > 0 ? images : undefined,
          url,
          description: description.substring(0, 300).trim(),
          category: category ? category.trim() : undefined,
          brand: brand ? brand.trim() : undefined,
          available: inStock,
          metadata: {
            brand: brand ? brand.trim() : undefined,
            category: category ? category.trim() : undefined,
            color: color ? color.trim() : undefined,
            size: size ? size.trim() : undefined,
            style: tableStyle || undefined,
            material: material ? material.trim() : undefined,
            inStock,
            type: category || undefined,
            specifications: Object.keys(specs).length > 0 ? specs : undefined,
          },
        };
      }
    }

    const ogType = $("meta[property='og:type']").attr("content");
    const isProductType =
      ogType === "product" ||
      ogType?.includes?.("product") ||
      url.includes("/product/") ||
      url.includes("/products/") ||
      url.includes("/shop/");
    if (isProductType) {
      const name =
        $("meta[property='og:title']").attr("content") || $("title").text();
      let image = "";
      const rawImg = $("meta[property='og:image']").attr("content") || "";
      if (rawImg) {
        try {
          image = new URL(rawImg, url).href;
        } catch {
          image = rawImg;
        }
      }
      const description =
        $("meta[property='og:description']").attr("content") || "";
      let price =
        $("meta[property='product:price:amount']").attr("content") || "";
      const currency =
        $("meta[property='product:price:currency']").attr("content") || "";
      if (price && currency) {
        price = `${price} ${currency}`;
      }

      const brand =
        tableBrand ||
        $("meta[property='product:brand']").attr("content") ||
        $("meta[name='brand']").attr("content") ||
        undefined;
      const category =
        tableCategory ||
        $("meta[property='product:category']").attr("content") ||
        $("meta[name='category']").attr("content") ||
        undefined;
      const color =
        tableColor ||
        $("meta[property='product:color']").attr("content") ||
        undefined;
      const size =
        tableSize ||
        $("meta[property='product:size']").attr("content") ||
        undefined;
      const material =
        tableMaterial ||
        $("meta[property='product:material']").attr("content") ||
        undefined;

      if (
        name &&
        name !== "Product" &&
        !name.includes("Error") &&
        !name.includes("Page not found")
      ) {
        return {
          name: String(name).replace(/\s+/g, " ").trim(),
          price: cleanPriceString(price, currency),
          currency: currency || undefined,
          image: image || "",
          image_url: image || "",
          url,
          description: description
            .replace(/\s+/g, " ")
            .substring(0, 300)
            .trim(),
          category: category?.trim(),
          brand: brand?.trim(),
          metadata: {
            brand: brand?.trim(),
            category: category?.trim(),
            color: color?.trim(),
            size: size?.trim(),
            style: tableStyle || undefined,
            material: material?.trim(),
            specifications: Object.keys(specs).length > 0 ? specs : undefined,
          },
        };
      }
    }

    const domTitle =
      $("#title").text().trim() ||
      $("#productTitle").text().trim() ||
      $(".product-title").text().trim() ||
      $("h1.product-single__title").text().trim() ||
      $("[itemprop='name']").text().trim() ||
      $("h1").first().text().trim();

    if (domTitle && domTitle.length > 2 && !domTitle.includes("Robot Check") && !domTitle.includes("CAPTCHA")) {
      const domPriceSelectors = [
        ".priceToPay .a-offscreen",
        ".apexPriceToPay .a-offscreen",
        "#corePriceDisplay_desktop_feature_div .a-price .a-offscreen",
        "#corePrice_desktop .a-offscreen",
        "#corePrice_feature_div .a-offscreen",
        ".a-price .a-offscreen",
        "#priceblock_ourprice",
        "#priceblock_dealprice",
        ".priceBlock .a-price-whole",
        ".a-price-whole",
        "[itemprop='price']",
        ".price-item--regular",
        ".product-price",
        ".current-price",
        ".offer-price",
      ];

      let domPrice = "";
      for (const sel of domPriceSelectors) {
        const txt = $(sel).first().text().trim();
        if (txt) {
          domPrice = txt;
          break;
        }
      }

      if (!domPrice && $(".a-price-whole").first().length > 0) {
        const whole = $(".a-price-whole").first().text().trim();
        const symbol = $(".a-price-symbol").first().text().trim() || "₹";
        domPrice = `${symbol}${whole}`;
      }

      if (!domPrice) {
        const priceMatch = html.match(/(?:₹|Rs\.?|INR|\$|€|£)\s*[\d,]+(?:\.\d{2})?/i);
        if (priceMatch) {
          domPrice = priceMatch[0];
        }
      }

      const domImage =
        $("#landingImage").attr("src") ||
        $("#landingImage").attr("data-old-hires") ||
        $("img[data-old-hires]").first().attr("data-old-hires") ||
        $("#imgBlkFront").attr("src") ||
        $(".product-single__photo img").first().attr("src") ||
        $(".image-wrapper img").first().attr("src") ||
        $("meta[property='og:image']").attr("content") ||
        "";

      const domBrand =
        tableBrand ||
        $("#bylineInfo")
          .text()
          .replace(/^Brand:\s*|^Visit the\s*|\s*Store$/gi, "")
          .trim() ||
        $(".po-brand .a-span9").text().trim() ||
        undefined;

      const domColor =
        tableColor ||
        $("#variation_color_name .selection").text().trim() ||
        $(".po-color .a-span9").text().trim() ||
        undefined;

      const domSize =
        tableSize ||
        $("#variation_size_name .selection").text().trim() ||
        $(".po-size .a-span9").text().trim() ||
        undefined;

      const domStyle =
        tableStyle ||
        $("#variation_style_name .selection").text().trim() ||
        undefined;

      const domMaterial =
        tableMaterial ||
        $(".po-material .a-span9").text().trim() ||
        $(".po-fabric_type .a-span9").text().trim() ||
        undefined;

      const domCategory = tableCategory || undefined;

      const domDescription =
        $("#feature-bullets ul").text().replace(/\s+/g, " ").trim() ||
        $("#productDescription").text().replace(/\s+/g, " ").trim() ||
        "";

      let absImg = domImage;
      if (domImage && !domImage.startsWith("http")) {
        try {
          absImg = new URL(domImage, url).href;
        } catch {}
      }

      return {
        name: domTitle.replace(/\s+/g, " ").trim(),
        price: cleanPriceString(domPrice),
        image: absImg,
        image_url: absImg,
        url,
        description: domDescription.substring(0, 300).trim(),
        brand: domBrand,
        category: domCategory,
        metadata: {
          brand: domBrand,
          category: domCategory,
          color: domColor,
          size: domSize,
          style: domStyle,
          material: domMaterial,
          inStock: true,
          specifications: Object.keys(specs).length > 0 ? specs : undefined,
        },
      };
    }

    const isAmazonUrl =
      /amazon\.(in|com|co\.uk|de|fr|ca|com\.au|es|it)\/(.+)/i.test(url) ||
      /amzn\.in\/(.+)/i.test(url);

    const isLikelyProductPage =
      isAmazonUrl ||
      url.includes("/product/") ||
      url.includes("/products/") ||
      url.includes("/p/") ||
      url.includes("/dp/") ||
      url.includes("/shop/") ||
      text.toLowerCase().includes("price") ||
      text.toLowerCase().includes("add to cart") ||
      text.toLowerCase().includes("buy now");

    if (isLikelyProductPage) {
      const contextText = text.substring(0, 3000);
      const imgUrls: string[] = [];
      $("img").each((_, el) => {
        const src = $(el).attr("src") || $(el).attr("data-src");
        if (src) {
          try {
            const absoluteSrc = new URL(src, url).href;
            if (
              !absoluteSrc.includes("logo") &&
              !absoluteSrc.includes("icon") &&
              !absoluteSrc.includes("captcha")
            ) {
              imgUrls.push(absoluteSrc);
            }
          } catch {}
        }
      });

      const asinMatch =
        url.match(/\/dp\/([A-Z0-9]{10})/i) ||
        url.match(/\/gp\/product\/([A-Z0-9]{10})/i);
      const asin = asinMatch ? asinMatch[1] : null;
      if (asin) {
        imgUrls.unshift(
          `https://images-na.ssl-images-amazon.com/images/P/${asin}.01.MAIN._SCRMZZZZZZ_.jpg`,
        );
      }

      const modelName = process.env.GEMINI_MODEL || "gemini-2.5-flash-lite";
      const { object } = await generateObject({
        model: google(modelName),
        schema: z.object({
          isProduct: z
            .boolean()
            .describe(
              "Whether this text or URL is describing a specific product for sale",
            ),
          name: z.string().optional().describe("Actual product name"),
          price: z
            .string()
            .optional()
            .describe("Actual product price with currency as found in page text or specifications"),
          description: z
            .string()
            .optional()
            .describe("Product description or key highlights"),
          category: z
            .string()
            .optional()
            .describe("General category of the product, e.g. Apparel, Electronics, Footwear"),
          subCategory: z
            .string()
            .optional()
            .describe("Specific subcategory, e.g. Hoodie, T-Shirt, Headphones, Sneakers"),
          brand: z.string().optional().describe("Brand or manufacturer"),
          color: z.string().optional().describe("Available color"),
          size: z.string().optional().describe("Available size"),
          material: z.string().optional().describe("Material or fabric"),
          style: z.string().optional().describe("Style or fit, e.g. Oversized, Slim fit, Wireless"),
          features: z
            .array(z.string())
            .optional()
            .describe("Key features, highlights, or specifications"),
        }),
        prompt: `Extract the real live product details from the following webpage content and specifications:
Webpage URL: ${url}
Technical Specifications:
${JSON.stringify(specs, null, 2)}

Content:
${contextText}

Images found on page:
${imgUrls.slice(0, 5).join("\n")}`,
      });

      if (object.isProduct && object.name) {
        const image = imgUrls[0] || "";
        const cleanProductUrl = asin
          ? `https://www.amazon.in/dp/${asin}`
          : url;

        return {
          name: object.name.trim(),
          price: cleanPriceString(object.price) || tableBrand ? cleanPriceString(object.price) : "",
          image,
          image_url: image,
          url: cleanProductUrl,
          description: object.description
            ? object.description.substring(0, 300).trim()
            : "",
          category: object.category?.trim() || tableCategory || undefined,
          subCategory: object.subCategory?.trim(),
          brand: object.brand?.trim() || tableBrand || undefined,
          metadata: {
            brand: object.brand?.trim() || tableBrand || undefined,
            color: object.color?.trim() || tableColor || undefined,
            size: object.size?.trim() || tableSize || undefined,
            material: object.material?.trim() || tableMaterial || undefined,
            style: object.style?.trim() || tableStyle || undefined,
            features: object.features,
            type: object.subCategory?.trim() || object.category?.trim() || tableCategory || undefined,
            specifications: Object.keys(specs).length > 0 ? specs : undefined,
          },
        };
      }
    }
  } catch (err) {
    console.error("Error in extractProductFromPage:", err);
  }
  return null;
}

export async function crawlWebsite(
  startUrl: string,
  publicKey: string,
  maxPages = 40,
  extractProducts = false,
): Promise<{ collectedText: string; products: Product[] }> {
  const isStartSafe = await isSafePublicUrl(startUrl);
  if (!isStartSafe) {
    console.warn(`[SSRF Guard] Blocked unsafe startUrl: ${startUrl}`);
    return { collectedText: "", products: [] };
  }

  const visited = new Set<string>();
  const queue: string[] = [startUrl];

  let collectedText = "";
  const products: Product[] = [];

  const baseDomain = new URL(startUrl).hostname;

  let activeDomain = baseDomain;

  while (queue.length > 0 && visited.size < maxPages) {
    const url = queue.shift();
    if (!url) continue;

    const isUrlSafe = await isSafePublicUrl(url);
    if (!isUrlSafe) {
      continue;
    }

    try {
      if (!extractProducts) {
        const db = await getDb();
        const existing = await db
          .getRepository<CrawledPage>("CrawledPage")
          .exists({
            where: { bot_public_key: publicKey, page_url: url },
          });

        if (existing) {
          continue;
        }
      }
    } catch {}

    let requestUrl = url;
    const isAmazon = /amazon\.(in|com|co\.uk|de|fr|ca|com\.au|es|it)/i.test(url);
    if (isAmazon) {
      const asinMatch =
        url.match(/\/dp\/([A-Z0-9]{10})/i) ||
        url.match(/\/gp\/product\/([A-Z0-9]{10})/i);
      if (asinMatch) {
        const domainMatch = url.match(/(https?:\/\/[^\/]+)/i);
        const origin = domainMatch ? domainMatch[1] : "https://www.amazon.in";
        requestUrl = `${origin}/dp/${asinMatch[1]}`;
      }
    }

    try {
      const { response, finalUrl } = await safeGet<string>(requestUrl, {
        timeout: 15000,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Linux; Android 13; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36",
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9,hi;q=0.8",
          "Accept-Encoding": "gzip, deflate, br",
          "Upgrade-Insecure-Requests": "1",
        },
      });

      const html = response.data;

      try {
        const finalHost = new URL(finalUrl).hostname;
        if (finalHost && finalHost !== activeDomain) {
          activeDomain = finalHost;
        }
      } catch {}

      visited.add(url);
      if (finalUrl !== url) visited.add(finalUrl);

      try {
        const db = await getDb();
        const crawledRepo = db.getRepository<CrawledPage>("CrawledPage");
        const newCrawled = crawledRepo.create({
          bot_public_key: publicKey,
          page_url: url,
        });
        await crawledRepo.save(newCrawled);
      } catch {}

      const $ = cheerio.load(html);

      $("script, style, noscript").remove();

      let text = $("main").text() || $("article").text() || $("body").text();
      text = text.replace(/\s+/g, " ").trim();
      collectedText += "\n\n" + text;

      if (extractProducts) {
        const prod = await extractProductFromPage(html, text, finalUrl);
        if (prod) {
          const isDup = products.some(
            (p) =>
              p.name.toLowerCase() === prod.name.toLowerCase() ||
              (p.url && p.url === prod.url),
          );
          if (!isDup) {
            products.push(prod);
          }
        }
      }

      const IGNORED_PATH_PATTERNS = [
        /\/help\b/i,
        /\/privacy\b/i,
        /\/terms\b/i,
        /\/conditions\b/i,
        /\/legal\b/i,
        /\/policy\b/i,
        /\/customer\/display/i,
        /\/login\b/i,
        /\/signin\b/i,
        /\/sign-in\b/i,
        /\/signup\b/i,
        /\/sign-up\b/i,
        /\/register\b/i,
        /\/cart\b/i,
        /\/checkout\b/i,
        /\/account\b/i,
        /\/my-account\b/i,
        /\/wishlist\b/i,
        /\/orders\b/i,
        /\/contact\b/i,
        /\/careers\b/i,
        /\/feedback\b/i,
        /\.(pdf|zip|tar|gz|exe|apk|dmg|iso|mp4|avi|mov|mp3|wav|png|jpg|jpeg|gif|webp|svg|css|js)(\?.*)?$/i,
      ];

      $("a").each((_, el) => {
        const href = $(el).attr("href");
        if (!href) return;

        try {
          const absoluteUrl = new URL(href, finalUrl).href;
          const urlObj = new URL(absoluteUrl);
          const hostname = urlObj.hostname;
          const pathname = urlObj.pathname;

          const isSameDomain =
            hostname === baseDomain ||
            hostname === activeDomain ||
            hostname.endsWith("." + baseDomain) ||
            hostname.endsWith("." + activeDomain);

          if (!isSameDomain || visited.has(absoluteUrl) || queue.includes(absoluteUrl)) {
            return;
          }

          if (IGNORED_PATH_PATTERNS.some((pattern) => pattern.test(pathname + urlObj.search))) {
            return;
          }

          const isProductLike =
            /\/dp\/|\/gp\/product\/|\/product\/|\/products\/|\/p\/|\/item\/|\/items\/|\/buy\//i.test(
              pathname,
            );

          if (extractProducts && isProductLike) {
            queue.unshift(absoluteUrl);
          } else {
            queue.push(absoluteUrl);
          }
        } catch {}
      });
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.warn(`[crawler] Could not fetch ${url}: ${errMsg}`);
    }
  }

  return { collectedText, products };
}
