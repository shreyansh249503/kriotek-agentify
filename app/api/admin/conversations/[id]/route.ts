import { getDb } from "@/app/api/lib/db";
import { Conversation } from "@/app/api/lib/entities";
import { getUserFromRequest } from "@/app/api/lib/auth";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

export async function GET(
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
    const convo = await dataSource.getRepository<Conversation>("Conversation").findOne({
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

    const messages = typeof convo.messages === "string" ? JSON.parse(convo.messages) : convo.messages;

    return new Response(JSON.stringify({
      state: convo.state,
      messages,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[admin conversation get] error:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: corsHeaders,
    });
  }
}
