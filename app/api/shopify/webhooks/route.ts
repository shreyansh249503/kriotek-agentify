import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

interface ShopifyProduct {
  shopify_id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  image?: string;
  image_url: string | null;
  images?: string[];
  url: string;
  available: boolean;
  category?: string;
  brand?: string;
  variants?: Array<{
    id?: string | number;
    title?: string;
    price?: number;
    sku?: string;
    available?: boolean;
    color?: string;
    size?: string;
    style?: string;
    material?: string;
  }>;
  metadata?: Record<string, unknown>;
}

interface ShopifyWebhookProductPayload {
  id: number | string;
  title: string;
  body_html: string | null;
  handle: string;
  product_type?: string;
  vendor?: string;
  tags?: string | string[];
  options?: Array<{
    name: string;
    values: string[];
  }>;
  variants?: Array<{
    id?: number | string;
    title?: string;
    price?: string;
    sku?: string;
    inventory_quantity?: number;
    option1?: string | null;
    option2?: string | null;
    option3?: string | null;
  }>;
  images?: Array<{
    src: string;
  }>;
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();

    const hmacHeader = req.headers.get("x-shopify-hmac-sha256");
    if (!isValidWebhookHmac(rawBody, hmacHeader)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const shop = req.headers.get("x-shopify-shop-domain");
    const topic = req.headers.get("x-shopify-topic");

    if (!shop || !topic) {
      return NextResponse.json({ error: "Missing headers" }, { status: 400 });
    }

    const payload = JSON.parse(rawBody) as ShopifyWebhookProductPayload;

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: storeData } = await supabase
      .from("shopify_stores")
      .select("bot_id, access_token")
      .eq("shop", shop)
      .single();

    if (!storeData?.bot_id) {
      return NextResponse.json({ ok: true });
    }

    const { bot_id } = storeData;

    const { data: botData } = await supabase
      .from("bots")
      .select("ecommerce_products")
      .eq("id", bot_id)
      .single();

    let products: ShopifyProduct[] = (botData?.ecommerce_products as ShopifyProduct[]) ?? [];
    const shopifyGid = `gid://shopify/Product/${payload.id}`;

    switch (topic) {
      case "products/create":
      case "products/update": {
        const updated = mapWebhookProduct(payload, shop);
        const existingIndex = products.findIndex(
          (p) => p.shopify_id === shopifyGid
        );

        if (existingIndex >= 0) {
          products[existingIndex] = updated; 
        } else {
          products.push(updated);            
        }
        break;
      }

      case "products/delete": {
        products = products.filter((p) => p.shopify_id !== shopifyGid);
        break;
      }

      case "app/uninstalled": {
        await supabase.from("shopify_stores").delete().eq("shop", shop);
        return NextResponse.json({ ok: true });
      }
    }

    await supabase
      .from("bots")
      .update({ ecommerce_products: products })
      .eq("id", bot_id);

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Error handling Shopify webhook:", e);
    const errorMessage = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: "Webhook handling failed", details: errorMessage }, { status: 500 });
  }
}

function mapWebhookProduct(payload: ShopifyWebhookProductPayload, shop: string): ShopifyProduct {
  const variant = payload.variants?.[0];
  const image = payload.images?.[0];
  const allImages = payload.images?.map((img) => img.src) || [];

  const rawTags = payload.tags;
  const tagsList = typeof rawTags === "string"
    ? rawTags.split(",").map((t) => t.trim()).filter(Boolean)
    : Array.isArray(rawTags)
      ? rawTags
      : [];

  const colors = payload.options
    ?.find((o) => /color|colour/i.test(o.name))
    ?.values ?? [];
  const sizes = payload.options
    ?.find((o) => /size/i.test(o.name))
    ?.values ?? [];
  const materials = payload.options
    ?.find((o) => /material/i.test(o.name))
    ?.values ?? [];
  const styles = payload.options
    ?.find((o) => /style|fit/i.test(o.name))
    ?.values ?? [];

  const isAvailable = Array.isArray(payload.variants)
    ? payload.variants.some((v) => typeof v.inventory_quantity === "number" ? v.inventory_quantity > 0 : true)
    : typeof variant?.inventory_quantity === "number" ? variant.inventory_quantity > 0 : false;

  const mappedVariants = payload.variants?.map((v) => ({
    id: v.id,
    title: v.title,
    price: parseFloat(v.price ?? "0"),
    sku: v.sku,
    available: typeof v.inventory_quantity === "number" ? v.inventory_quantity > 0 : true,
  }));

  return {
    shopify_id: `gid://shopify/Product/${payload.id}`,
    name: payload.title,
    description: payload.body_html?.replace(/<[^>]*>/g, "").trim() ?? "",
    price: parseFloat(variant?.price ?? "0"),
    currency: "USD", 
    image: image?.src ?? "",
    image_url: image?.src ?? null,
    images: allImages.length > 0 ? allImages : undefined,
    url: `https://${shop}/products/${payload.handle}`,
    available: isAvailable,
    category: payload.product_type || undefined,
    brand: payload.vendor || undefined,
    variants: mappedVariants,
    metadata: {
      brand: payload.vendor || undefined,
      category: payload.product_type || undefined,
      tags: tagsList.length > 0 ? tagsList : undefined,
      color: colors.length > 0 ? (colors.length === 1 ? colors[0] : colors) : undefined,
      size: sizes.length > 0 ? (sizes.length === 1 ? sizes[0] : sizes) : undefined,
      material: materials.length > 0 ? (materials.length === 1 ? materials[0] : materials) : undefined,
      style: styles.length > 0 ? (styles.length === 1 ? styles[0] : styles) : undefined,
      inStock: isAvailable,
    },
  };
}

function isValidWebhookHmac(body: string, hmac: string | null): boolean {
  const secret = process.env.SHOPIFY_API_SECRET;
  if (!hmac || !secret) return false;
  const digest = crypto
    .createHmac("sha256", secret)
    .update(body, "utf8")
    .digest("base64");
  return digest === hmac;
}
