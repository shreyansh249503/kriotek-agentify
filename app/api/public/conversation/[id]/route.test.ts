import { GET, OPTIONS } from "./route";
import { getDb } from "@/app/api/lib/db";
import { NextRequest } from "next/server";

jest.mock("@/app/api/lib/db");

describe("GET /api/public/conversation/[id]", () => {
  const mockBotRepo = {
    findOne: jest.fn(),
  };
  const mockConvoRepo = {
    findOne: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (getDb as jest.Mock).mockResolvedValue({
      getRepository: jest.fn().mockImplementation((entity: string) => {
        if (entity === "Bot") return mockBotRepo;
        if (entity === "Conversation") return mockConvoRepo;
        return null;
      }),
    });
  });

  it("should handle OPTIONS request with 204 status", async () => {
    const res = await OPTIONS();
    expect(res.status).toBe(204);
  });

  it("should return 400 when id or publicKey query param is missing", async () => {
    const req = new NextRequest("http://localhost/api/public/conversation/c1"); // missing publicKey param
    const params = Promise.resolve({ id: "c1" });
    const res = await GET(req, { params });
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data).toEqual({ error: "Missing ID or publicKey" });
  });

  it("should return 404 when bot is not found", async () => {
    mockBotRepo.findOne.mockResolvedValueOnce(null);

    const req = new NextRequest("http://localhost/api/public/conversation/c1?publicKey=invalid_pk");
    const params = Promise.resolve({ id: "c1" });
    const res = await GET(req, { params });
    const data = await res.json();

    expect(res.status).toBe(404);
    expect(data).toEqual({ error: "Bot not found" });
  });

  it("should return state idle and empty messages when conversation is not found", async () => {
    mockBotRepo.findOne.mockResolvedValueOnce({ id: "bot_1" });
    mockConvoRepo.findOne.mockResolvedValueOnce(null);

    const req = new NextRequest("http://localhost/api/public/conversation/non_existent?publicKey=pk_123");
    const params = Promise.resolve({ id: "non_existent" });
    const res = await GET(req, { params });
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toEqual({ state: "idle", messages: [] });
  });

  it("should return conversation state and parsed messages when found", async () => {
    mockBotRepo.findOne.mockResolvedValueOnce({ id: "bot_1" });
    mockConvoRepo.findOne.mockResolvedValueOnce({
      id: "c1",
      state: "manual",
      messages: JSON.stringify([
        { role: "user", content: "Hello" },
        { role: "assistant", content: "Hi" },
      ]),
    });

    const req = new NextRequest("http://localhost/api/public/conversation/c1?publicKey=pk_123");
    const params = Promise.resolve({ id: "c1" });
    const res = await GET(req, { params });
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toEqual({
      state: "manual",
      messages: [
        { role: "user", content: "Hello" },
        { role: "assistant", content: "Hi" },
      ],
    });
  });

  it("should return 500 when database operation throws error", async () => {
    jest.spyOn(console, "error").mockImplementationOnce(() => {});
    mockBotRepo.findOne.mockRejectedValueOnce(new Error("DB failure"));

    const req = new NextRequest("http://localhost/api/public/conversation/c1?publicKey=pk_123");
    const params = Promise.resolve({ id: "c1" });
    const res = await GET(req, { params });
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data).toEqual({ error: "Internal Server Error" });
  });
});
