import { POST, OPTIONS } from "./route";
import { getDb } from "@/app/api/lib/db";

jest.mock("@/app/api/lib/db");

describe("API: /api/chat/switch-to-manual", () => {
  const mockBotRepo = {
    findOne: jest.fn(),
  };

  const mockConvoRepo = {
    findOne: jest.fn(),
    create: jest.fn((val) => ({ ...val })),
    save: jest.fn((val) => Promise.resolve(val)),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (getDb as jest.Mock).mockResolvedValue({
      getRepository: jest.fn().mockImplementation((entityName: string) => {
        if (entityName === "Bot") return mockBotRepo;
        if (entityName === "Conversation") return mockConvoRepo;
        return {};
      }),
    });
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

    it("should create new conversation in manual mode if it does not exist", async () => {
      const mockBot = { id: "bot_1", public_key: "pk_123" };
      mockBotRepo.findOne.mockResolvedValueOnce(mockBot);
      mockConvoRepo.findOne.mockResolvedValueOnce(null);

      const req = new Request("http://localhost/api/chat/switch-to-manual", {
        method: "POST",
        body: JSON.stringify({ conversationId: "new_convo_123", publicKey: "pk_123" }),
      });

      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(mockConvoRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          id: "new_convo_123",
          bot_id: "bot_1",
          state: "manual",
        })
      );
      expect(mockConvoRepo.save).toHaveBeenCalled();
      expect(data).toEqual({ success: true, state: "manual" });
    });

    it("should update existing conversation to manual mode and append system message", async () => {
      const mockBot = { id: "bot_1", public_key: "pk_123" };
      const existingConvo = {
        id: "convo_123",
        bot_id: "bot_1",
        state: "bot",
        message_count: 2,
        messages: JSON.stringify([{ role: "user", content: "I want human help" }]),
      };

      mockBotRepo.findOne.mockResolvedValueOnce(mockBot);
      mockConvoRepo.findOne.mockResolvedValueOnce(existingConvo);

      const req = new Request("http://localhost/api/chat/switch-to-manual", {
        method: "POST",
        body: JSON.stringify({ conversationId: "convo_123", publicKey: "pk_123" }),
      });

      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data).toEqual({ success: true, state: "manual" });
      expect(existingConvo.state).toBe("manual");
      expect(existingConvo.message_count).toBe(3);

      const updatedMessages = JSON.parse(existingConvo.messages);
      expect(updatedMessages).toHaveLength(2);
      expect(updatedMessages[1]).toEqual({
        role: "system",
        content: "Chat transferred to customer support. A representative will join you shortly.",
      });
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
