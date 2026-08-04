import { GET, OPTIONS } from "./route";
import { getDb } from "../lib/db";
import { getUserFromRequest } from "../lib/auth";

jest.mock("../lib/db");
jest.mock("../lib/auth");

describe("API: /api/leads", () => {
  const mockUser = { id: "user_123", email: "admin@example.com" };
  const mockLeadRepo = {
    find: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (getDb as jest.Mock).mockResolvedValue({
      getRepository: jest.fn().mockReturnValue(mockLeadRepo),
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

      const req = new Request("http://localhost/api/leads");
      const res = await GET(req);
      const data = await res.json();

      expect(res.status).toBe(401);
      expect(data).toEqual({ error: "Unauthorized" });
    });

    it("should return formatted leads for the user's bots", async () => {
      (getUserFromRequest as jest.Mock).mockResolvedValueOnce(mockUser);

      const mockLeads = [
        {
          id: "lead_1",
          name: "John Lead",
          email: "john@example.com",
          bot: { name: "Sales Bot" },
        },
      ];
      mockLeadRepo.find.mockResolvedValueOnce(mockLeads);

      const req = new Request("http://localhost/api/leads");
      const res = await GET(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(mockLeadRepo.find).toHaveBeenCalledWith({
        relations: ["bot"],
        where: { bot: { user_id: mockUser.id } },
        order: { created_at: "DESC" },
      });
      expect(data).toEqual([
        {
          id: "lead_1",
          name: "John Lead",
          email: "john@example.com",
          bot: { name: "Sales Bot" },
          bot_name: "Sales Bot",
        },
      ]);
    });

    it("should return 500 when database throws an error", async () => {
      jest.spyOn(console, "error").mockImplementationOnce(() => {});
      (getUserFromRequest as jest.Mock).mockResolvedValueOnce(mockUser);
      mockLeadRepo.find.mockRejectedValueOnce(new Error("Database failure"));

      const req = new Request("http://localhost/api/leads");
      const res = await GET(req);
      const data = await res.json();

      expect(res.status).toBe(500);
      expect(data).toEqual({ error: "Internal Server Error" });
    });
  });
});
