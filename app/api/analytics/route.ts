import { getDb } from "../lib/db";
import { getUserFromRequest } from "../lib/auth";
import { Bot } from "../lib/entities";

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

  const db = await getDb();

  const convoPerBot = await db.getRepository(Bot)
    .createQueryBuilder("b")
    .leftJoin("b.conversations", "c")
    .select([
      "b.id AS bot_id",
      "b.name AS bot_name",
      "COUNT(c.id) AS total_conversations",
      "COALESCE(SUM(c.message_count), 0) AS total_messages"
    ])
    .addSelect("COUNT(c.id) FILTER (WHERE c.created_at >= NOW() - INTERVAL '7 days')", "conversations_this_week")
    .addSelect("COUNT(c.id) FILTER (WHERE c.created_at >= NOW() - INTERVAL '30 days')", "conversations_this_month")
    .where("b.user_id = :userId", { userId: user.id })
    .groupBy("b.id")
    .addGroupBy("b.name")
    .orderBy("total_conversations", "DESC")
    .getRawMany();

  const leadsPerBot = await db.getRepository(Bot)
    .createQueryBuilder("b")
    .leftJoin("b.leads", "l")
    .select([
      "b.id AS bot_id",
      "b.name AS bot_name",
      "COUNT(l.id) AS total_leads"
    ])
    .where("b.user_id = :userId", { userId: user.id })
    .groupBy("b.id")
    .addGroupBy("b.name")
    .orderBy("total_leads", "DESC")
    .getRawMany();

  // FIXED: Using generate_series guarantees no missing gaps if a month has 0 activity.
  const monthlyTrend = await db.query(
    `WITH months AS (
       SELECT generate_series(
         DATE_TRUNC('month', NOW() - INTERVAL '5 months'),
         DATE_TRUNC('month', NOW()),
         '1 month'::interval
       ) AS month_date
     ),
     convo_trend AS (
       SELECT
         DATE_TRUNC('month', c.created_at) AS month_date,
         COUNT(c.id) AS conversations
       FROM conversations c
       JOIN bots b ON b.id = c.bot_id::uuid
       WHERE b.user_id = $1
         AND c.created_at >= DATE_TRUNC('month', NOW() - INTERVAL '5 months')
       GROUP BY 1
     ),
     lead_trend AS (
       SELECT
         DATE_TRUNC('month', l.created_at) AS month_date,
         COUNT(l.id) AS leads
       FROM leads l
       JOIN bots b ON b.id = l.bot_id::uuid
       WHERE b.user_id = $1
         AND l.created_at >= DATE_TRUNC('month', NOW() - INTERVAL '5 months')
       GROUP BY 1
     )
     SELECT 
       TO_CHAR(m.month_date, 'Mon YY') AS month,
       COALESCE(ct.conversations, 0)::int AS conversations,
       COALESCE(lt.leads, 0)::int AS leads
     FROM months m
     LEFT JOIN convo_trend ct ON ct.month_date = m.month_date
     LEFT JOIN lead_trend lt ON lt.month_date = m.month_date
     ORDER BY m.month_date`,
    [user.id],
  );

  // FIXED: Avoided a Cartesian Product database call entirely by summing existing arrays
  const totals = {
    total_conversations: convoPerBot.reduce((sum, bot) => sum + Number(bot.total_conversations || 0), 0),
    total_messages: convoPerBot.reduce((sum, bot) => sum + Number(bot.total_messages || 0), 0),
    total_leads: leadsPerBot.reduce((sum, bot) => sum + Number(bot.total_leads || 0), 0)
  };

  return new Response(
    JSON.stringify({
      convosPerBot: convoPerBot,
      leadsPerBot,
      monthlyTrend,
      totals,
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
}