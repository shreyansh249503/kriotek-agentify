import {
  checkBotBudget,
  getDefaultMonthlyBudget,
  estimateTokens,
  getCurrentBillingPeriod,
  recordBotTokenUsage,
} from "./tokenBudget";
import { getDb } from "./db";
import * as Sentry from "@sentry/nextjs";

jest.mock("./db", () => ({
  getDb: jest.fn(),
}));

jest.mock("@sentry/nextjs", () => ({
  captureException: jest.fn(),
}));

describe("Token Budget Guardrails (tokenBudget.ts)", () => {
  const mockedGetDb = getDb as jest.Mock;
  const mockFindOne = jest.fn();
  const mockCreate = jest.fn((d) => d);
  const mockSave = jest.fn().mockResolvedValue(undefined);
  const mockUpdate = jest.fn().mockResolvedValue(undefined);
  const mockQuery = jest.fn().mockResolvedValue([]);

  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetDb.mockResolvedValue({
      getRepository: () => ({
        findOne: mockFindOne,
        create: mockCreate,
        save: mockSave,
        update: mockUpdate,
      }),
      query: mockQuery,
    });
  });

  describe("getCurrentBillingPeriod", () => {
    it("should format date as YYYY-MM", () => {
      const date = new Date(Date.UTC(2026, 8, 3)); // Month 8 is September
      expect(getCurrentBillingPeriod(date)).toBe("2026-09");
    });
  });

  describe("estimateTokens", () => {
    it("should approximate token counts based on length", () => {
      expect(estimateTokens("")).toBe(0);
      expect(estimateTokens("Hello World")).toBe(3); // 11 chars / 4 ~ 3
    });
  });

  describe("checkBotBudget", () => {
    it("should allow unlimited when monthlyBudget is not set or 0", async () => {
      const res = await checkBotBudget("bot-1", undefined);
      expect(res.allowed).toBe(true);
      expect(res.reason).toBe("unlimited");
    });

    it("should allow when usage is within budget limit", async () => {
      mockFindOne.mockResolvedValue({
        id: "usage-1",
        total_tokens: 15000,
      });

      const res = await checkBotBudget("bot-1", 50000);
      expect(res.allowed).toBe(true);
      expect(res.currentTokens).toBe(15000);
      expect(res.percentageUsed).toBe(30);
      expect(res.reason).toBe("within_budget");
    });

    it("should block when usage exceeds monthly budget limit", async () => {
      mockFindOne.mockResolvedValue({
        id: "usage-1",
        total_tokens: 50001,
      });

      const res = await checkBotBudget("bot-1", 50000);
      expect(res.allowed).toBe(false);
      expect(res.percentageUsed).toBe(100);
      expect(res.reason).toBe("budget_exceeded");
    });

    describe("when the usage lookup fails", () => {
      const env = process.env as Record<string, string | undefined>;
      const originalNodeEnv = env.NODE_ENV;

      beforeEach(() => {
        jest.spyOn(console, "error").mockImplementation(() => {});
        mockFindOne.mockRejectedValue(new Error("connection refused"));
      });

      afterEach(() => {
        env.NODE_ENV = originalNodeEnv;
        jest.restoreAllMocks();
      });

      it("refuses the request in production and reports to Sentry", async () => {
        env.NODE_ENV = "production";

        const res = await checkBotBudget("bot-1", 50000);

        expect(res.allowed).toBe(false);
        expect(res.reason).toBe("check_failed");
        expect(Sentry.captureException).toHaveBeenCalled();
      });

      it("lets the request through outside production", async () => {
        env.NODE_ENV = "development";

        const res = await checkBotBudget("bot-1", 50000);

        expect(res.allowed).toBe(true);
        expect(res.reason).toBe("within_budget");
      });
    });

    describe("platform default budget", () => {
      afterEach(() => {
        delete process.env.DEFAULT_MONTHLY_TOKEN_BUDGET;
      });

      it("applies DEFAULT_MONTHLY_TOKEN_BUDGET to bots without their own budget", async () => {
        process.env.DEFAULT_MONTHLY_TOKEN_BUDGET = "1000";
        mockFindOne.mockResolvedValue({ id: "usage-1", total_tokens: 1000 });

        const res = await checkBotBudget("bot-1", null);

        expect(res.allowed).toBe(false);
        expect(res.budgetLimit).toBe(1000);
        expect(res.reason).toBe("budget_exceeded");
      });

      it("prefers the bot's own budget over the default", async () => {
        process.env.DEFAULT_MONTHLY_TOKEN_BUDGET = "1000";
        mockFindOne.mockResolvedValue({ id: "usage-1", total_tokens: 5000 });

        const res = await checkBotBudget("bot-1", 50000);

        expect(res.allowed).toBe(true);
        expect(res.budgetLimit).toBe(50000);
      });

      it.each(["", "abc", "-5", "1.5"])("treats an invalid default (%p) as unlimited", (value) => {
        expect(getDefaultMonthlyBudget({ DEFAULT_MONTHLY_TOKEN_BUDGET: value } as unknown as NodeJS.ProcessEnv)).toBeNull();
      });
    });
  });

  describe("recordBotTokenUsage", () => {
    it("adds usage with a single atomic upsert", async () => {
      await recordBotTokenUsage("bot-1", { inputTokens: 120, outputTokens: 80 });

      expect(mockQuery).toHaveBeenCalledTimes(1);
      const [sql, params] = mockQuery.mock.calls[0];
      expect(sql).toContain("ON CONFLICT (bot_id, billing_period) DO UPDATE");
      expect(sql).toContain("total_tokens = COALESCE(bot_usages.total_tokens, 0) + EXCLUDED.total_tokens");
      expect(params).toEqual(["bot-1", getCurrentBillingPeriod(), 200, 120, 80, 1]);
      expect(mockFindOne).not.toHaveBeenCalled();
    });

    it("prefers the reported total and records the given message count", async () => {
      await recordBotTokenUsage("bot-1", { inputTokens: 50, outputTokens: 25, totalTokens: 90, messageCount: 0 });

      expect(mockQuery.mock.calls[0][1]).toEqual(["bot-1", getCurrentBillingPeriod(), 90, 50, 25, 0]);
    });

    it("skips the write when there is nothing to record", async () => {
      await recordBotTokenUsage("bot-1", { messageCount: 0 });

      expect(mockQuery).not.toHaveBeenCalled();
    });

    it("logs instead of throwing when the write fails", async () => {
      const errorSpy = jest.spyOn(console, "error").mockImplementationOnce(() => {});
      mockQuery.mockRejectedValueOnce(new Error("db down"));

      await expect(recordBotTokenUsage("bot-1", { inputTokens: 1 })).resolves.toBeUndefined();
      expect(errorSpy).toHaveBeenCalled();
    });
  });
});
