import { GET, OPTIONS } from "./route";
import { getDb } from "../lib/db";
import { getUserFromRequest } from "../lib/auth";

jest.mock("../lib/db");
jest.mock("../lib/auth");

describe("API: /api/analytics", () => {
  const mockUser = { id: "user_123", email: "admin@example.com" };

  const createMockQueryBuilder = (resultData: unknown[]) => ({
    leftJoin: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    addGroupBy: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    getRawMany: jest.fn().mockResolvedValue(resultData),
  });

  beforeEach(() => {
    jest.clearAllMocks();
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

      const req = new Request("http://localhost/api/analytics");
      const res = await GET(req);
      const data = await res.json();

      expect(res.status).toBe(401);
      expect(data).toEqual({ error: "Unauthorized" });
    });

    it("should return compiled analytics data for user's bots", async () => {
      (getUserFromRequest as jest.Mock).mockResolvedValueOnce(mockUser);

      const mockConvosPerBot = [
        {
          bot_id: "bot_1",
          bot_name: "Support Bot",
          total_conversations: "10",
          total_messages: "50",
        },
      ];

      const mockLeadsPerBot = [
        {
          bot_id: "bot_1",
          bot_name: "Support Bot",
          total_leads: "3",
        },
      ];

      const mockMonthlyTrend = [
        { month: "Aug 26", conversations: 10, leads: 3 },
      ];

      const qbConvos = createMockQueryBuilder(mockConvosPerBot);
      const qbLeads = createMockQueryBuilder(mockLeadsPerBot);

      let qbCallCount = 0;
      const getRepositoryMock = jest.fn().mockImplementation(() => {
        qbCallCount++;
        return {
          createQueryBuilder: () => (qbCallCount === 1 ? qbConvos : qbLeads),
        };
      });

      const mockQuery = jest.fn().mockResolvedValue(mockMonthlyTrend);

      (getDb as jest.Mock).mockResolvedValue({
        getRepository: getRepositoryMock,
        query: mockQuery,
      });

      const req = new Request("http://localhost/api/analytics");
      const res = await GET(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data).toEqual({
        convosPerBot: mockConvosPerBot,
        leadsPerBot: mockLeadsPerBot,
        monthlyTrend: mockMonthlyTrend,
        totals: {
          total_conversations: 10,
          total_messages: 50,
          total_leads: 3,
        },
      });
      expect(mockQuery).toHaveBeenCalledWith(expect.any(String), [mockUser.id]);
    });
  });
});
