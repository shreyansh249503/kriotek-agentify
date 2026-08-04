import { GET, OPTIONS } from "./route";
import { getDb } from "@/app/api/lib/db";

jest.mock("@/app/api/lib/db");

describe("GET /api/public/bot/[publicKey]", () => {
  const mockRepo = {
    findOne: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "log").mockImplementation(() => {});
    (getDb as jest.Mock).mockResolvedValue({
      getRepository: jest.fn().mockReturnValue(mockRepo),
    });
  });

  it("should handle OPTIONS request with 204 status", async () => {
    const res = await OPTIONS();
    expect(res.status).toBe(204);
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe("*");
  });

  it("should return 404 when bot is not found", async () => {
    mockRepo.findOne.mockResolvedValueOnce(null);

    const req = new Request("http://localhost/api/public/bot/invalid_pk");
    const params = Promise.resolve({ publicKey: "invalid_pk" });
    const res = await GET(req, { params });
    const data = await res.json();

    expect(res.status).toBe(404);
    expect(data).toEqual({ error: "Bot not found" });
  });

  it("should return bot configuration when found", async () => {
    const mockBot = {
      name: "Acme Bot",
      primary_color: "#4f46e5",
      logo_url: "https://example.com/logo.png",
      ecommerce_enabled: true,
    };
    mockRepo.findOne.mockResolvedValueOnce(mockBot);

    const req = new Request("http://localhost/api/public/bot/pk_valid_123");
    const params = Promise.resolve({ publicKey: "pk_valid_123" });
    const res = await GET(req, { params });
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toEqual({
      name: "Acme Bot",
      primary_color: "#4f46e5",
      logo_url: "https://example.com/logo.png",
      ecommerce_enabled: true,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || null,
      supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || null,
    });
  });

  it("should handle database error gracefully and return 404", async () => {
    jest.spyOn(console, "error").mockImplementationOnce(() => {});
    mockRepo.findOne.mockRejectedValueOnce(new Error("Database error"));

    const req = new Request("http://localhost/api/public/bot/pk_err_999");
    const params = Promise.resolve({ publicKey: "pk_err_999" });
    const res = await GET(req, { params });
    const data = await res.json();

    expect(res.status).toBe(404);
    expect(data).toEqual({ error: "Bot not found" });
  });
});
