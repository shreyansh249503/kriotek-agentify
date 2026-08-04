import { GET, OPTIONS } from "./route";
import { getDb } from "@/app/api/lib/db";
import { getUserFromRequest } from "@/app/api/lib/auth";

jest.mock("@/app/api/lib/db");
jest.mock("@/app/api/lib/auth");

describe("GET /api/admin/conversations/[id]", () => {
  const mockUser = { id: "user_123", email: "admin@example.com" };
  const mockRepo = {
    findOne: jest.fn(),
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
  });

  it("should return 401 when user is not authenticated", async () => {
    (getUserFromRequest as jest.Mock).mockResolvedValueOnce(null);

    const req = new Request("http://localhost/api/admin/conversations/c_1");
    const params = Promise.resolve({ id: "c_1" });
    const res = await GET(req, { params });
    const data = await res.json();

    expect(res.status).toBe(401);
    expect(data).toEqual({ error: "Unauthorized" });
  });

  it("should return 404 when conversation is not found", async () => {
    (getUserFromRequest as jest.Mock).mockResolvedValueOnce(mockUser);
    mockRepo.findOne.mockResolvedValueOnce(null);

    const req = new Request("http://localhost/api/admin/conversations/non_existent");
    const params = Promise.resolve({ id: "non_existent" });
    const res = await GET(req, { params });
    const data = await res.json();

    expect(res.status).toBe(404);
    expect(data).toEqual({ error: "Conversation not found" });
  });

  it("should return conversation details when found", async () => {
    (getUserFromRequest as jest.Mock).mockResolvedValueOnce(mockUser);
    mockRepo.findOne.mockResolvedValueOnce({
      id: "convo_1",
      state: "manual",
      messages: JSON.stringify([
        { role: "user", content: "Hello" },
        { role: "assistant", content: "Hi there!" },
      ]),
    });

    const req = new Request("http://localhost/api/admin/conversations/convo_1");
    const params = Promise.resolve({ id: "convo_1" });
    const res = await GET(req, { params });
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toEqual({
      state: "manual",
      messages: [
        { role: "user", content: "Hello" },
        { role: "assistant", content: "Hi there!" },
      ],
    });
  });

  it("should return 500 when fetching conversation throws database error", async () => {
    jest.spyOn(console, "error").mockImplementationOnce(() => {});
    (getUserFromRequest as jest.Mock).mockResolvedValueOnce(mockUser);
    mockRepo.findOne.mockRejectedValueOnce(new Error("DB failure"));

    const req = new Request("http://localhost/api/admin/conversations/convo_err");
    const params = Promise.resolve({ id: "convo_err" });
    const res = await GET(req, { params });
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data).toEqual({ error: "Internal Server Error" });
  });
});
