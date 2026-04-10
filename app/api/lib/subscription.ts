import { getDb } from "./db";
import { Bot, CrawledPage, Subscription } from "./entities";
import { PLANS, PlanId } from "./plans";

/** Get or create a subscription record for a user. Always returns a valid record. */
export async function getOrCreateSubscription(userId: string): Promise<Subscription> {
  const db = await getDb();
  const repo = db.getRepository(Subscription);

  let sub = await repo.findOne({ where: { user_id: userId } });
  if (!sub) {
    sub = repo.create({ user_id: userId, plan: "free", status: "active", messages_this_period: 0 });
    sub = await repo.save(sub);
  }
  return sub;
}

/** Returns true if the user can create another bot under their plan. */
export async function canCreateBot(userId: string): Promise<boolean> {
  const sub = await getOrCreateSubscription(userId);
  const plan = PLANS[sub.plan as PlanId] ?? PLANS.free;
  if (plan.bots === -1) return true;

  const db = await getDb();
  const count = await db.getRepository(Bot).count({ where: { user_id: userId } });
  return count < plan.bots;
}

const todayUTC = () => new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"

/** Returns true if the user can send another chat message under their plan. */
export async function canSendMessage(userId: string): Promise<boolean> {
  const sub = await getOrCreateSubscription(userId);
  const plan = PLANS[sub.plan as PlanId] ?? PLANS.free;
  if (plan.messages === -1) return true;

  if (plan.messagesPeriod === "daily") {
    // Reset counter if it's a new day
    if (sub.messages_today_date !== todayUTC()) return true;
    return sub.messages_today < plan.messages;
  }

  return sub.messages_this_period < plan.messages;
}

/** Atomically increment the appropriate message counter. */
export async function incrementMessages(userId: string): Promise<void> {
  const db = await getDb();
  const repo = db.getRepository(Subscription);
  const sub = await getOrCreateSubscription(userId);
  const plan = PLANS[sub.plan as PlanId] ?? PLANS.free;

  if (plan.messagesPeriod === "daily") {
    const today = todayUTC();
    if (sub.messages_today_date !== today) {
      // New day — reset daily counter
      await repo.update({ user_id: userId }, { messages_today: 1, messages_today_date: today });
    } else {
      await repo.increment({ user_id: userId }, "messages_today", 1);
    }
  } else {
    await repo.increment({ user_id: userId }, "messages_this_period", 1);
  }
}

/** Returns true if the user can crawl more KB pages under their plan. */
export async function canIngestPage(userId: string): Promise<boolean> {
  const sub = await getOrCreateSubscription(userId);
  const plan = PLANS[sub.plan as PlanId] ?? PLANS.free;
  if (plan.pages === -1) return true;

  const db = await getDb();
  // Count total crawled pages across all bots owned by this user
  const result = await db
    .getRepository(CrawledPage)
    .createQueryBuilder("cp")
    .innerJoin(Bot, "b", "b.public_key = cp.bot_public_key")
    .where("b.user_id = :userId", { userId })
    .getCount();

  return result < plan.pages;
}
