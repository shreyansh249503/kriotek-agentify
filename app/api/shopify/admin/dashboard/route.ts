// app/api/shopify/admin/dashboard/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";
import {
  verifySessionToken,
  getShopFromSession,
} from "../../lib/verifySessionToken";

const { NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;

export async function GET(req: NextRequest) {
  // 1. Verify session token from App Bridge
  let session;
  try {
    session = verifySessionToken(req.headers.get("authorization"));
  } catch (e) {
    console.error("Dashboard auth failed:", e);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const shop = getShopFromSession(session);
  const supabase = createClient(
    NEXT_PUBLIC_SUPABASE_URL!,
    SUPABASE_SERVICE_ROLE_KEY!,
  );

  try {
    // 2. Get the store + linked bot
    const { data: storeData, error: storeError } = await supabase
      .from("shopify_stores")
      .select("bot_id")
      .eq("shop", shop)
      .single();

    if (storeError) {
      console.error("Failed to fetch store:", storeError);
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    let bot_id = storeData?.bot_id;

    // 3. Auto-create a bot if none is linked
    if (!bot_id) {
      const newBotId = crypto.randomUUID();
      const publicKey = `pk_${crypto.randomBytes(16).toString("hex")}`;
      const cleanShopName = shop
        .replace(".myshopify.com", "")
        .replace(/-/g, " ");
      const botName = `${cleanShopName
        .split(" ")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ")} Bot`;

      const { error: createError } = await supabase
        .from("bots")
        .insert({
          id: newBotId,
          name: botName,
          public_key: publicKey,
          user_id: `shopify:${shop}`,
          ecommerce_enabled: false,
          contact_enabled: false,
        })
        .select()
        .single();

      if (createError) {
        console.error("Failed to auto-create bot for shop:", createError);
        return NextResponse.json(
          { error: "Bot initialization failed" },
          { status: 500 },
        );
      }

      // Link store to the bot
      const { error: linkError } = await supabase
        .from("shopify_stores")
        .update({ bot_id: newBotId })
        .eq("shop", shop);

      if (linkError) {
        console.error("Failed to link bot to shopify store:", linkError);
      }

      bot_id = newBotId;
    }

    // 4. Fetch bot, conversations, leads in parallel
    const [botRes, convoRes, leadsRes] = await Promise.all([
      supabase
        .from("bots")
        .select("id, name, ecommerce_enabled, ecommerce_products")
        .eq("id", bot_id)
        .single(),
      supabase
        .from("conversations")
        .select("id", { count: "exact" })
        .eq("bot_id", bot_id),
      supabase
        .from("leads")
        .select("id", { count: "exact" })
        .eq("bot_id", bot_id),
    ]);

    return NextResponse.json({
      bot: botRes.data,
      stats: {
        total_conversations: convoRes.count ?? 0,
        total_leads: leadsRes.count ?? 0,
        products_synced: botRes.data?.ecommerce_products?.length ?? 0,
      },
      shop,
    });
  } catch (e) {
    console.error("Error in dashboard API:", e);
    const errorMessage = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      { error: "Internal server error", details: errorMessage },
      { status: 500 },
    );
  }
}
