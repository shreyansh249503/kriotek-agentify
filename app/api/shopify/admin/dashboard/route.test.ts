process.env.NEXT_PUBLIC_SUPABASE_URL = "https://supabase.example.com";
process.env.SUPABASE_SERVICE_ROLE_KEY = "test_service_key";

import { GET } from "./route";
import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getDb } from "@/app/api/lib/db";
import { verifySessionToken, getShopFromSession } from "../../lib/verifySessionToken";

jest.mock("@supabase/supabase-js", () => ({
  createClient: jest.fn(),
}));

jest.mock("@/app/api/lib/db");

jest.mock("../../lib/verifySessionToken", () => ({
  verifySessionToken: jest.fn(),
  getShopFromSession: jest.fn(),
}));

describe("API: /api/shopify/admin/dashboard", () => {
  const mockFrom = jest.fn();

  const createMockQueryBuilder = (rows: { month: string; count: string }[]) => ({
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    getRawMany: jest.fn().mockResolvedValue(rows),
  });

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {});

    (createClient as jest.Mock).mockReturnValue({ from: mockFrom });
    (verifySessionToken as jest.Mock).mockReturnValue({ shop: "test-shop.myshopify.com" });
    (getShopFromSession as jest.Mock).mockReturnValue("test-shop.myshopify.com");
  });

  it("should return 401 if session token verification fails", async () => {
    (verifySessionToken as jest.Mock).mockImplementationOnce(() => {
      throw new Error("Unauthorized");
    });

    const req = new NextRequest("http://localhost/api/shopify/admin/dashboard");
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(401);
    expect(data).toEqual({ error: "Unauthorized" });
  });

  it("should return 404 if shopify store is not found in Supabase", async () => {
    mockFrom.mockReturnValueOnce({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValueOnce({ data: null, error: new Error("Store not found") }),
        }),
      }),
    });

    const req = new NextRequest("http://localhost/api/shopify/admin/dashboard", {
      headers: { authorization: "Bearer token" },
    });
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(404);
    expect(data).toEqual({ error: "Store not found" });
  });

  it("should return dashboard statistics and monthly trends when bot exists", async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === "shopify_stores") {
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValueOnce({ data: { bot_id: "bot_123" } }),
            }),
          }),
        };
      }
      if (table === "bots") {
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValueOnce({
                data: { id: "bot_123", name: "Test Bot", ecommerce_enabled: true, ecommerce_products: [{}, {}] },
              }),
            }),
          }),
        };
      }
      if (table === "conversations" || table === "leads") {
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValueOnce({ count: 12 }),
          }),
        };
      }
      return {};
    });

    const mockConvoQb = createMockQueryBuilder([]);
    const mockLeadQb = createMockQueryBuilder([]);

    let qbCount = 0;
    (getDb as jest.Mock).mockResolvedValueOnce({
      getRepository: jest.fn().mockImplementation(() => {
        qbCount++;
        return { createQueryBuilder: () => (qbCount === 1 ? mockConvoQb : mockLeadQb) };
      }),
    });

    const req = new NextRequest("http://localhost/api/shopify/admin/dashboard", {
      headers: { authorization: "Bearer token" },
    });

    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.shop).toBe("test-shop.myshopify.com");
    expect(data.stats).toEqual({
      total_conversations: 12,
      total_leads: 12,
      products_synced: 2,
    });
    expect(data.trend).toHaveLength(6);
  });
});
