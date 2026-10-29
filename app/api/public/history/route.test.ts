import { POST, OPTIONS } from "./route";
import { getDb } from "@/app/api/lib/db";

jest.mock("@/app/api/lib/db");

const C1 = "11111111-1111-4111-8111-111111111111";
const C2 = "22222222-2222-4222-8222-222222222222";

describe("POST /api/public/history", () => {
  const mockBotRepo = {
    findOne: jest.fn(),
  };
  const mockConvoRepo = {
    find: jest.fn(),
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

  it("should return 400 when publicKey or conversationIds array is missing", async () => {
    const req = new Request("http://localhost/api/public/history", {
      method: "POST",
      body: JSON.stringify({ publicKey: "pk_123" }),
    });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data).toEqual({ error: "Invalid request" });
  });

  it("should return 404 when bot is not found for public key", async () => {
    mockBotRepo.findOne.mockResolvedValueOnce(null);

    const req = new Request("http://localhost/api/public/history", {
      method: "POST",
      body: JSON.stringify({ publicKey: "pk_invalid", conversationIds: [C1] }),
    });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(404);
    expect(data).toEqual({ error: "Bot not found" });
  });

  it("should return conversation summaries truncated to 60 chars", async () => {
    mockBotRepo.findOne.mockResolvedValueOnce({ id: "bot_1", public_key: "pk_123" });
    const longMsg = "This is a very long user message that exceeds 60 characters in total length to test snippet truncation logic.";
    mockConvoRepo.find.mockResolvedValueOnce([
      {
        id: C1,
        created_at: "2026-08-04T12:00:00Z",
        messages: JSON.stringify([
          { role: "user", content: longMsg },
        ]),
      },
      {
        id: C2,
        created_at: "2026-08-04T12:05:00Z",
        messages: [{ role: "assistant", content: "Short assistant msg" }],
      },
    ]);

    const req = new Request("http://localhost/api/public/history", {
      method: "POST",
      body: JSON.stringify({ publicKey: "pk_123", conversationIds: [C1, C2] }),
    });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toHaveLength(2);
    expect(data[0].id).toBe(C1);
    expect(data[0].snippet).toBe(longMsg.substring(0, 60) + "...");
    expect(data[1].id).toBe(C2);
    expect(data[1].snippet).toBe("Short assistant msg");
  });

  it("should return 500 when database throws an exception", async () => {
    jest.spyOn(console, "error").mockImplementationOnce(() => {});
    mockBotRepo.findOne.mockRejectedValueOnce(new Error("DB failure"));

    const req = new Request("http://localhost/api/public/history", {
      method: "POST",
      body: JSON.stringify({ publicKey: "pk_123", conversationIds: [C1] }),
    });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data).toEqual({ error: "Internal Server Error" });
  });

  it("should drop invalid IDs and look up at most 50 conversations", async () => {
    mockBotRepo.findOne.mockResolvedValueOnce({ id: "bot_1", public_key: "pk_123" });
    mockConvoRepo.find.mockResolvedValueOnce([]);
    const manyIds = Array.from({ length: 80 }, (_, i) =>
      `00000000-0000-4000-8000-${String(i).padStart(12, "0")}`
    );

    const req = new Request("http://localhost/api/public/history", {
      method: "POST",
      body: JSON.stringify({ publicKey: "pk_123", conversationIds: ["not-a-uuid", { $ne: null }, ...manyIds] }),
    });
    const res = await POST(req);

    expect(res.status).toBe(200);
    const where = mockConvoRepo.find.mock.calls[0][0].where;
    expect(where.id.value).toEqual(manyIds.slice(0, 50));
  });

  it("should return 429 with CORS headers when rate limited", async () => {
    const send = () =>
      POST(
        new Request("http://localhost/api/public/history", {
          method: "POST",
          headers: { "x-forwarded-for": "203.0.113.77" },
          body: JSON.stringify({ publicKey: "pk_123", conversationIds: [] }),
        })
      );

    for (let i = 0; i < 20; i++) await send();
    const res = await send();

    expect(res.status).toBe(429);
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe("*");
  });
});
