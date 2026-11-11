import { GET, POST, OPTIONS } from "./route";
import { getDb } from "../lib/db";
import { getUserFromRequest } from "../lib/auth";

jest.mock("../lib/db");
jest.mock("../lib/auth");
jest.mock("nanoid", () => ({
  nanoid: () => "mocked_nanoid_16",
}));

describe("API: /api/bots", () => {
  const mockUser = { id: "user_123", email: "user@example.com" };
  const mockBotRepo = {
    find: jest.fn(),
    create: jest.fn((val) => val),
    save: jest.fn((val) => Promise.resolve({ id: "bot_1", ...val })),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (getDb as jest.Mock).mockResolvedValue({
      getRepository: jest.fn().mockReturnValue(mockBotRepo),
    });
  });

  describe("OPTIONS", () => {
    it("should respond with 204 status and CORS headers", async () => {
      const res = await OPTIONS();
      expect(res.status).toBe(204);
      expect(res.headers.get("Access-Control-Allow-Origin")).toBe("*");
    });
  });

  describe("GET", () => {
    it("should return 401 if user is not authenticated", async () => {
      (getUserFromRequest as jest.Mock).mockResolvedValueOnce(null);

      const req = new Request("http://localhost/api/bots");
      const res = await GET(req);
      const data = await res.json();

      expect(res.status).toBe(401);
      expect(data).toEqual({ error: "Unauthorized" });
    });

    it("should return bots for the authenticated user", async () => {
      (getUserFromRequest as jest.Mock).mockResolvedValueOnce(mockUser);
      const mockBots = [{ id: "bot_1", name: "Bot 1", user_id: mockUser.id }];
      mockBotRepo.find.mockResolvedValueOnce(mockBots);

      const req = new Request("http://localhost/api/bots");
      const res = await GET(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(mockBotRepo.find).toHaveBeenCalledWith({ where: { user_id: mockUser.id } });
      expect(data).toEqual(mockBots);
    });
  });

  describe("POST", () => {
    it("should return 401 if user is not authenticated", async () => {
      (getUserFromRequest as jest.Mock).mockResolvedValueOnce(null);

      const req = new Request("http://localhost/api/bots", {
        method: "POST",
        body: JSON.stringify({ name: "New Bot" }),
      });
      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(401);
      expect(data).toEqual({ error: "Unauthorized" });
    });

    it("should create and save a new bot for the user", async () => {
      (getUserFromRequest as jest.Mock).mockResolvedValueOnce(mockUser);

      const payload = {
        name: "My Assistant",
        description: "Customer support bot",
        tone: "professional",
      };

      const req = new Request("http://localhost/api/bots", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(mockBotRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          public_key: "mocked_nanoid_16",
          name: "My Assistant",
          description: "Customer support bot",
          tone: "professional",
          user_id: mockUser.id,
        })
      );
      expect(mockBotRepo.save).toHaveBeenCalled();
      expect(data).toEqual(
        expect.objectContaining({
          id: "bot_1",
          name: "My Assistant",
          public_key: "mocked_nanoid_16",
        })
      );
    });

    describe("validation", () => {
      const post = (body: string) => POST(new Request("http://localhost/api/bots", { method: "POST", body }));

      beforeEach(() => {
        (getUserFromRequest as jest.Mock).mockResolvedValueOnce(mockUser);
      });

      it("returns 400 for a body that isn't JSON", async () => {
        const res = await post("not json");

        expect(res.status).toBe(400);
        expect(mockBotRepo.save).not.toHaveBeenCalled();
      });

      it("returns 400 with the list of problems and saves nothing", async () => {
        const res = await post(
          JSON.stringify({
            name: "",
            logoUrl: "javascript:alert(1)",
            ecommerceProducts: Array.from({ length: 5001 }, () => ({ name: "P", price: 1, url: "https://s.test" })),
          }),
        );
        const data = await res.json();

        expect(res.status).toBe(400);
        expect(data.error).toBe("Some bot settings are invalid");
        expect(data.details).toEqual([
          expect.stringMatching(/^name:/),
          expect.stringMatching(/^logoUrl:/),
          expect.stringMatching(/^ecommerceProducts:/),
        ]);
        expect(mockBotRepo.save).not.toHaveBeenCalled();
      });

      it("applies defaults and never takes the owner from the body", async () => {
        const res = await post(JSON.stringify({ name: "Defaults", user_id: "someone-else" }));

        expect(res.status).toBe(200);
        expect(mockBotRepo.create).toHaveBeenCalledWith(
          expect.objectContaining({
            name: "Defaults",
            tone: "friendly",
            primary_color: "#000000",
            contact_enabled: false,
            ecommerce_products: [],
            user_id: mockUser.id,
          }),
        );
      });
    });
  });
});
