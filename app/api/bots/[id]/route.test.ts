import { GET, PUT, DELETE } from "./route";
import { getDb } from "../../lib/db";
import { getUserFromRequest } from "../../lib/auth";
import * as Sentry from "@sentry/nextjs";

jest.mock("../../lib/db");
jest.mock("../../lib/auth");
jest.mock("@sentry/nextjs", () => ({ captureException: jest.fn() }));
jest.mock("../../../../lib/logger", () => ({
  logger: { error: jest.fn(), warn: jest.fn(), info: jest.fn() },
}));

describe("API: /api/bots/[id]", () => {
  const mockBotRepo = {
    findOne: jest.fn(),
    update: jest.fn(),
  };
  const mockDbQuery = jest.fn().mockResolvedValue([]);

  // Fake transaction: statements run through txQuery and only count as committed when the
  // callback finishes without throwing.
  const txQuery = jest.fn();
  let txOutcome: "committed" | "rolled_back" | null;
  const mockTransaction = jest.fn(async (work: (m: { query: jest.Mock }) => Promise<unknown>) => {
    try {
      const result = await work({ query: txQuery });
      txOutcome = "committed";
      return result;
    } catch (err) {
      txOutcome = "rolled_back";
      throw err;
    }
  });

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "log").mockImplementation(() => {});
    txOutcome = null;
    txQuery.mockReset();
    txQuery.mockImplementation(async (sql: string) =>
      sql.startsWith("SELECT id FROM bots") ? [{ id: "locked" }] : [],
    );
    (getDb as jest.Mock).mockResolvedValue({
      getRepository: jest.fn().mockReturnValue(mockBotRepo),
      query: mockDbQuery,
      transaction: mockTransaction,
    });
    (getUserFromRequest as jest.Mock).mockResolvedValue({ id: "user_123" });
  });

  describe("GET", () => {
    it("should query by id UUID when param is a valid UUID", async () => {
      const validUuid = "123e4567-e89b-12d3-a456-426614174000";
      const mockBot = { id: validUuid, name: "UUID Bot" };
      mockBotRepo.findOne.mockResolvedValueOnce(mockBot);

      const params = Promise.resolve({ id: validUuid });
      const req = new Request(`http://localhost/api/bots/${validUuid}`);
      const res = await GET(req, { params });
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(mockBotRepo.findOne).toHaveBeenCalledWith({ where: { id: validUuid, user_id: "user_123" } });
      expect(mockDbQuery).toHaveBeenCalledWith(expect.stringContaining("AND user_id = $2"), [validUuid, "user_123"]);
      expect(data).toEqual(mockBot);
    });

    it("should query by public_key when param is not a UUID", async () => {
      const publicKey = "pk_test_12345";
      const mockBot = { id: "bot_1", public_key: publicKey, name: "Key Bot" };
      mockBotRepo.findOne.mockResolvedValueOnce(mockBot);

      const params = Promise.resolve({ id: publicKey });
      const req = new Request(`http://localhost/api/bots/${publicKey}`);
      const res = await GET(req, { params });
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(mockBotRepo.findOne).toHaveBeenCalledWith({ where: { public_key: publicKey, user_id: "user_123" } });
      expect(data).toEqual(mockBot);
    });

    it("should return 401 without reading the bot when unauthenticated", async () => {
      (getUserFromRequest as jest.Mock).mockResolvedValueOnce(null);

      const res = await GET(new Request("http://localhost/api/bots/pk_public"), {
        params: Promise.resolve({ id: "pk_public" }),
      });

      expect(res.status).toBe(401);
      expect(mockDbQuery).not.toHaveBeenCalled();
      expect(mockBotRepo.findOne).not.toHaveBeenCalled();
    });

    it("should return 404 when bot is not found", async () => {
      mockBotRepo.findOne.mockResolvedValueOnce(null);

      const params = Promise.resolve({ id: "non_existent" });
      const req = new Request("http://localhost/api/bots/non_existent");
      const res = await GET(req, { params });
      const data = await res.json();

      expect(res.status).toBe(404);
      expect(data).toEqual({ error: "Bot not found" });
    });
  });

  describe("PUT", () => {
    it("should update bot details in repository and return ok status", async () => {
      const botId = "123e4567-e89b-12d3-a456-426614174000";
      mockBotRepo.findOne.mockResolvedValueOnce({ id: botId, user_id: "user_123" });
      mockBotRepo.update.mockResolvedValueOnce({ affected: 1 });

      const body = {
        name: "Updated Bot Name",
        description: "Updated description",
        tone: "friendly",
        primaryColor: "#FF0000",
      };

      const params = Promise.resolve({ id: botId });
      const req = new Request(`http://localhost/api/bots/${botId}`, {
        method: "PUT",
        body: JSON.stringify(body),
      });

      const res = await PUT(req, { params });
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(mockBotRepo.update).toHaveBeenCalledWith(botId, {
        name: "Updated Bot Name",
        description: "Updated description",
        tone: "friendly",
        primary_color: "#FF0000",
        contact_enabled: undefined,
        contact_email: undefined,
        contact_prompt: undefined,
        contact_email_message: undefined,
        logo_url: undefined,
        ecommerce_enabled: undefined,
        ecommerce_prompt: undefined,
        ecommerce_products: undefined,
      });
      expect(mockBotRepo.findOne).toHaveBeenCalledWith({ where: { id: botId, user_id: "user_123" } });
      expect(data).toEqual({ status: "ok" });
    });

    it("should return 401 and not update when unauthenticated", async () => {
      (getUserFromRequest as jest.Mock).mockResolvedValueOnce(null);

      const req = new Request("http://localhost/api/bots/x", {
        method: "PUT",
        body: JSON.stringify({ contactEmail: "attacker@example.com" }),
      });
      const res = await PUT(req, { params: Promise.resolve({ id: "123e4567-e89b-12d3-a456-426614174000" }) });

      expect(res.status).toBe(401);
      expect(mockBotRepo.update).not.toHaveBeenCalled();
    });

    it("should return 404 and not update another user's bot", async () => {
      mockBotRepo.findOne.mockResolvedValueOnce(null);

      const req = new Request("http://localhost/api/bots/x", {
        method: "PUT",
        body: JSON.stringify({ contactEmail: "attacker@example.com" }),
      });
      const res = await PUT(req, { params: Promise.resolve({ id: "123e4567-e89b-12d3-a456-426614174000" }) });

      expect(res.status).toBe(404);
      expect(mockBotRepo.update).not.toHaveBeenCalled();
    });
  });

  describe("DELETE", () => {
    it("should return 401 Unauthorized if user is not authenticated", async () => {
      (getUserFromRequest as jest.Mock).mockResolvedValueOnce(null);

      const params = Promise.resolve({ id: "bot_123" });
      const req = new Request("http://localhost/api/bots/bot_123", { method: "DELETE" });
      const res = await DELETE(req, { params });
      const data = await res.json();

      expect(res.status).toBe(401);
      expect(data.error).toBe("Unauthorized");
    });

    it("should return 404 if bot is not found for user", async () => {
      mockBotRepo.findOne.mockResolvedValueOnce(null);

      const params = Promise.resolve({ id: "bot_123" });
      const req = new Request("http://localhost/api/bots/bot_123", { method: "DELETE" });
      const res = await DELETE(req, { params });
      const data = await res.json();

      expect(res.status).toBe(404);
      expect(data.error).toBe("Bot not found");
    });

    describe("when the bot exists", () => {
      const validUuid = "123e4567-e89b-12d3-a456-426614174000";
      const deleteBot = () =>
        DELETE(new Request(`http://localhost/api/bots/${validUuid}`, { method: "DELETE" }), {
          params: Promise.resolve({ id: validUuid }),
        });
      const statements = () => txQuery.mock.calls.map(([sql]) => sql as string);

      beforeEach(() => {
        mockBotRepo.findOne.mockResolvedValueOnce({ id: validUuid, public_key: "pk_123", name: "Bot To Delete" });
      });

      it("deletes the bot and its data in one transaction, locking the bot row first", async () => {
        const res = await deleteBot();

        expect(res.status).toBe(200);
        expect((await res.json()).message).toBe("Bot deleted successfully");
        expect(mockTransaction).toHaveBeenCalledTimes(1);
        expect(txOutcome).toBe("committed");
        expect(txQuery.mock.calls).toEqual([
          ["SELECT id FROM bots WHERE id = $1 AND user_id = $2 FOR UPDATE", [validUuid, "user_123"]],
          ["DELETE FROM bot_documents WHERE public_key = $1", ["pk_123"]],
          ["DELETE FROM crawled_pages WHERE bot_public_key = $1", ["pk_123"]],
          ["DELETE FROM leads WHERE bot_id = $1", [validUuid]],
          ["DELETE FROM conversations WHERE bot_id = $1", [validUuid]],
          ["UPDATE shopify_stores SET bot_id = NULL WHERE bot_id = $1", [validUuid]],
          ["DELETE FROM bots WHERE id = $1", [validUuid]],
        ]);
        // Nothing runs outside the transaction.
        expect(mockDbQuery).not.toHaveBeenCalled();
      });

      it("rolls everything back and returns 500 when a step fails part-way", async () => {
        const failure = new Error("connection reset");
        txQuery.mockImplementation(async (sql: string) => {
          if (sql.startsWith("SELECT id FROM bots")) return [{ id: validUuid }];
          if (sql.startsWith("DELETE FROM conversations")) throw failure;
          return [];
        });

        const res = await deleteBot();

        expect(res.status).toBe(500);
        expect((await res.json()).error).toMatch(/Nothing was deleted/);
        expect(txOutcome).toBe("rolled_back");
        expect(statements()).not.toContain("DELETE FROM bots WHERE id = $1");
        expect(Sentry.captureException).toHaveBeenCalledWith(failure, expect.objectContaining({
          tags: { area: "bot_delete" },
        }));
      });

      it("returns 500 when the transaction can't start", async () => {
        mockTransaction.mockRejectedValueOnce(new Error("pool exhausted"));

        const res = await deleteBot();

        expect(res.status).toBe(500);
        expect(Sentry.captureException).toHaveBeenCalled();
      });

      it("returns 404 and deletes nothing when the bot was deleted by a concurrent request", async () => {
        txQuery.mockResolvedValueOnce([]); // the locking SELECT finds no row

        const res = await deleteBot();

        expect(res.status).toBe(404);
        expect(statements()).toEqual(["SELECT id FROM bots WHERE id = $1 AND user_id = $2 FOR UPDATE"]);
      });
    });

    it("skips knowledge-base deletes for a bot without a public key", async () => {
      const id = "123e4567-e89b-12d3-a456-426614174001";
      mockBotRepo.findOne.mockResolvedValueOnce({ id, public_key: null, name: "Keyless" });

      const res = await DELETE(new Request(`http://localhost/api/bots/${id}`, { method: "DELETE" }), {
        params: Promise.resolve({ id }),
      });

      expect(res.status).toBe(200);
      const sql = txQuery.mock.calls.map(([s]) => s as string);
      expect(sql.some((s) => s.includes("bot_documents") || s.includes("crawled_pages"))).toBe(false);
      expect(sql).toContain("DELETE FROM bots WHERE id = $1");
    });
  });
});
