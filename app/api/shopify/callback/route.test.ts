import { NextRequest } from "next/server";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";
import { registerWebhooks } from "../lib/registerWebhooks";

jest.mock("@supabase/supabase-js", () => ({
  createClient: jest.fn(),
}));

jest.mock("../lib/registerWebhooks", () => ({
  registerWebhooks: jest.fn(),
}));

describe("API: /api/shopify/callback", () => {
  let GET: typeof import("./route").GET;

  const mockUpsert = jest.fn();
  const mockFrom = jest.fn(() => ({ upsert: mockUpsert }));
  const originalFetch = global.fetch;

  beforeAll(async () => {
    process.env.SHOPIFY_API_KEY = "test_api_key";
    process.env.SHOPIFY_API_SECRET = "test_secret_key";
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://supabase.example.com";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "test_service_key";
    (process.env as Record<string, string | undefined>).NODE_ENV = "production";

    const route = await import("./route");
    GET = route.GET;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {});
    jest.spyOn(console, "warn").mockImplementation(() => {});
    (createClient as jest.Mock).mockReturnValue({ from: mockFrom });
    global.fetch = jest.fn();
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  const createHmac = (params: Record<string, string>) => {
    const message = Object.entries(params)
      .filter(([k]) => k !== "hmac")
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${v}`)
      .join("&");
    return crypto.createHmac("sha256", "test_secret_key").update(message).digest("hex");
  };

  it("should return 400 if shop or code parameter is missing", async () => {
    const req = new NextRequest("http://localhost/api/shopify/callback?shop=test.myshopify.com");
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data).toEqual({ error: "Missing shop or code parameters" });
  });

  it("should return 403 if state parameter mismatches cookie in production", async () => {
    const params = { shop: "test.myshopify.com", code: "code_123", state: "state_a" };
    const hmac = createHmac(params);

    const req = new NextRequest(`http://localhost/api/shopify/callback?shop=${params.shop}&code=${params.code}&state=${params.state}&hmac=${hmac}`, {
      headers: { cookie: "shopify_state=state_b" },
    });

    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(403);
    expect(data).toEqual({ error: "State mismatch" });
  });

  it("should return 403 if HMAC is invalid", async () => {
    const state = "state_123";
    const invalidHmac = "0".repeat(64);
    const req = new NextRequest(`http://localhost/api/shopify/callback?shop=test.myshopify.com&code=code_123&state=${state}&hmac=${invalidHmac}`, {
      headers: { cookie: `shopify_state=${state}` },
    });

    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(403);
    expect(data).toEqual({ error: "Invalid HMAC" });
  });

  it("should return 500 when Shopify token exchange fetch fails", async () => {
    const state = "state_123";
    const params = { shop: "test.myshopify.com", code: "code_123", state };
    const hmac = createHmac(params);

    const req = new NextRequest(`http://localhost/api/shopify/callback?shop=${params.shop}&code=${params.code}&state=${state}&hmac=${hmac}`, {
      headers: { cookie: `shopify_state=${state}` },
    });

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 401,
    });

    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data).toEqual({ error: "Token exchange failed" });
  });

  it("should exchange token, upsert store, register webhooks, and return HTML redirect", async () => {
    const state = "state_123";
    const params = { shop: "test.myshopify.com", code: "code_123", state };
    const hmac = createHmac(params);

    const req = new NextRequest(`http://localhost/api/shopify/callback?shop=${params.shop}&code=${params.code}&state=${state}&hmac=${hmac}`, {
      headers: { cookie: `shopify_state=${state}` },
    });

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue({ access_token: "shpat_123", scope: "read_products" }),
    });

    mockUpsert.mockResolvedValueOnce({ error: null });
    (registerWebhooks as jest.Mock).mockResolvedValueOnce(undefined);

    const res = await GET(req);
    const html = await res.text();

    expect(res.status).toBe(200);
    expect(mockUpsert).toHaveBeenCalledWith(
      { shop: "test.myshopify.com", access_token: "shpat_123", scopes: "read_products" },
      { onConflict: "shop" }
    );
    expect(registerWebhooks).toHaveBeenCalledWith("test.myshopify.com", "shpat_123");
    expect(html).toContain("https://test.myshopify.com/admin/apps/test_api_key");
  });

  it("should return 500 if Supabase upsert returns error", async () => {
    const state = "state_123";
    const params = { shop: "test.myshopify.com", code: "code_123", state };
    const hmac = createHmac(params);

    const req = new NextRequest(`http://localhost/api/shopify/callback?shop=${params.shop}&code=${params.code}&state=${state}&hmac=${hmac}`, {
      headers: { cookie: `shopify_state=${state}` },
    });

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue({ access_token: "shpat_123", scope: "read_products" }),
    });

    mockUpsert.mockResolvedValueOnce({ error: new Error("DB Error") });

    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data).toEqual({ error: "DB save failed" });
  });
});
