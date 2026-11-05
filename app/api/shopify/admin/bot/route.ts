import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/api/lib/supabase-admin";
import { getShopFromSession, verifySessionToken } from "../../lib/verifySessionToken";

export async function GET(req: NextRequest) {
  let session;
  try {
    session = verifySessionToken(req.headers.get("authorization"));
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const shop = getShopFromSession(session);
  try {
    const { data: storeData } = await supabaseAdmin
      .from("shopify_stores")
      .select("bot_id")
      .eq("shop", shop)
      .single();

    if (!storeData?.bot_id) {
      return NextResponse.json({ bot: null, crawled_pages: [] });
    }

    const { data: bot, error: botError } = await supabaseAdmin
      .from("bots")
      .select("*")
      .eq("id", storeData.bot_id)
      .single();

    if (botError || !bot) {
      return NextResponse.json({ error: "Bot not found" }, { status: 404 });
    }

    const { data: crawled_pages } = await supabaseAdmin
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
  try {
    const { data: storeData } = await supabaseAdmin
      .from("shopify_stores")
      .select("bot_id")
      .eq("shop", shop)
      .single();

    const body = await req.json();

    if (!storeData?.bot_id || storeData.bot_id !== body.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id, name, description, tone, primary_color, contact_enabled, contact_email, contact_prompt, ecommerce_enabled, ecommerce_prompt, logo_url } = body;
    const { data: updatedBot, error: updateError } = await supabaseAdmin
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
