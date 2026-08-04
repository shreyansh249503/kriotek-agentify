import { GET, OPTIONS } from "./route";
import { getDb } from "@/app/api/lib/db";
import { getUserFromRequest } from "@/app/api/lib/auth";

jest.mock("@/app/api/lib/db");
jest.mock("@/app/api/lib/auth");

describe("GET /api/admin/conversations", () => {
  const mockUser = { id: "user_123", email: "admin@example.com" };
  const mockRepo = {
    find: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (getDb as jest.Mock).mockResolvedValue({
      getRepository: jest.fn().mockReturnValue(mockRepo),
    });
  });

  it("should handle OPTIONS request with 204 status", async () => {
    const res = await OPTIONS();
    expect(res.status).toBe(204);
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe("*");
  });

  it("should return 401 when user is not authenticated", async () => {
    (getUserFromRequest as jest.Mock).mockResolvedValueOnce(null);

    const req = new Request("http://localhost/api/admin/conversations");
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(401);
    expect(data).toEqual({ error: "Unauthorized" });
  });

  it("should return formatted list of conversations for authenticated user", async () => {
    (getUserFromRequest as jest.Mock).mockResolvedValueOnce(mockUser);

    const mockConvos = [
      {
        id: "convo_1",
        bot_id: "bot_1",
        bot: { name: "Support Bot" },
        state: "manual",
        name: "John Doe",
        email: "john@example.com",
        phone: "+123456789",
        messages: JSON.stringify([
          { role: "user", content: "I need help with my order [SHOW_SUPPORT_BUTTON]" },
        ]),
        created_at: "2026-08-04T10:00:00Z",
      },
      {
        id: "convo_2",
        bot_id: "bot_2",
        bot: { name: "Sales Bot" },
        state: "manual",
        name: "Jane Smith",
        email: "jane@example.com",
        phone: null,
        messages: [
          { role: "user", content: "Hi" },
          { role: "assistant", content: "Hello! How can I assist you today?" },
        ],
        created_at: "2026-08-04T11:00:00Z",
      },
    ];

    mockRepo.find.mockResolvedValueOnce(mockConvos);

    const req = new Request("http://localhost/api/admin/conversations");
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toHaveLength(2);
    expect(data[0]).toEqual({
      id: "convo_1",
      bot_id: "bot_1",
      bot_name: "Support Bot",
      state: "manual",
      name: "John Doe",
      email: "john@example.com",
      phone: "+123456789",
      snippet: "I need help with my order ",
      created_at: "2026-08-04T10:00:00Z",
    });
    expect(data[1].snippet).toBe("Hello! How can I assist you today?");
  });

  it("should handle corrupted message JSON gracefully with empty snippet", async () => {
    (getUserFromRequest as jest.Mock).mockResolvedValueOnce(mockUser);

    mockRepo.find.mockResolvedValueOnce([
      {
        id: "convo_corrupt",
        bot_id: "bot_1",
        bot: { name: "Support Bot" },
        state: "manual",
        name: "Test",
        email: "test@example.com",
        phone: null,
        messages: "{ invalid json",
        created_at: "2026-08-04T10:00:00Z",
      },
    ]);

    const req = new Request("http://localhost/api/admin/conversations");
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data[0].snippet).toBe("");
  });

  it("should return 500 when database operation fails", async () => {
    jest.spyOn(console, "error").mockImplementationOnce(() => {});
    (getUserFromRequest as jest.Mock).mockResolvedValueOnce(mockUser);
    mockRepo.find.mockRejectedValueOnce(new Error("Database connection lost"));

    const req = new Request("http://localhost/api/admin/conversations");
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data).toEqual({ error: "Internal Server Error" });
  });
});
