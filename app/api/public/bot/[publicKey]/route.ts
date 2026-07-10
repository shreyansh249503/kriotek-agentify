import { getDb } from "@/app/api/lib/db";
import { Bot } from "@/app/api/lib/entities";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, ngrok-skip-browser-warning",
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

const botCache = new Map<string, { data: { name: string; primary_color: string; logo_url: string | null; ecommerce_enabled: boolean }; ts: number }>();

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ publicKey: string }> },
) {
  const { publicKey } = await params;
  console.log("PUBLIC_KEY_PARAM:", publicKey);

  // Return cached result for 60 seconds
  const cached = botCache.get(publicKey);
  if (cached && Date.now() - cached.ts < 60_000) {
    return Response.json(cached.data, {
      headers: {
        ...corsHeaders,
        "ngrok-skip-browser-warning": "true",
      },
    });
  }

  const db = await getDb();
  const bot = await db.getRepository<Bot>("Bot").findOne({
    where: { public_key: publicKey },
    select: ["name", "primary_color", "logo_url", "ecommerce_enabled"],
  }).catch((err) => {
    console.error("Database query error in public bot GET:", err);
    return null;
  });

  if (!bot) {
    return Response.json({ error: "Bot not found" }, { status: 404 });
  }

  const result = {
    name: bot.name,
    primary_color: bot.primary_color,
    logo_url: bot.logo_url || null,
    ecommerce_enabled: bot.ecommerce_enabled,
  };

  botCache.set(publicKey, { data: result, ts: Date.now() });

  return Response.json(result, {
    headers: {
      ...corsHeaders,
      "ngrok-skip-browser-warning": "true",
    },
  });
}
