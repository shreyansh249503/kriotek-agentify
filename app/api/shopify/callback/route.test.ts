import { NextRequest } from "next/server";
import crypto from "crypto";
import { supabaseAdmin } from "@/app/api/lib/supabase-admin";
import { decryptToken } from "@/app/api/lib/crypto";

jest.mock("@/app/api/lib/supabase-admin");

describe("API: /api/shopify/callback", () => {
  let GET: typeof import("./route").GET;

  const mockUpsert = jest.fn();
  const mockFrom = jest.fn(() => ({ upsert: mockUpsert }));
  const originalFetch = global.fetch;

  beforeAll(async () => {
    process.env.SHOPIFY_API_KEY = "test_api_key";
    process.env.SHOPIFY_API_SECRET = "test_secret_key";
    (process.env as Record<string, string | undefined>).NODE_ENV = "production";
    process.env.ENCRYPTION_KEY = "test_encryption_key_at_least_32_chars_long";

    const route = await import("./route");
    GET = route.GET;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {});
    jest.spyOn(console, "warn").mockImplementation(() => {});
    (supabaseAdmin.from as jest.Mock).mockImplementation(mockFrom);
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

  it("should exchange token, upsert store, clear uninstall mark, and return HTML redirect", async () => {
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

    const res = await GET(req);
    const html = await res.text();

    expect(res.status).toBe(200);
    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        shop: "test.myshopify.com",
        access_token: expect.stringMatching(/^enc:v1:/),
        scopes: "read_products",
        uninstalled_at: null,
      }),
      { onConflict: "shop" }
    );
    const savedToken = mockUpsert.mock.calls[0][0].access_token;
    expect(decryptToken(savedToken)).toBe("shpat_123");
    expect(html).toContain("https://test.myshopify.com/admin/apps/test_api_key");
  });

  it("should save the shop's currency at install, and still install if it can't be read", async () => {
    const state = "state_123";
    const params = { shop: "test.myshopify.com", code: "code_123", state };
    const hmac = createHmac(params);
    const makeReq = () =>
      new NextRequest(`http://localhost/api/shopify/callback?shop=${params.shop}&code=${params.code}&state=${state}&hmac=${hmac}`, {
        headers: { cookie: `shopify_state=${state}` },
      });
    const tokenResponse = {
      ok: true,
      json: jest.fn().mockResolvedValue({ access_token: "shpat_123", scope: "read_products" }),
    };
    mockUpsert.mockResolvedValue({ error: null });

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce(tokenResponse)
      .mockResolvedValueOnce({ ok: true, json: jest.fn().mockResolvedValue({ data: { shop: { currencyCode: "CAD" } } }) });
    expect((await GET(makeReq())).status).toBe(200);
    expect(mockUpsert.mock.calls[0][0]).toMatchObject({ currency: "CAD" });
    expect(global.fetch).toHaveBeenLastCalledWith(
      expect.stringContaining("https://test.myshopify.com/admin/api/"),
      expect.objectContaining({ headers: expect.objectContaining({ "X-Shopify-Access-Token": "shpat_123" }) })
    );

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce(tokenResponse)
      .mockRejectedValueOnce(new Error("timeout"));
    expect((await GET(makeReq())).status).toBe(200);
    expect(mockUpsert.mock.calls[1][0]).not.toHaveProperty("currency");
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
