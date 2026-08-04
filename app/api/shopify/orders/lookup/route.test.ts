process.env.NEXT_PUBLIC_SUPABASE_URL = "https://supabase.example.com";
process.env.SUPABASE_SERVICE_ROLE_KEY = "test_service_key";

import { POST } from "./route";
import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { mapShopifyOrderToJourney } from "@/lib/shopify/shopifyOrderMapper";

jest.mock("@supabase/supabase-js", () => ({
  createClient: jest.fn(),
}));

jest.mock("@/lib/shopify/shopifyOrderMapper", () => ({
  mapShopifyOrderToJourney: jest.fn().mockReturnValue({ orderId: "1001", status: "Delivered" }),
}));

describe("API: /api/shopify/orders/lookup", () => {
  const mockSingle = jest.fn();
  const mockEq = jest.fn();
  const mockSelect = jest.fn(() => ({ eq: mockEq }));
  const mockFrom = jest.fn(() => ({ select: mockSelect }));
  const originalFetch = global.fetch;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {});

    mockEq.mockImplementation(() => ({
      single: mockSingle,
      eq: mockEq,
    }));

    (createClient as jest.Mock).mockReturnValue({ from: mockFrom });
    global.fetch = jest.fn();
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  it("should return 400 if order_number is missing", async () => {
    const req = new NextRequest("http://localhost/api/shopify/orders/lookup", {
      method: "POST",
      body: JSON.stringify({ bot_id: "bot_123" }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data).toEqual({ error: "Order number is required." });
  });

  it("should return 400 if neither bot_id nor public_key is provided", async () => {
    const req = new NextRequest("http://localhost/api/shopify/orders/lookup", {
      method: "POST",
      body: JSON.stringify({ order_number: "#1001" }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data).toEqual({ error: "Bot ID or public key is required." });
  });

  it("should resolve bot_id via public_key when bot_id is not provided", async () => {
    mockSingle
      .mockResolvedValueOnce({ data: { id: "bot_resolved" } }) // bots table
      .mockResolvedValueOnce({ data: { shop: "shop.myshopify.com", access_token: "token_123" } }); // shopify_stores table

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue({
        data: {
          orders: {
            edges: [
              {
                node: {
                  id: "gid://shopify/Order/1001",
                  name: "#1001",
                  email: "customer@example.com",
                },
              },
            ],
          },
        },
      }),
    });

    const req = new NextRequest("http://localhost/api/shopify/orders/lookup", {
      method: "POST",
      body: JSON.stringify({ public_key: "pk_test", order_number: "1001", email: "customer@example.com" }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.ok).toBe(true);
    expect(mapShopifyOrderToJourney).toHaveBeenCalled();
  });

  it("should return 404 if shopify store integration is not found for bot", async () => {
    mockSingle.mockResolvedValueOnce({ data: null, error: new Error("Not found") });

    const req = new NextRequest("http://localhost/api/shopify/orders/lookup", {
      method: "POST",
      body: JSON.stringify({ bot_id: "bot_123", order_number: "1001" }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(404);
    expect(data).toEqual({ error: "Shopify store integration not found for this assistant." });
  });

  it("should return 404 if order is not found in store", async () => {
    mockSingle.mockResolvedValueOnce({ data: { shop: "shop.myshopify.com", access_token: "token_123" } });

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ data: { orders: { edges: [] } } }),
    });

    const req = new NextRequest("http://localhost/api/shopify/orders/lookup", {
      method: "POST",
      body: JSON.stringify({ bot_id: "bot_123", order_number: "9999" }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(404);
    expect(data.error).toContain("not found in store");
  });

  it("should return 401 if order number exists but email/phone verification fails", async () => {
    mockSingle.mockResolvedValueOnce({ data: { shop: "shop.myshopify.com", access_token: "token_123" } });

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue({
        data: {
          orders: {
            edges: [
              {
                node: {
                  id: "gid://shopify/Order/1001",
                  name: "#1001",
                  email: "actual_customer@example.com",
                },
              },
            ],
          },
        },
      }),
    });

    const req = new NextRequest("http://localhost/api/shopify/orders/lookup", {
      method: "POST",
      body: JSON.stringify({ bot_id: "bot_123", order_number: "1001", email: "wrong@example.com" }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(401);
    expect(data.error).toBe("Verification failed");
    expect(data.requiresVerification).toBe(true);
  });
});
