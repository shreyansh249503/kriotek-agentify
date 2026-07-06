import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  verifySessionToken,
  getShopFromSession,
} from "../../lib/verifySessionToken";

const {
  NEXT_PUBLIC_SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
} = process.env;

export async function GET(req: NextRequest) {
  let session;
  try {
    session = verifySessionToken(req.headers.get("authorization"));
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const shop = getShopFromSession(session);
  const supabase = createClient(
    NEXT_PUBLIC_SUPABASE_URL!,
    SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    // 1. Get linked bot_id
    const { data: storeData } = await supabase
      .from("shopify_stores")
      .select("bot_id")
      .eq("shop", shop)
      .single();

    if (!storeData?.bot_id) {
      return NextResponse.json({ bot: null, crawled_pages: [] });
    }

    // 2. Fetch bot config
    const { data: bot, error: botError } = await supabase
      .from("bots")
      .select("*")
      .eq("id", storeData.bot_id)
      .single();

    if (botError || !bot) {
      return NextResponse.json({ error: "Bot not found" }, { status: 404 });
    }

    // 3. Fetch crawled pages using bot's public_key
    const { data: crawled_pages } = await supabase
      .from("crawled_pages")
      .select("id, page_url")
      .eq("bot_public_key", bot.public_key || "");

    return NextResponse.json({ bot, crawled_pages: crawled_pages ?? [] });
  } catch (e) {
    console.error("Error in bot GET route:", e);
    const errorMessage = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: "Internal server error", details: errorMessage }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  let session;
  try {
    session = verifySessionToken(req.headers.get("authorization"));
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const shop = getShopFromSession(session);
  const supabase = createClient(
    NEXT_PUBLIC_SUPABASE_URL!,
    SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    // 1. Verify store links to the bot being modified
    const { data: storeData } = await supabase
      .from("shopify_stores")
      .select("bot_id")
      .eq("shop", shop)
      .single();

    const body = await req.json();

    if (!storeData?.bot_id || storeData.bot_id !== body.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 2. Perform bot updates
    const { id, name, description, tone, primary_color, contact_enabled, contact_email, contact_prompt, ecommerce_enabled, ecommerce_prompt, logo_url } = body;
    const { data: updatedBot, error: updateError } = await supabase
      .from("bots")
      .update({
        name,
        description,
        tone,
        primary_color,
        contact_enabled,
        contact_email,
        contact_prompt,
        ecommerce_enabled,
        ecommerce_prompt,
        logo_url,
      })
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      console.error("Bot configuration update error:", updateError);
      return NextResponse.json({ error: "Failed to update bot config" }, { status: 500 });
    }

    return NextResponse.json({ success: true, bot: updatedBot });
  } catch (e) {
    console.error("Error in bot PATCH route:", e);
    const errorMessage = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: "Internal server error", details: errorMessage }, { status: 500 });
  }
}
