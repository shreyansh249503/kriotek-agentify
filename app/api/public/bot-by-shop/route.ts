import { getDb } from "@/app/api/lib/db";
import { ShopifyStore } from "@/app/api/lib/entities";
import { NextRequest } from "next/server";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, ngrok-skip-browser-warning",
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

// Simple in-memory cache for bot configuration lookup by shop domain
const botCache = new Map<
  string,
  {
    data: {
      publicKey: string | null;
      name: string;
      primary_color: string;
      logo_url: string | null;
    };
    ts: number;
  }
>();

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const shop = searchParams.get("shop");

  if (!shop) {
    return Response.json(
      { error: "Missing shop parameter" },
      { status: 400, headers: corsHeaders }
    );
  }

  // Return cached result for 60 seconds
  const cached = botCache.get(shop);
  if (cached && Date.now() - cached.ts < 60_000) {
    return Response.json(cached.data, {
      headers: {
        ...corsHeaders,
        "ngrok-skip-browser-warning": "true",
      },
    });
  }

  try {
    const db = await getDb();
    const store = await db.getRepository<ShopifyStore>("ShopifyStore").findOne({
      where: { shop },
      relations: ["bot"],
    });

    if (!store || !store.bot) {
      return Response.json(
        { error: "Bot not found for this shop" },
        { status: 404, headers: corsHeaders }
      );
    }

    const bot = store.bot;
    const result = {
      publicKey: bot.public_key || null,
      name: bot.name,
      primary_color: bot.primary_color,
      logo_url: bot.logo_url || null,
    };

    botCache.set(shop, { data: result, ts: Date.now() });

    return Response.json(result, {
      headers: {
        ...corsHeaders,
        "ngrok-skip-browser-warning": "true",
      },
    });
  } catch (err) {
    console.error("Database query error in public bot-by-shop GET:", err);
    return Response.json(
      { error: "Internal server error" },
      { status: 500, headers: corsHeaders }
    );
  }
}
