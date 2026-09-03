import { getDb } from "@/app/api/lib/db";
import { Conversation } from "@/app/api/lib/entities";
import { getUserFromRequest } from "@/app/api/lib/auth";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUserFromRequest(req);
  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: corsHeaders,
    });
  }

  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const { enabled } = body;

    if (typeof enabled !== "boolean") {
      return new Response(
        JSON.stringify({ error: "enabled (boolean) is required" }),
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    const dataSource = await getDb();
    const convoRepo = dataSource.getRepository<Conversation>("Conversation");
    const convo = await convoRepo.findOne({
      relations: ["bot"],
      where: {
        id,
        bot: {
          user_id: user.id,
        },
      },
    });

    if (!convo) {
      return new Response(
        JSON.stringify({ error: "Conversation not found" }),
        {
          status: 404,
          headers: corsHeaders,
        }
      );
    }

    // enabled === true means Human rep is taking over (AI paused)
    // enabled === false means AI is resumed (Automated)
    const newState = enabled ? "manual_takeover" : "idle";
    convo.state = newState;

    let history: Array<{ role: string; content: string; sender?: string }> = [];
    try {
      history =
        typeof convo.messages === "string"
          ? JSON.parse(convo.messages)
          : convo.messages;
    } catch {
      history = [];
    }

    const systemNotice = enabled
      ? "Support representative has taken over the chat. AI responses are currently paused."
      : "AI Assistant has resumed automated responses for this conversation.";

    history.push({
      role: "system",
      content: systemNotice,
    });

    convo.messages = JSON.stringify(history);
    convo.message_count += 1;

    await convoRepo.save(convo);

    return new Response(
      JSON.stringify({
        success: true,
        state: convo.state,
        enabled,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("[admin toggle-hitl] POST error:", error);
    return new Response(
      JSON.stringify({ error: "Internal Server Error" }),
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
}
