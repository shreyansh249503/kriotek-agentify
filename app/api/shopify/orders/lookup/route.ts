import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  lookupShopifyOrder,
  OrderLookupErrorCode,
} from "@/lib/shopify/orderLookup";

const STATUS_BY_CODE: Record<OrderLookupErrorCode, number> = {
  invalid_order_number: 400,
  verification_required: 400,
  not_configured: 404,
  // Same status for both so callers can't tell which order numbers exist.
  not_found: 404,
  verification_failed: 404,
  upstream_error: 502,
};

/**
 * POST /api/shopify/orders/lookup
 * Body: { public_key, order_number, email?, phone? }
 * An email or phone matching the order is required.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { public_key, order_number, email, phone } = body ?? {};

    if (!order_number) {
      return NextResponse.json({ error: "Order number is required." }, { status: 400 });
    }
    if (!public_key) {
      return NextResponse.json({ error: "public_key is required." }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } },
    );
    const { data: bot } = await supabase
      .from("bots")
      .select("id")
      .eq("public_key", public_key)
      .single();

    if (!bot?.id) {
      return NextResponse.json({ error: "Assistant not found." }, { status: 404 });
    }

    const result = await lookupShopifyOrder({
      botId: bot.id,
      orderNumber: String(order_number),
      email,
      phone,
    });

    if (!result.ok) {
      return NextResponse.json(
        { error: result.message, code: result.code },
        { status: STATUS_BY_CODE[result.code] },
      );
    }

    return NextResponse.json({ ok: true, journey: result.journey });
  } catch (error) {
    console.error("Error looking up Shopify order:", error);
    return NextResponse.json(
      { error: "Internal server error looking up order" },
      { status: 500 },
    );
  }
}
