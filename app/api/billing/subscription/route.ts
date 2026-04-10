import { getUserFromRequest } from "../../lib/auth";
import { getOrCreateSubscription } from "../../lib/subscription";
import { PLANS, PlanId } from "../../lib/plans";
import { getDb } from "../../lib/db";
import { Bot, CrawledPage } from "../../lib/entities";

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
    return Response.json({ error: "Unauthorized" }, { status: 401, headers: corsHeaders });
  }

  const sub = await getOrCreateSubscription(user.id);
  const plan = PLANS[sub.plan as PlanId] ?? PLANS.free;

  const db = await getDb();
  const botCount = await db.getRepository(Bot).count({ where: { user_id: user.id } });
  const pageCount = await db
    .getRepository(CrawledPage)
    .createQueryBuilder("cp")
    .innerJoin(Bot, "b", "b.public_key = cp.bot_public_key")
    .where("b.user_id = :userId", { userId: user.id })
    .getCount();

  const today = new Date().toISOString().slice(0, 10);
  const messagesUsed = plan.messagesPeriod === "daily"
    ? (sub.messages_today_date === today ? sub.messages_today : 0)
    : sub.messages_this_period;

  return Response.json(
    {
      plan: sub.plan,
      status: sub.status,
      period_end: sub.period_end,
      messages_this_period: sub.messages_this_period,
      limits: {
        bots: plan.bots,
        messages: plan.messages,
        messagesPeriod: plan.messagesPeriod,
        pages: plan.pages,
      },
      usage: {
        bots: botCount,
        messages: messagesUsed,
        pages: pageCount,
      },
    },
    { headers: corsHeaders },
  );
}
