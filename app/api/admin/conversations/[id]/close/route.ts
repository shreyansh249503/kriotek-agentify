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
      return new Response(JSON.stringify({ error: "Conversation not found" }), {
        status: 404,
        headers: corsHeaders,
      });
    }

    convo.state = "completed";

    let history = [];
    try {
      history = typeof convo.messages === "string" ? JSON.parse(convo.messages) : convo.messages;
    } catch {
      history = [];
    }

    history.push({
      role: "system",
      content: "The support session has ended. Thank you!",
    });

    convo.messages = JSON.stringify(history);
    convo.message_count += 1;

    await convoRepo.save(convo);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[admin close] POST error:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: corsHeaders,
    });
  }
}
