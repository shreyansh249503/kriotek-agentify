import type { Product, ProductVariant } from "@/types/bot";

/**
 * One mapping from a Shopify product to the product stored on a bot, shared by the full
 * sync (GraphQL Admin API) and the product webhooks (REST-shaped payloads). Each source is
 * first normalized to ShopifyProductInput, so both paths produce the same output.
 */

// The sync query fetches at most this many of each; webhooks are trimmed to match.
export const MAX_PRODUCT_IMAGES = 5;
export const MAX_PRODUCT_VARIANTS = 25;

/** Used only when neither the shop nor the product says which currency it uses. */
const FALLBACK_CURRENCY = "USD";

export interface ShopifyProductInput {
  /** Product GID, e.g. gid://shopify/Product/123 */
  id: string;
  title: string;
  descriptionHtml: string | null;
  handle: string;
  /** Lower-case: active, draft, archived or unlisted. */
  status: string;
  productType?: string | null;
  vendor?: string | null;
  tags: string[];
  options: { name: string; values: string[] }[];
  images: string[];
  variants: {
    id: string;
    title?: string;
    price: string | null;
    sku?: string | null;
    available: boolean;
    selectedOptions: { name: string; value: string }[];
  }[];
  /** Lowest variant price, used when the product has no variants in the payload. */
  minPrice?: string | null;
  /** Currency reported on the product itself (GraphQL only). */
  currencyCode?: string | null;
  /** ISO timestamp of the product's last change in Shopify. */
  updatedAt?: string | null;
}

/** A product as stored in bots.ecommerce_products after a Shopify sync or webhook. */
export type ShopifyBotProduct = Product & { shopify_id: string; updated_at?: string };

// ---------------------------------------------------------------------------
// GraphQL (full sync)
// ---------------------------------------------------------------------------

export interface ShopifyGraphQLProductNode {
  id: string;
  title: string;
  descriptionHtml: string;
  handle: string;
  status: string;
  updatedAt?: string;
  productType?: string;
  vendor?: string;
  tags?: string[];
  options?: { name: string; values: string[] }[];
  priceRangeV2: {
    minVariantPrice: {
      amount: string;
      currencyCode: string;
    };
  };
  images: {
    edges: { node: { url: string; altText?: string | null } }[];
  };
  variants: {
    edges: {
      node: {
        id: string;
        title: string;
        price: string;
        availableForSale: boolean;
        sku?: string | null;
        selectedOptions?: { name: string; value: string }[];
      };
    }[];
  };
}

export function fromGraphQLProduct(node: ShopifyGraphQLProductNode): ShopifyProductInput {
  return {
    id: node.id,
    title: node.title,
    descriptionHtml: node.descriptionHtml,
    handle: node.handle,
    status: (node.status ?? "").toLowerCase(),
    productType: node.productType,
    vendor: node.vendor,
    tags: node.tags ?? [],
    options: node.options ?? [],
    images: node.images.edges.map((e) => e.node.url).slice(0, MAX_PRODUCT_IMAGES),
    variants: node.variants.edges.slice(0, MAX_PRODUCT_VARIANTS).map(({ node: v }) => ({
      id: v.id,
      title: v.title,
      price: v.price,
      sku: v.sku,
      available: v.availableForSale,
      selectedOptions: v.selectedOptions ?? [],
    })),
    minPrice: node.priceRangeV2?.minVariantPrice?.amount ?? null,
    currencyCode: node.priceRangeV2?.minVariantPrice?.currencyCode ?? null,
    updatedAt: node.updatedAt ?? null,
  };
}

// ---------------------------------------------------------------------------
// Webhooks (products/create, products/update)
// ---------------------------------------------------------------------------

export interface ShopifyWebhookProductPayload {
  id: number | string;
  title: string;
  body_html: string | null;
  handle: string;
  status?: string;
  updated_at?: string;
  product_type?: string;
  vendor?: string;
  tags?: string | string[];
  options?: { name: string; position?: number; values: string[] }[];
  variants?: {
    id?: number | string;
    title?: string;
    price?: string;
    sku?: string | null;
    inventory_quantity?: number;
    inventory_management?: string | null;
    inventory_policy?: string;
    option1?: string | null;
    option2?: string | null;
    option3?: string | null;
  }[];
  images?: { src: string; position?: number }[];
}

export function productGid(id: number | string): string {
  const value = String(id);
  return value.startsWith("gid://") ? value : `gid://shopify/Product/${value}`;
}

function variantGid(id: number | string | undefined): string {
  const value = String(id ?? "");
  return value.startsWith("gid://") ? value : `gid://shopify/ProductVariant/${value}`;
}

type WebhookVariant = NonNullable<ShopifyWebhookProductPayload["variants"]>[number];

// Mirrors GraphQL availableForSale: sellable when stock isn't tracked, overselling is
// allowed, or there is stock left.
function isWebhookVariantAvailable(v: WebhookVariant): boolean {
  if (v.inventory_policy === "continue") return true;
  if (v.inventory_management === null) return true;
  if (typeof v.inventory_quantity === "number") return v.inventory_quantity > 0;
  return true;
}

export function fromWebhookProduct(payload: ShopifyWebhookProductPayload): ShopifyProductInput {
  // option1/2/3 on each variant are the values of options[0/1/2], in position order.
  const options = [...(payload.options ?? [])].sort(
    (a, b) => (a.position ?? 0) - (b.position ?? 0),
  );
  const images = [...(payload.images ?? [])].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));

  const rawTags = payload.tags;
  const tags =
    typeof rawTags === "string"
      ? rawTags.split(",").map((t) => t.trim()).filter(Boolean)
      : Array.isArray(rawTags)
        ? rawTags
        : [];

  return {
    id: productGid(payload.id),
    title: payload.title,
    descriptionHtml: payload.body_html,
    handle: payload.handle,
    // Older payloads may omit status; treat them as live, as before.
    status: (payload.status ?? "active").toLowerCase(),
    productType: payload.product_type,
    vendor: payload.vendor,
    tags,
    options: options.map((o) => ({ name: o.name, values: o.values })),
    images: images.map((img) => img.src).slice(0, MAX_PRODUCT_IMAGES),
    variants: (payload.variants ?? []).slice(0, MAX_PRODUCT_VARIANTS).map((v) => ({
      id: variantGid(v.id),
      title: v.title,
      price: v.price ?? null,
      sku: v.sku,
      available: isWebhookVariantAvailable(v),
      selectedOptions: [v.option1, v.option2, v.option3].flatMap((value, i) =>
        value != null && options[i] ? [{ name: options[i].name, value }] : [],
      ),
    })),
    updatedAt: payload.updated_at ?? null,
  };
}

// ---------------------------------------------------------------------------
// Shared output
// ---------------------------------------------------------------------------

export function isProductActive(input: ShopifyProductInput): boolean {
  return input.status === "active";
}

const OPTION_PATTERNS = {
  color: /color|colour/i,
  size: /size/i,
  material: /material/i,
  style: /style|fit/i,
} as const;

function optionValues(input: ShopifyProductInput, pattern: RegExp): string[] {
  return input.options.find((o) => pattern.test(o.name))?.values ?? [];
}

function singleOrList(values: string[]): string | string[] | undefined {
  if (values.length === 0) return undefined;
  return values.length === 1 ? values[0] : values;
}

function stripHtml(html: string | null | undefined): string {
  return html?.replace(/<[^>]*>/g, "").trim() ?? "";
}

/**
 * @param currency The shop's currency (shopify_stores.currency). Falls back to the currency
 *   on the product, then to USD.
 */
export function toBotProduct(
  input: ShopifyProductInput,
  { shop, currency }: { shop: string; currency?: string | null },
): ShopifyBotProduct {
  const primaryImage = input.images[0] ?? null;
  const isAvailable = input.variants.some((v) => v.available);

  const variants: ProductVariant[] = input.variants.map((v) => {
    const selected = (pattern: RegExp) => v.selectedOptions.find((o) => pattern.test(o.name))?.value;
    return {
      id: v.id,
      title: v.title,
      price: parseFloat(v.price || "0"),
      sku: v.sku ?? undefined,
      available: v.available,
      color: selected(OPTION_PATTERNS.color),
      size: selected(OPTION_PATTERNS.size),
      material: selected(OPTION_PATTERNS.material),
      style: selected(OPTION_PATTERNS.style),
    };
  });

  return {
    shopify_id: input.id,
    name: input.title,
    description: stripHtml(input.descriptionHtml),
    price: parseFloat(input.variants[0]?.price ?? input.minPrice ?? "0"),
    currency: currency || input.currencyCode || FALLBACK_CURRENCY,
    image: primaryImage || "",
    image_url: primaryImage ?? undefined,
    images: input.images.length > 0 ? input.images : undefined,
    url: `https://${shop}/products/${input.handle}`,
    available: isAvailable,
    category: input.productType || undefined,
    brand: input.vendor || undefined,
    variants,
    metadata: {
      brand: input.vendor || undefined,
      category: input.productType || undefined,
      tags: input.tags.length > 0 ? input.tags : undefined,
      color: singleOrList(optionValues(input, OPTION_PATTERNS.color)),
      size: singleOrList(optionValues(input, OPTION_PATTERNS.size)),
      material: singleOrList(optionValues(input, OPTION_PATTERNS.material)),
      style: singleOrList(optionValues(input, OPTION_PATTERNS.style)),
      inStock: isAvailable,
    },
    updated_at: input.updatedAt ?? undefined,
  };
}

/** True when `incoming` is older than what is already stored, so it must not overwrite it. */
export function isOlderThan(incoming: string | null | undefined, stored: string | null | undefined): boolean {
  if (!incoming || !stored) return false;
  const a = Date.parse(incoming);
  const b = Date.parse(stored);
  if (Number.isNaN(a) || Number.isNaN(b)) return false;
  return a < b;
}
