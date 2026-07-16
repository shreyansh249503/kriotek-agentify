import { getDb } from "@/app/api/lib/db";
import { Conversation, Bot } from "@/app/api/lib/entities";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const publicKey = searchParams.get("publicKey");

    if (!id || !publicKey) {
      return new Response(JSON.stringify({ error: "Missing ID or publicKey" }), { status: 400, headers: corsHeaders });
    }

    const dbInstance = await getDb();
    const bot = await dbInstance.getRepository<Bot>("Bot").findOne({ where: { public_key: publicKey } });
    if (!bot) return new Response(JSON.stringify({ error: "Bot not found" }), { status: 404, headers: corsHeaders });

    const convo = await dbInstance.getRepository<Conversation>("Conversation").findOne({
      where: { id, bot_id: bot.id }
    });

    if (!convo) return new Response(JSON.stringify({ error: "Conversation not found" }), { status: 404, headers: corsHeaders });

    const messagesArray = typeof convo.messages === 'string' ? JSON.parse(convo.messages) : convo.messages;

    return new Response(JSON.stringify({
      state: convo.state,
      messages: messagesArray
    }), { 
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    });
  } catch (error) {
    console.error("Conversation Fetch API Error:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500, headers: corsHeaders });
  }
}
