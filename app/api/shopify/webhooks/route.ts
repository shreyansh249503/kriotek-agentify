// app/api/shopify/webhooks/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

interface ShopifyProduct {
  shopify_id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  image_url: string | null;
  url: string;
  available: boolean;
}

interface ShopifyWebhookProductPayload {
  id: number | string;
  title: string;
  body_html: string | null;
  handle: string;
  variants?: Array<{
    price?: string;
    inventory_quantity?: number;
  }>;
  images?: Array<{
    src: string;
  }>;
}

const {
  SHOPIFY_API_SECRET,
  NEXT_PUBLIC_SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
} = process.env;

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();

    // 1. Verify the request is genuinely from Shopify
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
      NEXT_PUBLIC_SUPABASE_URL!,
      SUPABASE_SERVICE_ROLE_KEY!
    );

    // 2. Find which bot this shop is linked to
    const { data: storeData } = await supabase
      .from("shopify_stores")
      .select("bot_id, access_token")
      .eq("shop", shop)
      .single();

    if (!storeData?.bot_id) {
      return NextResponse.json({ ok: true }); // shop not linked yet, ignore
    }

    const { bot_id } = storeData;

    // 3. Get current products from the bot
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
          products[existingIndex] = updated; // update in place
        } else {
          products.push(updated);            // new product
        }
        break;
      }

      case "products/delete": {
        products = products.filter((p) => p.shopify_id !== shopifyGid);
        break;
      }

      case "app/uninstalled": {
        // Merchant uninstalled the app — clean up
        await supabase.from("shopify_stores").delete().eq("shop", shop);
        return NextResponse.json({ ok: true });
      }
    }

    // 4. Save updated product list back to the bot
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

  return {
    shopify_id: `gid://shopify/Product/${payload.id}`,
    name: payload.title,
    description: payload.body_html?.replace(/<[^>]*>/g, "").trim() ?? "",
    price: parseFloat(variant?.price ?? "0"),
    currency: "USD", // webhook doesn't include currency — update if you store it
    image_url: image?.src ?? null,
    url: `https://${shop}/products/${payload.handle}`,
    available: typeof variant?.inventory_quantity === "number" ? variant.inventory_quantity > 0 : false,
  };
}

function isValidWebhookHmac(body: string, hmac: string | null): boolean {
  if (!hmac || !SHOPIFY_API_SECRET) return false;
  const digest = crypto
    .createHmac("sha256", SHOPIFY_API_SECRET)
    .update(body, "utf8")
    .digest("base64");
  return digest === hmac;
}
