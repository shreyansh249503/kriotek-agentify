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
    const { data: storeData } = await supabase
      .from("shopify_stores")
      .select("bot_id")
      .eq("shop", shop)
      .single();

    if (!storeData?.bot_id) {
      return NextResponse.json({ leads: [] });
    }

    const { data: leads, error } = await supabase
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
