import { getDb } from "./db";
import { BotUsage } from "./entities";

export interface BudgetCheckResult {
  allowed: boolean;
  currentTokens: number;
  budgetLimit: number | null;
  percentageUsed: number;
  reason?: "budget_exceeded" | "within_budget" | "unlimited";
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
    return {
      allowed: true,
      currentTokens: 0,
      budgetLimit: monthlyBudget,
      percentageUsed: 0,
      reason: "within_budget",
    };
  }
}

export async function recordBotTokenUsage(
  botId: string,
  tokens: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  },
): Promise<void> {
  try {
    const prompt = tokens.promptTokens || 0;
    const completion = tokens.completionTokens || 0;
    const total = tokens.totalTokens || prompt + completion;

    if (total <= 0) return;

    const db = await getDb();
    const usageRepo = db.getRepository<BotUsage>("BotUsage");
    const currentPeriod = getCurrentBillingPeriod();

    let usage = await usageRepo.findOne({
      where: {
        bot_id: botId,
        billing_period: currentPeriod,
      },
    });

    if (!usage) {
      usage = usageRepo.create({
        bot_id: botId,
        billing_period: currentPeriod,
        total_tokens: total,
        prompt_tokens: prompt,
        completion_tokens: completion,
        message_count: 1,
      });
      await usageRepo.save(usage);
    } else {
      await usageRepo.update(usage.id, {
        total_tokens: usage.total_tokens + total,
        prompt_tokens: usage.prompt_tokens + prompt,
        completion_tokens: usage.completion_tokens + completion,
        message_count: usage.message_count + 1,
      });
    }
  } catch (err) {
    console.error("[TokenBudget] Error recording token usage:", err);
  }
}
