process.env.NEXT_PUBLIC_SUPABASE_URL = "https://supabase.example.com";
process.env.SUPABASE_SERVICE_ROLE_KEY = "test_service_key";

import { POST } from "./route";
import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

jest.mock("@supabase/supabase-js", () => ({
  createClient: jest.fn(),
}));

describe("API: /api/shopify/sync", () => {
  const mockSingle = jest.fn();
  const mockUpdate = jest.fn();
  const mockEq = jest.fn();
  const mockSelect = jest.fn(() => ({ eq: mockEq }));
  const mockFrom = jest.fn();
  const originalFetch = global.fetch;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {});

    mockEq.mockImplementation(() => ({
      single: mockSingle,
      eq: mockEq,
    }));

    mockFrom.mockImplementation((table: string) => {
      if (table === "shopify_stores") {
        return { select: mockSelect, update: mockUpdate, eq: mockEq };
      }
      if (table === "bots") {
        return { update: mockUpdate, eq: mockEq };
      }
      return {};
    });

    (createClient as jest.Mock).mockReturnValue({ from: mockFrom });
    global.fetch = jest.fn();
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  it("should return 400 if shop or bot_id is missing", async () => {
    const req = new NextRequest("http://localhost/api/shopify/sync", {
      method: "POST",
      body: JSON.stringify({ shop: "test.myshopify.com" }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data).toEqual({ error: "shop and bot_id are required" });
  });

  it("should return 404 if shop is not found in shopify_stores table", async () => {
    mockSingle.mockResolvedValueOnce({ data: null, error: new Error("Not found") });

    const req = new NextRequest("http://localhost/api/shopify/sync", {
      method: "POST",
      body: JSON.stringify({ shop: "unknown.myshopify.com", bot_id: "bot_123" }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(404);
    expect(data).toEqual({ error: "Shop not found or not installed" });
  });

  it("should return 502 if Shopify GraphQL API returns non-200 status", async () => {
    mockSingle.mockResolvedValueOnce({ data: { access_token: "shpat_123" } });
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: false, status: 500 });

    const req = new NextRequest("http://localhost/api/shopify/sync", {
      method: "POST",
      body: JSON.stringify({ shop: "test.myshopify.com", bot_id: "bot_123" }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(502);
    expect(data).toEqual({ error: "Shopify API call failed" });
  });

  it("should return 502 if Shopify GraphQL response includes errors", async () => {
    mockSingle.mockResolvedValueOnce({ data: { access_token: "shpat_123" } });
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue({ errors: [{ message: "Unauthorized access to products" }] }),
    });

    const req = new NextRequest("http://localhost/api/shopify/sync", {
      method: "POST",
      body: JSON.stringify({ shop: "test.myshopify.com", bot_id: "bot_123" }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(502);
    expect(data.error).toBe("Shopify GraphQL error");
  });

  it("should sync products, update bot, and return success payload", async () => {
    mockSingle.mockResolvedValueOnce({ data: { access_token: "shpat_123" } });
    mockUpdate.mockReturnValue({ eq: jest.fn().mockResolvedValue({ error: null }) });

    const mockProductsResponse = {
      data: {
        products: {
          pageInfo: { hasNextPage: false, endCursor: null },
          edges: [
            {
              node: {
                id: "gid://shopify/Product/1",
                title: "Leather Jacket",
                descriptionHtml: "<p>Classic leather jacket</p>",
                handle: "leather-jacket",
                status: "ACTIVE",
                priceRangeV2: { minVariantPrice: { amount: "199.99", currencyCode: "USD" } },
                images: { edges: [{ node: { url: "https://cdn.shopify.com/jacket.jpg" } }] },
                variants: { edges: [{ node: { id: "v1", price: "199.99", availableForSale: true } }] },
              },
            },
          ],
        },
      },
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue(mockProductsResponse),
    });

    const req = new NextRequest("http://localhost/api/shopify/sync", {
      method: "POST",
      body: JSON.stringify({ shop: "test.myshopify.com", bot_id: "bot_123" }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toEqual({
      success: true,
      synced: 1,
      products: [
        {
          shopify_id: "gid://shopify/Product/1",
          name: "Leather Jacket",
          description: "Classic leather jacket",
          price: 199.99,
          currency: "USD",
          image_url: "https://cdn.shopify.com/jacket.jpg",
          url: "https://test.myshopify.com/products/leather-jacket",
          available: true,
        },
      ],
    });
  });

  it("should return 500 when Supabase bot update returns error", async () => {
    mockSingle.mockResolvedValueOnce({ data: { access_token: "shpat_123" } });
    mockUpdate.mockReturnValue({ eq: jest.fn().mockResolvedValue({ error: new Error("Update bot error") }) });

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue({
        data: {
          products: {
            pageInfo: { hasNextPage: false, endCursor: null },
            edges: [],
          },
        },
      }),
    });

    const req = new Request("http://localhost/api/shopify/sync", {
      method: "POST",
      body: JSON.stringify({ shop: "test.myshopify.com", bot_id: "bot_123" }),
    });

    const res = await POST(req as NextRequest);
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data).toEqual({ error: "Failed to save products to bot" });
  });
});
