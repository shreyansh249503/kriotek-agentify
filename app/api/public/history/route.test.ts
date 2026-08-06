import { POST, OPTIONS } from "./route";
import { getDb } from "@/app/api/lib/db";

jest.mock("@/app/api/lib/db");

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
      body: JSON.stringify({ publicKey: "pk_invalid", conversationIds: ["c1"] }),
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
        id: "c1",
        created_at: "2026-08-04T12:00:00Z",
        messages: JSON.stringify([
          { role: "user", content: longMsg },
        ]),
      },
      {
        id: "c2",
        created_at: "2026-08-04T12:05:00Z",
        messages: [{ role: "assistant", content: "Short assistant msg" }],
      },
    ]);

    const req = new Request("http://localhost/api/public/history", {
      method: "POST",
      body: JSON.stringify({ publicKey: "pk_123", conversationIds: ["c1", "c2"] }),
    });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toHaveLength(2);
    expect(data[0].id).toBe("c1");
    expect(data[0].snippet).toBe(longMsg.substring(0, 60) + "...");
    expect(data[1].id).toBe("c2");
    expect(data[1].snippet).toBe("Short assistant msg");
  });

  it("should return 500 when database throws an exception", async () => {
    jest.spyOn(console, "error").mockImplementationOnce(() => {});
    mockBotRepo.findOne.mockRejectedValueOnce(new Error("DB failure"));

    const req = new Request("http://localhost/api/public/history", {
      method: "POST",
      body: JSON.stringify({ publicKey: "pk_123", conversationIds: ["c1"] }),
    });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data).toEqual({ error: "Internal Server Error" });
  });
});
