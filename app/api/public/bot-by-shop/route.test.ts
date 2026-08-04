import { GET, OPTIONS } from "./route";
import { getDb } from "@/app/api/lib/db";
import { NextRequest } from "next/server";

jest.mock("@/app/api/lib/db");

describe("GET /api/public/bot-by-shop", () => {
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

  it("should return 400 when shop parameter is missing", async () => {
    const req = new NextRequest("http://localhost/api/public/bot-by-shop");
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data).toEqual({ error: "Missing shop parameter" });
  });

  it("should return 404 when bot is not found for the shop", async () => {
    mockRepo.findOne.mockResolvedValueOnce(null);

    const req = new NextRequest("http://localhost/api/public/bot-by-shop?shop=unknown-shop.myshopify.com");
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(404);
    expect(data).toEqual({ error: "Bot not found for this shop" });
  });

  it("should clean shop domain URL and return bot configuration when store exists", async () => {
    const mockStore = {
      shop: "my-store.myshopify.com",
      bot: {
        public_key: "pk_shop_bot_123",
        name: "Shopify Assistant",
        primary_color: "#10b981",
        logo_url: null,
        ecommerce_enabled: true,
      },
    };
    mockRepo.findOne.mockResolvedValueOnce(mockStore);

    const req = new NextRequest("http://localhost/api/public/bot-by-shop?shop=https://my-store.myshopify.com/path");
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toEqual({
      publicKey: "pk_shop_bot_123",
      name: "Shopify Assistant",
      primary_color: "#10b981",
      logo_url: null,
      ecommerce_enabled: true,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || null,
      supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || null,
    });
  });

  it("should return 500 when database throws an exception", async () => {
    jest.spyOn(console, "error").mockImplementationOnce(() => {});
    mockRepo.findOne.mockRejectedValueOnce(new Error("Database offline"));

    const req = new NextRequest("http://localhost/api/public/bot-by-shop?shop=error-shop.myshopify.com");
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data).toEqual({ error: "Internal server error" });
  });
});
