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
    .leftJoin("conversations", "c", "c.bot_id = b.id")
    .select([
        "b.id AS bot_id",
        "b.name AS bot_name",
        "COUNT(c.id) AS total_conversations",
        "SUM(c.message_count) AS total_messages",
        "COUNT(c.id) FILTER (WHERE c.created_at >= NOW() - INTERVAL '7 days') AS conversations_this_week",
        "COUNT(c.id) FILTER (WHERE c.created_at >= NOW() - INTERVAL '30 days') AS conversations_this_month"
    ])
    .where("b.user_id = :userId", { userId: user.id })
    .groupBy("b.id")
    .addGroupBy("b.name")
    .orderBy("total_conversations", "DESC")
    .getRawMany();

  const leadsPerBot = await db.getRepository(Bot)
    .createQueryBuilder("b")
    .leftJoin("leads", "l", "l.bot_id = b.id")
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

  const monthlyTrend = await db.query(
    `WITH convo_trend AS (
       SELECT
         DATE_TRUNC('month', c.created_at) AS month_date,
         COUNT(c.id) AS conversations
       FROM conversations c
       JOIN bots b ON b.id = c.bot_id
       WHERE b.user_id = $1
         AND c.created_at >= NOW() - INTERVAL '6 months'
       GROUP BY 1
     ),
     lead_trend AS (
       SELECT
         DATE_TRUNC('month', l.created_at) AS month_date,
         COUNT(l.id) AS leads
       FROM leads l
       JOIN bots b ON b.id = l.bot_id
       WHERE b.user_id = $1
         AND l.created_at >= NOW() - INTERVAL '6 months'
       GROUP BY 1
     ),
     all_months AS (
       SELECT month_date FROM convo_trend
       UNION
       SELECT month_date FROM lead_trend
     )
     SELECT 
       TO_CHAR(m.month_date, 'Mon YY') AS month,
       COALESCE(ct.conversations, 0)::int AS conversations,
       COALESCE(lt.leads, 0)::int AS leads
     FROM all_months m
     LEFT JOIN convo_trend ct ON ct.month_date = m.month_date
     LEFT JOIN lead_trend lt ON lt.month_date = m.month_date
     ORDER BY m.month_date`,
    [user.id],
  );

  const totals = await db.getRepository(Bot)
    .createQueryBuilder("b")
    .leftJoin("conversations", "c", "c.bot_id = b.id")
    .leftJoin("leads", "l", "l.bot_id = b.id")
    .select([
        "COUNT(DISTINCT c.id) AS total_conversations",
        "COALESCE(SUM(c.message_count), 0) AS total_messages",
        "COUNT(DISTINCT l.id) AS total_leads"
    ])
    .where("b.user_id = :userId", { userId: user.id })
    .getRawOne();

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
