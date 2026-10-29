process.env.NEXT_PUBLIC_SUPABASE_URL = "https://supabase.example.com";
process.env.SUPABASE_SERVICE_ROLE_KEY = "test_service_key";

import { POST } from "./route";
import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

jest.mock("@supabase/supabase-js", () => ({
  createClient: jest.fn(),
}));

jest.mock("../../lib/auth", () => ({
  getUserFromRequest: jest.fn().mockResolvedValue(null),
}));

jest.mock("../lib/verifySessionToken", () => ({
  verifySessionToken: jest.fn(),
  getShopFromSession: jest.fn((session) => new URL(session.dest).hostname),
}));

import { verifySessionToken } from "../lib/verifySessionToken";
import { getUserFromRequest } from "../../lib/auth";

describe("API: /api/shopify/sync", () => {
  const mockSingle = jest.fn();
  const mockUpdate = jest.fn();
  const mockEq = jest.fn();
  const mockSelect = jest.fn(() => ({ eq: mockEq }));
  const mockFrom = jest.fn();
  const originalFetch = global.fetch;
  const mockedVerifySession = verifySessionToken as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {});

    mockedVerifySession.mockReturnValue({
      dest: "https://test.myshopify.com",
    });

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

    mockUpdate.mockReturnValue({
      eq: jest.fn().mockResolvedValue({ error: null }),
    });

    (createClient as jest.Mock).mockReturnValue({ from: mockFrom });
    global.fetch = jest.fn();
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  const createReq = (body: Record<string, unknown>, headers: Record<string, string> = { Authorization: "Bearer valid_token" }) => {
    return new NextRequest("http://localhost/api/shopify/sync", {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });
  };

  it("should return 401 if unauthenticated or token invalid", async () => {
    mockedVerifySession.mockImplementationOnce(() => {
      throw new Error("Invalid token");
    });

    const req = createReq(
      { shop: "test.myshopify.com", bot_id: "bot_123" },
      { Authorization: "Bearer invalid_token" }
    );

    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("should return 401 if authorization header is missing completely", async () => {
    const req = new NextRequest("http://localhost/api/shopify/sync", {
      method: "POST",
      body: JSON.stringify({ shop: "test.myshopify.com", bot_id: "bot_123" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("should return 400 if shop or bot_id is missing", async () => {
    const req = createReq({ shop: "test.myshopify.com" });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data).toEqual({ error: "shop and bot_id are required" });
  });

  it("should return 404 if shop is not found in shopify_stores table", async () => {
    mockedVerifySession.mockReturnValueOnce({ dest: "https://unknown.myshopify.com" });
    mockSingle.mockResolvedValueOnce({ data: null, error: new Error("Not found") });

    const req = createReq({ shop: "unknown.myshopify.com", bot_id: "bot_123" });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(404);
    expect(data).toEqual({ error: "Shop not found or not installed" });
  });

  it("should return 502 if Shopify GraphQL API returns non-200 status", async () => {
    mockSingle.mockResolvedValueOnce({ data: { access_token: "shpat_123" } });
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: false, status: 500 });

    const req = createReq({ shop: "test.myshopify.com", bot_id: "bot_123" });

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

    const req = createReq({ shop: "test.myshopify.com", bot_id: "bot_123" });

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

    const req = createReq({ shop: "test.myshopify.com", bot_id: "bot_123" });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.synced).toBe(1);
    expect(data.products[0]).toMatchObject({
      shopify_id: "gid://shopify/Product/1",
      name: "Leather Jacket",
      description: "Classic leather jacket",
      price: 199.99,
      currency: "USD",
      image_url: "https://cdn.shopify.com/jacket.jpg",
      url: "https://test.myshopify.com/products/leather-jacket",
      available: true,
    });
    expect(data.products[0].variants).toBeDefined();
    expect(data.products[0].metadata).toBeDefined();
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

    const req = createReq({ shop: "test.myshopify.com", bot_id: "bot_123" });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data).toEqual({ error: "Failed to save products to bot" });
  });

  it("should return 403 if store is already associated with another bot", async () => {
    mockSingle.mockResolvedValueOnce({
      data: { access_token: "shpat_123", bot_id: "other_bot_999" },
    });

    const req = createReq({ shop: "test.myshopify.com", bot_id: "bot_123" });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(403);
    expect(data.error).toBe("Store is associated with another bot");
  });

  describe("dashboard user (Supabase) auth", () => {
    beforeEach(() => {
      mockedVerifySession.mockImplementation(() => {
        throw new Error("not a Shopify session token");
      });
      (getUserFromRequest as jest.Mock).mockResolvedValue({ id: "user_1" });
      mockFrom.mockImplementation((table: string) => {
        if (table === "shopify_stores") {
          return { select: mockSelect, update: mockUpdate, eq: mockEq };
        }
        if (table === "bots") {
          return { select: mockSelect, update: mockUpdate, eq: mockEq };
        }
        return {};
      });
    });

    afterEach(() => {
      (getUserFromRequest as jest.Mock).mockResolvedValue(null);
    });

    it("should refuse to sync or link a store that is not linked to any bot", async () => {
      mockSingle
        .mockResolvedValueOnce({ data: { id: "bot_123" } }) // user owns bot_123
        .mockResolvedValueOnce({ data: { access_token: "shpat_123", bot_id: null } }); // unlinked store

      const res = await POST(createReq({ shop: "victim.myshopify.com", bot_id: "bot_123" }));
      const data = await res.json();

      expect(res.status).toBe(403);
      expect(data.error).toBe("Store is not linked to this bot");
      expect(mockUpdate).not.toHaveBeenCalled();
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it("should refuse when the user does not own the bot", async () => {
      mockSingle.mockResolvedValueOnce({ data: null });

      const res = await POST(createReq({ shop: "test.myshopify.com", bot_id: "someone_elses_bot" }));

      expect(res.status).toBe(401);
    });

    it("should allow syncing a store already linked to the user's bot", async () => {
      mockSingle
        .mockResolvedValueOnce({ data: { id: "bot_123" } })
        .mockResolvedValueOnce({ data: { access_token: "shpat_123", bot_id: "bot_123" } });
      (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: false, status: 500, text: async () => "" });

      const res = await POST(createReq({ shop: "test.myshopify.com", bot_id: "bot_123" }));

      // 502 means auth passed and the Shopify API call was attempted
      expect(res.status).toBe(502);
      expect(global.fetch).toHaveBeenCalled();
    });
  });
});
