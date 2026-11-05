import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/api/lib/supabase-admin";
import {
  verifySessionToken,
  getShopFromSession,
} from "../../lib/verifySessionToken";

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
      return NextResponse.json({ leads: [] });
    }

    const { data: leads, error } = await supabaseAdmin
      .from("leads")
      .select("*")
      .eq("bot_id", storeData.bot_id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to fetch leads for shopify:", error);
      return NextResponse.json({ error: "Failed to fetch leads" }, { status: 500 });
    }

    return NextResponse.json({ leads: leads ?? [] });
  } catch (e) {
    console.error("Error in leads GET route:", e);
    const errorMessage = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: "Internal server error", details: errorMessage }, { status: 500 });
  }
}
