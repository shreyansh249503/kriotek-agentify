import { POST, OPTIONS } from "./route";
import { getDb } from "@/app/api/lib/db";
import { upsertConversationMessages } from "@/app/api/lib/conversations";

jest.mock("@/app/api/lib/db");
jest.mock("@/app/api/lib/conversations");

describe("API: /api/chat/switch-to-manual", () => {
  const mockBotRepo = {
    findOne: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (getDb as jest.Mock).mockResolvedValue({
      getRepository: jest.fn().mockImplementation((entityName: string) => {
        if (entityName === "Bot") return mockBotRepo;
        return {};
      }),
    });
    (upsertConversationMessages as jest.Mock).mockResolvedValue(true);
  });

  describe("OPTIONS", () => {
    it("should respond with 204 status and CORS headers", async () => {
      const res = await OPTIONS();
      expect(res.status).toBe(204);
      expect(res.headers.get("Access-Control-Allow-Origin")).toBe("*");
    });
  });

  describe("POST", () => {
    it("should return 400 if conversationId or publicKey is missing", async () => {
      const req = new Request("http://localhost/api/chat/switch-to-manual", {
        method: "POST",
        body: JSON.stringify({ conversationId: "convo_123" }),
      });

      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data).toEqual({ error: "conversationId and publicKey are required" });
    });

    it("should return 429 when rate limit is exceeded", async () => {
      // Send 31 requests from the same IP to exceed ipLimit of 30
      let lastRes;
      for (let i = 0; i < 32; i++) {
        const req = new Request("http://localhost/api/chat/switch-to-manual", {
          method: "POST",
          headers: { "x-forwarded-for": "198.51.100.99" },
          body: JSON.stringify({ conversationId: "convo_123", publicKey: "pk_123" }),
        });
        lastRes = await POST(req);
      }

      expect(lastRes?.status).toBe(429);
      const data = await lastRes?.json();
      expect(data.error).toContain("Rate limit exceeded");
    });

    it("should return 404 if bot is not found for public key", async () => {
      mockBotRepo.findOne.mockResolvedValueOnce(null);

      const req = new Request("http://localhost/api/chat/switch-to-manual", {
        method: "POST",
        body: JSON.stringify({ conversationId: "convo_123", publicKey: "invalid_key" }),
      });

      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(404);
      expect(data).toEqual({ error: "Bot not found" });
    });

    it("should create or update the conversation in manual mode with the transfer notice", async () => {
      mockBotRepo.findOne.mockResolvedValueOnce({ id: "bot_1", public_key: "pk_123" });

      const req = new Request("http://localhost/api/chat/switch-to-manual", {
        method: "POST",
        body: JSON.stringify({ conversationId: "convo_123", publicKey: "pk_123" }),
      });

      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data).toEqual({ success: true, state: "manual" });
      expect(upsertConversationMessages).toHaveBeenCalledWith(
        "convo_123",
        "bot_1",
        [
          {
            role: "system",
            content: "Chat transferred to customer support. A representative will join you shortly.",
          },
        ],
        { state: "manual" },
      );
    });

    it("should return 404 when the conversation ID belongs to another bot", async () => {
      mockBotRepo.findOne.mockResolvedValueOnce({ id: "bot_1", public_key: "pk_123" });
      (upsertConversationMessages as jest.Mock).mockResolvedValueOnce(false);

      const req = new Request("http://localhost/api/chat/switch-to-manual", {
        method: "POST",
        body: JSON.stringify({ conversationId: "other_bots_convo", publicKey: "pk_123" }),
      });

      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(404);
      expect(data).toEqual({ error: "Conversation not found" });
    });

    it("should return 500 when database error occurs", async () => {
      jest.spyOn(console, "error").mockImplementationOnce(() => {});
      mockBotRepo.findOne.mockRejectedValueOnce(new Error("Database error"));

      const req = new Request("http://localhost/api/chat/switch-to-manual", {
        method: "POST",
        body: JSON.stringify({ conversationId: "convo_123", publicKey: "pk_123" }),
      });

      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(500);
      expect(data).toEqual({ error: "Internal Server Error" });
    });
  });
});
