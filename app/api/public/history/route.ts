import { getDb } from "@/app/api/lib/db";
import { Conversation, Bot } from "@/app/api/lib/entities";
import { In } from "typeorm";

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
    const { publicKey, conversationIds } = await req.json();

    if (!publicKey || !Array.isArray(conversationIds)) {
      return new Response(JSON.stringify({ error: "Invalid request" }), { status: 400, headers: corsHeaders });
    }

    const dbInstance = await getDb();
    const bot = await dbInstance.getRepository(Bot).findOne({ where: { public_key: publicKey } });
    if (!bot) return new Response(JSON.stringify({ error: "Bot not found" }), { status: 404, headers: corsHeaders });

    const conversations = await dbInstance.getRepository(Conversation).find({
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
        const msgs = typeof c.messages === 'string' ? JSON.parse(c.messages) : c.messages;
        if (msgs && msgs.length > 0) {
          // Get the first user message or just the first message
          const userMsg = msgs.find((m: any) => m.role === 'user');
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
