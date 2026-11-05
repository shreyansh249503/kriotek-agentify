import * as Sentry from "@sentry/nextjs";
import { getDb } from "./db";
import { BotUsage } from "./entities";

export interface BudgetCheckResult {
  allowed: boolean;
  currentTokens: number;
  budgetLimit: number | null;
  percentageUsed: number;
  reason?: "budget_exceeded" | "within_budget" | "unlimited" | "check_failed";
}

export function getCurrentBillingPeriod(date: Date = new Date()): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

export function estimateTokens(text: string): number {
  if (!text) return 0;
  return Math.max(1, Math.ceil(text.length / 4));
}

/**
 * Platform-wide cap for bots without their own monthly_token_budget, so no bot has unbounded
 * Gemini spend. Unset or invalid means unlimited (the production env check warns about that).
 */
export function getDefaultMonthlyBudget(env: NodeJS.ProcessEnv = process.env): number | null {
  const value = Number(env.DEFAULT_MONTHLY_TOKEN_BUDGET);
  return Number.isInteger(value) && value > 0 ? value : null;
}

export async function checkBotBudget(
  botId: string,
  botBudget?: number | null,
): Promise<BudgetCheckResult> {
  const monthlyBudget = botBudget && botBudget > 0 ? botBudget : getDefaultMonthlyBudget();
  if (!monthlyBudget) {
    return {
      allowed: true,
      currentTokens: 0,
      budgetLimit: null,
      percentageUsed: 0,
      reason: "unlimited",
    };
  }

  try {
    const db = await getDb();
    const usageRepo = db.getRepository<BotUsage>("BotUsage");
    const currentPeriod = getCurrentBillingPeriod();

    const usage = await usageRepo.findOne({
      where: {
        bot_id: botId,
        billing_period: currentPeriod,
      },
    });

    const currentTokens = usage?.total_tokens || 0;
    const percentageUsed = Math.min(100, Math.round((currentTokens / monthlyBudget) * 100));

    if (currentTokens >= monthlyBudget) {
      return {
        allowed: false,
        currentTokens,
        budgetLimit: monthlyBudget,
        percentageUsed: 100,
        reason: "budget_exceeded",
      };
    }

    return {
      allowed: true,
      currentTokens,
      budgetLimit: monthlyBudget,
      percentageUsed,
      reason: "within_budget",
    };
  } catch (err) {
    console.error("[TokenBudget] Error checking bot budget:", err);
    Sentry.captureException(err, { tags: { area: "token_budget" } });
    // Fail closed in production so a database outage can't lift the spend cap.
    const failClosed = process.env.NODE_ENV === "production";
    return {
      allowed: !failClosed,
      currentTokens: 0,
      budgetLimit: monthlyBudget,
      percentageUsed: 0,
      reason: failClosed ? "check_failed" : "within_budget",
    };
  }
}

/**
 * Adds one chat message's token usage to the bot's monthly row in a single atomic upsert, so
 * concurrent messages can't overwrite each other's counts. Relies on UNIQUE (bot_id, billing_period).
 */
export async function recordBotTokenUsage(
  botId: string,
  tokens: {
    inputTokens?: number;
    outputTokens?: number;
    totalTokens?: number;
    messageCount?: number;
  },
): Promise<void> {
  try {
    const input = tokens.inputTokens || 0;
    const output = tokens.outputTokens || 0;
    const total = tokens.totalTokens || input + output;
    const messageCount = tokens.messageCount ?? 1;

    if (total <= 0 && messageCount <= 0) return;

    const db = await getDb();
    await db.query(
      `INSERT INTO bot_usages (bot_id, billing_period, total_tokens, prompt_tokens, completion_tokens, message_count)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (bot_id, billing_period) DO UPDATE SET
         total_tokens = COALESCE(bot_usages.total_tokens, 0) + EXCLUDED.total_tokens,
         prompt_tokens = COALESCE(bot_usages.prompt_tokens, 0) + EXCLUDED.prompt_tokens,
         completion_tokens = COALESCE(bot_usages.completion_tokens, 0) + EXCLUDED.completion_tokens,
         message_count = COALESCE(bot_usages.message_count, 0) + EXCLUDED.message_count,
         updated_at = NOW()`,
      [botId, getCurrentBillingPeriod(), total, input, output, messageCount],
    );
  } catch (err) {
    console.error("[TokenBudget] Error recording token usage:", err);
  }
}
