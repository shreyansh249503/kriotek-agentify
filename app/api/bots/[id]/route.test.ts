import { GET, PUT, DELETE } from "./route";
import { getDb } from "../../lib/db";
import { getUserFromRequest } from "../../lib/auth";

jest.mock("../../lib/db");
jest.mock("../../lib/auth");

describe("API: /api/bots/[id]", () => {
  const mockBotRepo = {
    findOne: jest.fn(),
    update: jest.fn(),
  };
  const mockDbQuery = jest.fn().mockResolvedValue([]);

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "log").mockImplementation(() => {});
    (getDb as jest.Mock).mockResolvedValue({
      getRepository: jest.fn().mockReturnValue(mockBotRepo),
      query: mockDbQuery,
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
      expect(mockBotRepo.findOne).toHaveBeenCalledWith({ where: { id: validUuid } });
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
      expect(mockBotRepo.findOne).toHaveBeenCalledWith({ where: { public_key: publicKey } });
      expect(data).toEqual(mockBot);
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
      mockBotRepo.update.mockResolvedValueOnce({ affected: 1 });

      const botId = "bot_123";
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
      expect(data).toEqual({ status: "ok" });
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

    it("should delete bot and related records when authenticated", async () => {
      const validUuid = "123e4567-e89b-12d3-a456-426614174000";
      const mockBot = { id: validUuid, public_key: "pk_123", name: "Bot To Delete" };
      mockBotRepo.findOne.mockResolvedValueOnce(mockBot);

      const params = Promise.resolve({ id: validUuid });
      const req = new Request(`http://localhost/api/bots/${validUuid}`, { method: "DELETE" });
      const res = await DELETE(req, { params });
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.message).toBe("Bot deleted successfully");
      expect(mockDbQuery).toHaveBeenCalledWith("DELETE FROM bot_documents WHERE public_key = $1", ["pk_123"]);
      expect(mockDbQuery).toHaveBeenCalledWith("DELETE FROM bots WHERE id = $1", [validUuid]);
    });
  });
});
