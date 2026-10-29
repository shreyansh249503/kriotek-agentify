import { getDb } from "@/app/api/lib/db";
import { Conversation, Bot } from "@/app/api/lib/entities";
import { In } from "typeorm";
import { checkRateLimit } from "@/app/api/lib/rateLimit";

const MAX_HISTORY_IDS = 50;
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type Message = { role: string; content: string };

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

export async function POST(req: Request) {
  try {
    const rateLimit = await checkRateLimit(req, undefined, { scope: "public-history", ipLimit: 20, ipWindowSeconds: 60 });
    if (!rateLimit.success) {
      return new Response(JSON.stringify({ error: "Too many requests. Please try again later." }), {
        status: 429,
        headers: { ...corsHeaders, ...rateLimit.headers, "Content-Type": "application/json" },
      });
    }

    const { publicKey, conversationIds: rawIds } = await req.json();

    if (!publicKey || !Array.isArray(rawIds)) {
      return new Response(JSON.stringify({ error: "Invalid request" }), { status: 400, headers: corsHeaders });
    }

    // The widget stores newest first; only look up the most recent valid IDs.
    const conversationIds = rawIds
      .filter((id): id is string => typeof id === "string" && UUID_REGEX.test(id))
      .slice(0, MAX_HISTORY_IDS);
    if (conversationIds.length === 0) {
      return new Response(JSON.stringify([]), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const dbInstance = await getDb();
    const bot = await dbInstance.getRepository<Bot>("Bot").findOne({ where: { public_key: publicKey } });
    if (!bot) return new Response(JSON.stringify({ error: "Bot not found" }), { status: 404, headers: corsHeaders });

    const conversations = await dbInstance.getRepository<Conversation>("Conversation").find({
      where: { 
        id: In(conversationIds),
        bot_id: bot.id
      },
      order: { created_at: "DESC" },
      select: ["id", "created_at", "messages"]
    });

    const summaries = conversations.map(c => {
      let firstMessage = "";
      try {
        const msgs = (typeof c.messages === 'string' ? JSON.parse(c.messages) : c.messages) as Message[];
        if (msgs && msgs.length > 0) {
          const userMsg = msgs.find((m) => m.role === 'user');
          firstMessage = userMsg ? userMsg.content : msgs[0].content;
        }
      } catch (e) {
        console.error("Error parsing messages for summary", e);
      }
      
      return {
        id: c.id,
        created_at: c.created_at,
        snippet: firstMessage.substring(0, 60) + (firstMessage.length > 60 ? "..." : "")
      };
    });

    return new Response(JSON.stringify(summaries), { 
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    });
  } catch (error) {
    console.error("History API Error:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500, headers: corsHeaders });
  }
}
