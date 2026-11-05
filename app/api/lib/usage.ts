import type { LanguageModelUsage } from "ai";

type ReportedUsage = Partial<Pick<LanguageModelUsage, "inputTokens" | "outputTokens" | "totalTokens">>;

/** Sums the token usage of every model call made while answering one chat message. */
export class UsageAccumulator {
  inputTokens = 0;
  outputTokens = 0;
  totalTokens = 0;

  /** Adds one call's usage. Returns false when the provider reported none. */
  add(usage: ReportedUsage | null | undefined): boolean {
    if (!usage || (typeof usage.inputTokens !== "number" && typeof usage.totalTokens !== "number")) {
      return false;
    }
    const input = usage.inputTokens ?? 0;
    const output = usage.outputTokens ?? 0;
    this.inputTokens += input;
    this.outputTokens += output;
    this.totalTokens += usage.totalTokens ?? input + output;
    return true;
  }
}
