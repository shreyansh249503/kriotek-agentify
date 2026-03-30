import { getDb } from "../lib/db";
import { Lead } from "../lib/entities";
import { getUserFromRequest } from "../lib/auth";

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
    const leads = await dataSource.getRepository(Lead).find({
      relations: ["bot"],
      where: {
        bot: {
          user_id: user.id
        }
      },
      order: {
        created_at: "DESC"
      }
    });

    const formattedLeads = leads.map(l => ({
      ...l,
      bot_name: l.bot?.name
    }));

    return new Response(JSON.stringify(formattedLeads), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[leads] GET error:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: corsHeaders,
    });
  }
}
