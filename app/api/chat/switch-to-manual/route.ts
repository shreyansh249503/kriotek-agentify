import { getDb } from "@/app/api/lib/db";
import { Conversation, Bot } from "@/app/api/lib/entities";

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
    const { conversationId, publicKey } = await req.json();

    if (!conversationId || !publicKey) {
      return new Response(
        JSON.stringify({ error: "conversationId and publicKey are required" }),
        { status: 400, headers: corsHeaders }
      );
    }

    const dbInstance = await getDb();
    const bot = await dbInstance.getRepository<Bot>("Bot").findOne({
      where: { public_key: publicKey },
    });

    if (!bot) {
      return new Response(JSON.stringify({ error: "Bot not found" }), {
        status: 404,
        headers: corsHeaders,
      });
    }

    const convoRepo = dbInstance.getRepository<Conversation>("Conversation");
    let convo = await convoRepo.findOne({
      where: { id: conversationId, bot_id: bot.id },
    });

    if (!convo) {
      convo = convoRepo.create({
        id: conversationId,
        bot_id: bot.id,
        state: "manual",
        message_count: 0,
        messages: "[]",
      });
    } else {
      convo.state = "manual";
    }

    let history = [];
    try {
      history = JSON.parse(convo.messages || "[]");
    } catch {
      history = [];
    }

    history.push({
      role: "system",
      content: "Chat transferred to customer support. A representative will join you shortly.",
    });

    convo.messages = JSON.stringify(history);
    convo.message_count += 1;

    await convoRepo.save(convo);

    return new Response(JSON.stringify({ success: true, state: "manual" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[switch-to-manual] POST error:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: corsHeaders,
    });
  }
}
