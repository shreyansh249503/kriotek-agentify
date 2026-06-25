import axios from "axios";
import * as cheerio from "cheerio";
import https from "https";
import { getDb } from "./db";
import { CrawledPage } from "./entities";
import { Product } from "../../../types/bot";
import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";

async function extractProductFromPage(
  html: string,
  text: string,
  url: string,
): Promise<Product | null> {
  try {
    const $ = cheerio.load(html);
    
    // 1. Check for JSON-LD Product schemas
    let jsonLdProduct: any = null;
    $("script[type='application/ld+json']").each((_, el) => {
      try {
        const content = $(el).html();
        if (!content) return;
        const json = JSON.parse(content);
        
        function findProduct(obj: any): any {
          if (!obj || typeof obj !== "object") return null;
          if (Array.isArray(obj)) {
            for (const item of obj) {
              const found = findProduct(item);
              if (found) return found;
            }
            return null;
          }
          if (obj["@type"] === "Product" || obj["@type"]?.includes?.("Product")) {
            return obj;
          }
          for (const key in obj) {
            const found = findProduct(obj[key]);
            if (found) return found;
          }
          return null;
        }
        
        const p = findProduct(json);
        if (p) jsonLdProduct = p;
      } catch {}
    });

    if (jsonLdProduct) {
      const name = jsonLdProduct.name;
      let price = "";
      if (jsonLdProduct.offers) {
        const offers = Array.isArray(jsonLdProduct.offers) ? jsonLdProduct.offers[0] : jsonLdProduct.offers;
        if (offers.price) {
          price = `${offers.price} ${offers.priceCurrency || ""}`.trim();
        }
      }
      let image = "";
      if (jsonLdProduct.image) {
        const rawImg = Array.isArray(jsonLdProduct.image) ? jsonLdProduct.image[0] : (typeof jsonLdProduct.image === "object" ? jsonLdProduct.image.url : jsonLdProduct.image);
        if (rawImg) {
          try {
            image = new URL(rawImg, url).href;
          } catch {
            image = rawImg;
          }
        }
      }
      const description = jsonLdProduct.description || "";
      if (name) {
        return {
          name: String(name).trim(),
          price: price || "Price on request",
          image: image || "",
          url,
          description: typeof description === "string" ? String(description).substring(0, 200).trim() : "",
        };
      }
    }

    // 2. Check for OpenGraph / meta tags
    const ogType = $("meta[property='og:type']").attr("content");
    const isProductType = ogType === "product" || ogType?.includes?.("product") || url.includes("/product/") || url.includes("/shop/");
    if (isProductType) {
      const name = $("meta[property='og:title']").attr("content") || $("title").text();
      let image = "";
      const rawImg = $("meta[property='og:image']").attr("content") || "";
      if (rawImg) {
        try {
          image = new URL(rawImg, url).href;
        } catch {
          image = rawImg;
        }
      }
      const description = $("meta[property='og:description']").attr("content") || "";
      let price = $("meta[property='product:price:amount']").attr("content") || "";
      const currency = $("meta[property='product:price:currency']").attr("content") || "";
      if (price && currency) {
        price = `${price} ${currency}`;
      }
      
      if (name && name !== "Product" && !name.includes("Error") && !name.includes("Page not found")) {
        return {
          name: String(name).replace(/\s+/g, " ").trim(),
          price: price || "Price on request",
          image: image || "",
          url,
          description: description.replace(/\s+/g, " ").substring(0, 200).trim(),
        };
      }
    }

    // 3. LLM fallback if it looks like a product page
    const pageLower = text.toLowerCase();
    const hasProductKeywords = pageLower.includes("price") || pageLower.includes("add to cart") || pageLower.includes("buy now") || pageLower.includes("$") || pageLower.includes("inr") || pageLower.includes("usd");
    const isLikelyProductPage = url.includes("/product/") || url.includes("/p/") || url.includes("/shop/") || (hasProductKeywords && text.length < 10000);

    if (isLikelyProductPage) {
      const contextText = text.substring(0, 3000);
      const imgUrls: string[] = [];
      $("img").each((_, el) => {
        const src = $(el).attr("src") || $(el).attr("data-src");
        if (src) {
          try {
            const absoluteSrc = new URL(src, url).href;
            if (!absoluteSrc.includes("logo") && !absoluteSrc.includes("icon")) {
              imgUrls.push(absoluteSrc);
            }
          } catch {}
        }
      });

      const { object } = await generateObject({
        model: google("gemini-2.5-flash-lite"),
        schema: z.object({
          isProduct: z.boolean().describe("Whether this text is describing a single specific product for sale"),
          name: z.string().optional().describe("Name of the product"),
          price: z.string().optional().describe("Price of the product with currency"),
          description: z.string().optional().describe("Short product description"),
        }),
        prompt: `Analyze the following webpage content and extract the product information if it represents a product details page.
Webpage URL: ${url}
Content:
${contextText}

Images found on page:
${imgUrls.slice(0, 5).join("\n")}`,
      });

      if (object.isProduct && object.name) {
        const image = imgUrls[0] || "";
        return {
          name: object.name.trim(),
          price: object.price || "Price on request",
          image,
          url,
          description: object.description ? object.description.substring(0, 200).trim() : "",
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
  const visited = new Set<string>();
  const queue: string[] = [startUrl];

  let collectedText = "";
  const products: Product[] = [];

  const baseDomain = new URL(startUrl).hostname;

  const agent =
    process.env.NODE_ENV === "development"
      ? new https.Agent({ rejectUnauthorized: false })
      : undefined;

  while (queue.length > 0 && visited.size < maxPages) {
    const url = queue.shift();
    if (!url) continue;

    const db = await getDb();
    const existing = await db.getRepository("CrawledPage").exists({
      where: { bot_public_key: publicKey, page_url: url }
    });

    if (existing) {
      console.log("Already crawled:", url);
      continue;
    }

    if (visited.has(url)) continue;

    try {
      const { data: html } = await axios.get(url, {
        httpsAgent: agent,
        timeout: 15000,
        headers: {
          "User-Agent": "Mozilla/5.0 AgentifyBot",
        },
      });

      visited.add(url);

      const crawledRepo = db.getRepository("CrawledPage");
      const newCrawled = crawledRepo.create({
        bot_public_key: publicKey,
        page_url: url
      });
      await crawledRepo.save(newCrawled);

      const $ = cheerio.load(html);

      $("script, style, noscript").remove();

      let text = $("main").text() || $("article").text() || $("body").text();
      text = text.replace(/\s+/g, " ").trim();
      collectedText += "\n\n" + text;

      // Extract product if requested
      if (extractProducts) {
        const prod = await extractProductFromPage(html, text, url);
        if (prod) {
          // Check if we already have this product to avoid duplicates
          const isDup = products.some(p => p.name.toLowerCase() === prod.name.toLowerCase() || (p.url && p.url === prod.url));
          if (!isDup) {
            products.push(prod);
          }
        }
      }

      $("a").each((_, el) => {
        const href = $(el).attr("href");
        if (!href) return;

        try {
          const absoluteUrl = new URL(href, url).href;
          const hostname = new URL(absoluteUrl).hostname;

          if (hostname === baseDomain && !visited.has(absoluteUrl)) {
            queue.push(absoluteUrl);
          }
        } catch {}
      });
    } catch (err) {
      console.log("Failed:", url, err);
    }
  }

  return { collectedText, products };
}
