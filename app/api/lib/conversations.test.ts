import { appendMessages, parseMessages, upsertConversationMessages } from "./conversations";
import { getDb } from "./db";

jest.mock("./db");

describe("conversations", () => {
  const mockQuery = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (getDb as jest.Mock).mockResolvedValue({ query: mockQuery });
  });

  describe("parseMessages", () => {
    const history = [{ role: "user", content: "hi" }];

    it("returns arrays as they are", () => {
      expect(parseMessages(history)).toBe(history);
    });

    it("unwraps rows stored as a JSON string", () => {
      expect(parseMessages(JSON.stringify(history))).toEqual(history);
    });

    it.each([null, undefined, "", "not json", "{}", 42])("returns [] for %p", (value) => {
      expect(parseMessages(value)).toEqual([]);
    });
  });

  describe("appendMessages", () => {
    it("appends in a single UPDATE without reading the row first", async () => {
      mockQuery.mockResolvedValueOnce([[], 1]);
      const reply = { role: "assistant" as const, sender: "human" as const, content: "On it" };

      await appendMessages("convo-1", [reply]);

      expect(mockQuery).toHaveBeenCalledTimes(1);
      const [sql, params] = mockQuery.mock.calls[0];
      expect(sql).toMatch(/^UPDATE conversations/);
      expect(sql).toContain("|| $2::jsonb");
      expect(sql).toContain("message_count = COALESCE(message_count, 0) + $3");
      expect(sql).toContain("state = COALESCE($4, state)");
      expect(sql).toContain("WHEN 'string' THEN (messages #>> '{}')::jsonb");
      expect(params).toEqual(["convo-1", JSON.stringify([reply]), 1, null]);
    });

    it("passes the new state and a custom message count", async () => {
      await appendMessages("convo-1", [{ role: "system", content: "Closed" }], {
        state: "completed",
        incrementCount: 0,
      });

      expect(mockQuery.mock.calls[0][1]).toEqual([
        "convo-1",
        JSON.stringify([{ role: "system", content: "Closed" }]),
        0,
        "completed",
      ]);
    });
  });

  describe("upsertConversationMessages", () => {
    const notice = { role: "system" as const, content: "Transferred" };

    it("inserts or appends in one statement, only for the same bot", async () => {
      mockQuery.mockResolvedValueOnce([{ id: "convo-1" }]);

      const saved = await upsertConversationMessages("convo-1", "bot-1", [notice], { state: "manual" });

      expect(saved).toBe(true);
      const [sql, params] = mockQuery.mock.calls[0];
      expect(sql).toContain("ON CONFLICT (id) DO UPDATE");
      expect(sql).toContain("|| EXCLUDED.messages");
      expect(sql).toContain("WHERE conversations.bot_id = EXCLUDED.bot_id");
      expect(params).toEqual(["convo-1", "bot-1", "manual", 1, JSON.stringify([notice])]);
    });

    it("returns false when the ID belongs to another bot", async () => {
      mockQuery.mockResolvedValueOnce([]);

      await expect(
        upsertConversationMessages("convo-1", "bot-2", [notice], { state: "manual" }),
      ).resolves.toBe(false);
    });
  });
});
