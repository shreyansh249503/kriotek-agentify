import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { setupCollection } from "../../../lib/vector-db-setup";
import { getDb } from "../../../lib/db";
import { crawlWebsite } from "../../../lib/crawler";
import { chunkText } from "../../../lib/chunker";
import { ingestDocument } from "../../../lib/ingest";
import { Bot, CrawledPage } from "../../../lib/entities";
import {
  verifySessionToken,
  getShopFromSession,
} from "../../lib/verifySessionToken";


const {
  NEXT_PUBLIC_SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
} = process.env;

export async function POST(req: NextRequest) {
  await setupCollection();

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
      return NextResponse.json({ error: "No bot linked to this store" }, { status: 400 });
    }

    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: "url is required" }, { status: 400 });
    }

    const db = await getDb();
    const bot = await db.getRepository<Bot>("Bot").findOne({
      where: { id: storeData.bot_id },
    });

    if (!bot || !bot.public_key) {
      return NextResponse.json({ error: "Bot not found or missing public key" }, { status: 404 });
    }

    const publicKey = bot.public_key;

    const existing = await db.getRepository<CrawledPage>("CrawledPage").exists({
      where: { bot_public_key: publicKey, page_url: url },
    });

    if (existing) {
      return NextResponse.json({
        alreadyCrawled: true,
        message: "This URL has already been crawled",
      });
    }

    const { collectedText } = await crawlWebsite(url, publicKey, 40, false);

    if (!collectedText || collectedText.length < 200) {
      return NextResponse.json(
        { error: "No readable content found on this page" },
        { status: 400 }
      );
    }

    const chunks = chunkText(collectedText);
    console.log("Shopify Ingest Chunks Count:", chunks.length);

    const batchSize = 10;
    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, i + batchSize);
      await Promise.all(batch.map((chunk) => ingestDocument(publicKey, chunk)));
    }

    return NextResponse.json({
      success: true,
      chunksIngested: chunks.length,
    });
  } catch (e) {
    console.error("Error in Shopify ingest-url:", e);
    const errorMessage = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: "Internal server error", details: errorMessage }, { status: 500 });
  }
}
