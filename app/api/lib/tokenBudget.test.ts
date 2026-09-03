import {
  checkBotBudget,
  estimateTokens,
  getCurrentBillingPeriod,
  recordBotTokenUsage,
} from "./tokenBudget";
import { getDb } from "./db";

jest.mock("./db", () => ({
  getDb: jest.fn(),
}));

describe("Token Budget Guardrails (tokenBudget.ts)", () => {
  const mockedGetDb = getDb as jest.Mock;
  const mockFindOne = jest.fn();
  const mockCreate = jest.fn((d) => d);
  const mockSave = jest.fn().mockResolvedValue(undefined);
  const mockUpdate = jest.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetDb.mockResolvedValue({
      getRepository: () => ({
        findOne: mockFindOne,
        create: mockCreate,
        save: mockSave,
        update: mockUpdate,
      }),
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
  });

  describe("recordBotTokenUsage", () => {
    it("should create new usage record if none exists for the period", async () => {
      mockFindOne.mockResolvedValue(null);

      await recordBotTokenUsage("bot-1", {
        promptTokens: 120,
        completionTokens: 80,
      });

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          bot_id: "bot-1",
          billing_period: getCurrentBillingPeriod(),
          total_tokens: 200,
          prompt_tokens: 120,
          completion_tokens: 80,
          message_count: 1,
        }),
      );
      expect(mockSave).toHaveBeenCalled();
    });

    it("should update existing usage record", async () => {
      mockFindOne.mockResolvedValue({
        id: "usage-1",
        total_tokens: 500,
        prompt_tokens: 300,
        completion_tokens: 200,
        message_count: 5,
      });

      await recordBotTokenUsage("bot-1", {
        promptTokens: 50,
        completionTokens: 25,
      });

      expect(mockUpdate).toHaveBeenCalledWith("usage-1", {
        total_tokens: 575,
        prompt_tokens: 350,
        completion_tokens: 225,
        message_count: 6,
      });
    });
  });
});
