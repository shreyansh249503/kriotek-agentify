import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { lookupVerifiedOrder, MIN_PHONE_DIGITS } from "@/lib/shopify/orderLookup";
import { checkRateLimit } from "@/app/api/lib/rateLimit";
import { decryptToken } from "@/app/api/lib/crypto";

const { NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;

export async function POST(req: NextRequest) {
  try {
    const rateLimit = await checkRateLimit(req, undefined, { scope: "order-lookup", ipLimit: 15, ipWindowSeconds: 60 });
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: "Too many order lookup attempts. Please try again later." },
        { status: 429, headers: rateLimit.headers }
      );
    }

    const body = await req.json();
    const { bot_id, public_key, order_number, email, phone } = body;

    if (!order_number || typeof order_number !== "string") {
      return NextResponse.json(
        { error: "Order number is required." },
        { status: 400 }
      );
    }

    const supabase = createClient(
      NEXT_PUBLIC_SUPABASE_URL!,
      SUPABASE_SERVICE_ROLE_KEY!
    );

    let targetBotId = bot_id;

    if (!targetBotId && public_key) {
      const { data: bot } = await supabase
        .from("bots")
        .select("id")
        .eq("public_key", public_key)
        .single();
      if (bot) {
        targetBotId = bot.id;
      }
    }

    if (!targetBotId) {
      return NextResponse.json(
        { error: "Bot ID or public key is required." },
        { status: 400 }
      );
    }

    const { data: storeData, error: storeError } = await supabase
      .from("shopify_stores")
      .select("shop, access_token")
      .eq("bot_id", targetBotId)
      .single();

    if (storeError || !storeData?.access_token || !storeData?.shop) {
      return NextResponse.json(
        { error: "Shopify store integration not found for this assistant." },
        { status: 404 }
      );
    }

    const result = await lookupVerifiedOrder({
      shop: storeData.shop,
      accessToken: decryptToken(storeData.access_token),
      orderNumber: order_number,
      email: typeof email === "string" ? email : null,
      phone: typeof phone === "string" ? phone : null,
    });

    switch (result.status) {
      case "verification_required":
        return NextResponse.json(
          {
            error: `An email address or phone number (at least ${MIN_PHONE_DIGITS} digits) is required to verify the order.`,
            requiresVerification: true,
          },
          { status: 400 }
        );
      case "not_found":
        return NextResponse.json(
          { error: "Order not found in store." },
          { status: 404 }
        );
      case "verification_failed":
        return NextResponse.json(
          {
            error: "Verification failed",
            details: "The email or phone provided does not match records for this order.",
            requiresVerification: true,
          },
          { status: 401 }
        );
      case "found":
        return NextResponse.json({ ok: true, journey: result.journey });
    }
  } catch (error) {
    console.error("Error looking up Shopify order:", error);
    return NextResponse.json(
      { error: "Internal server error looking up order" },
      { status: 500 }
    );
  }
}
