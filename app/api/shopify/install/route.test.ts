import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

jest.mock("@supabase/supabase-js", () => ({
  createClient: jest.fn(),
}));

describe("API: /api/shopify/install", () => {
  let GET: typeof import("./route").GET;

  const mockSingle = jest.fn();
  const mockEq = jest.fn(() => ({ single: mockSingle }));
  const mockSelect = jest.fn(() => ({ eq: mockEq }));
  const mockFrom = jest.fn(() => ({ select: mockSelect }));

  beforeAll(async () => {
    process.env.SHOPIFY_API_KEY = "test_api_key";
    process.env.SHOPIFY_SCOPES = "read_products,write_products";
    process.env.SHOPIFY_APP_URL = "https://app.example.com";
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://supabase.example.com";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "test_service_key";

    const route = await import("./route");
    GET = route.GET;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {});
    mockSingle.mockResolvedValue({ data: null, error: null });
    (createClient as jest.Mock).mockReturnValue({
      from: mockFrom,
    });
  });

  it("should return 400 when shop parameter is missing or invalid domain", async () => {
    const req = new NextRequest("http://localhost/api/shopify/install?shop=invalid-shop");
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data).toEqual({ error: "Invalid shop domain" });
  });

  it("should redirect to admin dashboard if store is already installed and embedded is 1", async () => {
    mockSingle.mockResolvedValueOnce({ data: { access_token: "token_123" } });

    const req = new NextRequest("http://localhost/api/shopify/install?shop=test.myshopify.com&embedded=1");
    const res = await GET(req);

    expect(res.status).toBe(307);
  });

  it("should return HTML with app-bridge script when embedded is 1 and not yet installed", async () => {
    mockSingle.mockResolvedValueOnce({ data: null });

    const req = new NextRequest("http://localhost/api/shopify/install?shop=test.myshopify.com&embedded=1");
    const res = await GET(req);
    const html = await res.text();

    expect(res.status).toBe(200);
    expect(html).toContain("shopify-api-key");
    expect(html).toContain("https://test.myshopify.com/admin/oauth/authorize");
    expect(res.cookies.get("shopify_state")?.value).toBeDefined();
  });

  it("should redirect directly to Shopify OAuth URL for non-embedded requests", async () => {
    mockSingle.mockResolvedValueOnce({ data: null });

    const req = new NextRequest("http://localhost/api/shopify/install?shop=test.myshopify.com");
    const res = await GET(req);

    expect(res.status).toBe(307);
    expect(res.cookies.get("shopify_state")?.value).toBeDefined();
  });

  it("should return 500 if Supabase throws an unhandled error", async () => {
    mockFrom.mockImplementationOnce(() => {
      throw new Error("Supabase client error");
    });

    const req = new NextRequest("http://localhost/api/shopify/install?shop=test.myshopify.com");
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.error).toBe("Internal server error");
  });
});
