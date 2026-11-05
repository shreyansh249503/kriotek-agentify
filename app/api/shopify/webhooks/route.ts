import { NextRequest, NextResponse, after } from "next/server";
import crypto from "crypto";
import { getDb } from "../../lib/db";
import { markUninstalled, redactCustomer, redactShop, sendCustomerDataExport } from "../lib/compliance";
import { applyProductWebhook, claimWebhook, PRODUCT_TOPICS } from "../lib/productWebhooks";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();

    const hmacHeader = req.headers.get("x-shopify-hmac-sha256");
    if (!isValidWebhookHmac(rawBody, hmacHeader)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const shop = req.headers.get("x-shopify-shop-domain");
    const topic = req.headers.get("x-shopify-topic");
    const webhookId = req.headers.get("x-shopify-webhook-id");

    if (!shop || !topic) {
      return NextResponse.json({ error: "Missing headers" }, { status: 400 });
    }

    const payload = JSON.parse(rawBody);

    // 1. Mandatory privacy (GDPR) webhooks and uninstall. Redact and uninstall are safe to
    //    repeat, so only the data request (which emails the merchant) is deduplicated.
    switch (topic) {
      case "customers/data_request": {
        if (!(await claimWebhook(await getDb(), { webhookId, topic, shop }))) {
          return NextResponse.json({ ok: true, duplicate: true });
        }
        const identity = { email: payload?.customer?.email, phone: payload?.customer?.phone };
        // Emailing the merchant can be slow; Shopify only needs a fast 200.
        after(() =>
          sendCustomerDataExport(shop, identity, payload?.data_request?.id).catch((err) =>
            console.error(`[webhooks] Data request export failed for ${shop}:`, err)
          )
        );
        return NextResponse.json({ ok: true });
      }
      case "customers/redact": {
        const deleted = await redactCustomer(shop, {
          email: payload?.customer?.email,
          phone: payload?.customer?.phone,
        });
        return NextResponse.json({ ok: true, deleted });
      }
      case "app/uninstalled":
        await markUninstalled(shop);
        return NextResponse.json({ ok: true });
      case "shop/redact":
        await redactShop(shop);
        return NextResponse.json({ ok: true });
    }

    // 2. Product sync
    if (!PRODUCT_TOPICS.has(topic)) {
      return NextResponse.json({ ok: true, ignored: topic });
    }
    if (payload?.id == null) {
      return NextResponse.json({ error: "Missing product id" }, { status: 400 });
    }

    const result = await applyProductWebhook({ shop, topic, webhookId, payload });
    return NextResponse.json({ ok: true, result });
  } catch (e) {
    // A 500 makes Shopify retry; the failed attempt left nothing behind.
    console.error("Error handling Shopify webhook:", e);
    return NextResponse.json({ error: "Webhook handling failed" }, { status: 500 });
  }
}

function isValidWebhookHmac(body: string, hmac: string | null): boolean {
  const secret = process.env.SHOPIFY_API_SECRET;
  if (!hmac || !secret) return false;
  try {
    const digest = crypto
      .createHmac("sha256", secret)
      .update(body, "utf8")
      .digest("base64");
    const digestBuffer = Buffer.from(digest, "utf8");
    const hmacBuffer = Buffer.from(hmac, "utf8");
    if (digestBuffer.length !== hmacBuffer.length) {
      return false;
    }
    return crypto.timingSafeEqual(digestBuffer, hmacBuffer);
  } catch {
    return false;
  }
}
