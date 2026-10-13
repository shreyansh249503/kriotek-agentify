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
  const validUuid = "123e4567-e89b-12d3-a456-426614174000";

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
    it("returns 401 when the caller is not signed in", async () => {
      (getUserFromRequest as jest.Mock).mockResolvedValueOnce(null);
      const res = await GET(new Request(`http://localhost/api/bots/${validUuid}`), {
        params: Promise.resolve({ id: validUuid }),
      });
      expect(res.status).toBe(401);
      expect(mockBotRepo.findOne).not.toHaveBeenCalled();
    });

    it("scopes the lookup to the owner when param is a UUID", async () => {
      const mockBot = { id: validUuid, name: "UUID Bot", user_id: "user_123" };
      mockBotRepo.findOne.mockResolvedValueOnce(mockBot);

      const res = await GET(new Request(`http://localhost/api/bots/${validUuid}`), {
        params: Promise.resolve({ id: validUuid }),
      });

      expect(res.status).toBe(200);
      expect(mockBotRepo.findOne).toHaveBeenCalledWith({
        where: { id: validUuid, user_id: "user_123" },
      });
      expect(await res.json()).toEqual(mockBot);
    });

    it("scopes the lookup to the owner when param is a public key", async () => {
      mockBotRepo.findOne.mockResolvedValueOnce({ id: "bot_1", public_key: "pk_1" });

      await GET(new Request("http://localhost/api/bots/pk_1"), {
        params: Promise.resolve({ id: "pk_1" }),
      });

      expect(mockBotRepo.findOne).toHaveBeenCalledWith({
        where: { public_key: "pk_1", user_id: "user_123" },
      });
    });

    it("returns 404 for a bot the caller does not own", async () => {
      mockBotRepo.findOne.mockResolvedValueOnce(null);

      const res = await GET(new Request("http://localhost/api/bots/other"), {
        params: Promise.resolve({ id: "other" }),
      });

      expect(res.status).toBe(404);
      expect(await res.json()).toEqual({ error: "Bot not found" });
    });
  });

  describe("PUT", () => {
    const body = {
      name: "Updated Bot Name",
      description: "Updated description",
      tone: "friendly",
      primaryColor: "#FF0000",
    };
    const putReq = () =>
      new Request(`http://localhost/api/bots/${validUuid}`, {
        method: "PUT",
        body: JSON.stringify(body),
      });

    it("returns 401 and does not update when not signed in", async () => {
      (getUserFromRequest as jest.Mock).mockResolvedValueOnce(null);
      const res = await PUT(putReq(), { params: Promise.resolve({ id: validUuid }) });
      expect(res.status).toBe(401);
      expect(mockBotRepo.update).not.toHaveBeenCalled();
    });

    it("returns 404 and does not update another user's bot", async () => {
      mockBotRepo.findOne.mockResolvedValueOnce(null);
      const res = await PUT(putReq(), { params: Promise.resolve({ id: validUuid }) });
      expect(res.status).toBe(404);
      expect(mockBotRepo.update).not.toHaveBeenCalled();
    });

    it.each([["publicKey"], ["public_key"]])(
      "rejects changing the public key via %s and writes nothing",
      async (field) => {
        mockBotRepo.findOne.mockResolvedValueOnce({
          id: validUuid,
          public_key: "pk_original",
          user_id: "user_123",
        });

        const res = await PUT(
          new Request(`http://localhost/api/bots/${validUuid}`, {
            method: "PUT",
            body: JSON.stringify({ name: "Renamed", [field]: "pk_hijacked" }),
          }),
          { params: Promise.resolve({ id: validUuid }) },
        );

        expect(res.status).toBe(400);
        expect(await res.json()).toEqual({ error: "A bot's public key cannot be changed." });
        expect(mockBotRepo.update).not.toHaveBeenCalled();
      },
    );

    it("accepts the unchanged public key and never writes public_key", async () => {
      mockBotRepo.findOne.mockResolvedValueOnce({
        id: validUuid,
        public_key: "pk_original",
        user_id: "user_123",
      });
      mockBotRepo.update.mockResolvedValueOnce({ affected: 1 });

      const res = await PUT(
        new Request(`http://localhost/api/bots/${validUuid}`, {
          method: "PUT",
          body: JSON.stringify({ name: "Renamed", publicKey: "pk_original" }),
        }),
        { params: Promise.resolve({ id: validUuid }) },
      );

      expect(res.status).toBe(200);
      const written = mockBotRepo.update.mock.calls[0][1];
      expect(written).not.toHaveProperty("public_key");
      expect(written).not.toHaveProperty("publicKey");
    });

    it("updates only the fields that were sent for the owner's bot", async () => {
      mockBotRepo.findOne.mockResolvedValueOnce({ id: validUuid, user_id: "user_123" });
      mockBotRepo.update.mockResolvedValueOnce({ affected: 1 });

      const res = await PUT(putReq(), { params: Promise.resolve({ id: validUuid }) });

      expect(res.status).toBe(200);
      expect(mockBotRepo.update).toHaveBeenCalledWith(validUuid, {
        name: "Updated Bot Name",
        description: "Updated description",
        tone: "friendly",
        primary_color: "#FF0000",
      });
      expect(await res.json()).toEqual({ status: "ok" });
    });
  });

  describe("DELETE", () => {
    it("returns 401 if user is not authenticated", async () => {
      (getUserFromRequest as jest.Mock).mockResolvedValueOnce(null);
      const res = await DELETE(
        new Request("http://localhost/api/bots/bot_123", { method: "DELETE" }),
        { params: Promise.resolve({ id: "bot_123" }) },
      );
      expect(res.status).toBe(401);
      expect((await res.json()).error).toBe("Unauthorized");
    });

    it("returns 404 if bot is not found for user", async () => {
      mockBotRepo.findOne.mockResolvedValueOnce(null);
      const res = await DELETE(
        new Request("http://localhost/api/bots/bot_123", { method: "DELETE" }),
        { params: Promise.resolve({ id: "bot_123" }) },
      );
      expect(res.status).toBe(404);
      expect((await res.json()).error).toBe("Bot not found");
    });

    it("deletes bot and related records when authenticated", async () => {
      mockBotRepo.findOne.mockResolvedValueOnce({
        id: validUuid,
        public_key: "pk_123",
        name: "Bot To Delete",
      });

      const res = await DELETE(
        new Request(`http://localhost/api/bots/${validUuid}`, { method: "DELETE" }),
        { params: Promise.resolve({ id: validUuid }) },
      );

      expect(res.status).toBe(200);
      expect((await res.json()).message).toBe("Bot deleted successfully");
      expect(mockDbQuery).toHaveBeenCalledWith(
        "DELETE FROM bot_documents WHERE public_key = $1",
        ["pk_123"],
      );
      expect(mockDbQuery).toHaveBeenCalledWith("DELETE FROM bots WHERE id = $1", [validUuid]);
    });
  });
});
