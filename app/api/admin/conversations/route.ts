import { In } from "typeorm";
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

export async function GET(req: Request) {
  const user = await getUserFromRequest(req);
  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: corsHeaders,
    });
  }

  try {
    const dataSource = await getDb();
    const convos = await dataSource.getRepository<Conversation>("Conversation").find({
      relations: ["bot"],
      where: {
        state: In(["manual", "manual_takeover"]),
        bot: {
          user_id: user.id,
        },
      },
      order: {
        created_at: "DESC",
      },
    });

    const formattedConvos = convos.map((c) => {
      let snippet = "";
      try {
        const msgs = typeof c.messages === "string" ? JSON.parse(c.messages) : c.messages;
        if (Array.isArray(msgs) && msgs.length > 0) {
          const textMsgs = msgs.filter((m) => m.role === "user" || m.role === "assistant");
          if (textMsgs.length > 0) {
            snippet = textMsgs[textMsgs.length - 1].content.replace("[SHOW_SUPPORT_BUTTON]", "");
          }
        }
      } catch {
        snippet = "";
      }

      return {
        id: c.id,
        bot_id: c.bot_id,
        bot_name: c.bot?.name,
        state: c.state,
        name: c.name,
        email: c.email,
        phone: c.phone,
        snippet,
        created_at: c.created_at,
      };
    });

    return new Response(JSON.stringify(formattedConvos), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[admin conversations list] GET error:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: corsHeaders,
    });
  }
}
