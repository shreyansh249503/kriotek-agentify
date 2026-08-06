const secret = "test_shopify_webhook_secret_key";
process.env.SHOPIFY_API_SECRET = secret;
process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
process.env.SUPABASE_SERVICE_ROLE_KEY = "service_role_key";

import { POST } from "./route";
import { NextRequest } from "next/server";
import crypto from "crypto";

jest.mock("@supabase/supabase-js", () => {
  const mockFrom = jest.fn();
  return {
    createClient: () => ({
      from: mockFrom,
    }),
    __mockFrom: mockFrom,
  };
});

describe("POST /api/shopify/webhooks", () => {
  let mockFrom: jest.Mock;

  beforeAll(() => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const supabaseMock = require("@supabase/supabase-js");
    mockFrom = supabaseMock.__mockFrom;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const createHmac = (body: string) => {
    return crypto.createHmac("sha256", secret).update(body, "utf8").digest("base64");
  };

  const createWebhookRequest = (
    body: Record<string, unknown>,
    headers: Record<string, string> = {}
  ) => {
    const rawBody = JSON.stringify(body);
    const hmac = createHmac(rawBody);

    const reqHeaders = new Headers({
      "x-shopify-hmac-sha256": hmac,
      "x-shopify-shop-domain": "test-store.myshopify.com",
      "x-shopify-topic": "products/create",
      ...headers,
    });

    return new Request("http://localhost:3000/api/shopify/webhooks", {
      method: "POST",
      headers: reqHeaders,
      body: rawBody,
    }) as unknown as NextRequest;
  };

  it("should return 401 Unauthorized when HMAC signature is invalid", async () => {
    const reqHeaders = new Headers({
      "x-shopify-hmac-sha256": "invalid_hmac",
      "x-shopify-shop-domain": "test-store.myshopify.com",
      "x-shopify-topic": "products/create",
    });

    const req = new Request("http://localhost:3000/api/shopify/webhooks", {
      method: "POST",
      headers: reqHeaders,
      body: JSON.stringify({ id: 123 }),
    }) as unknown as NextRequest;

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(401);
    expect(data.error).toBe("Unauthorized");
  });

  it("should return 400 Bad Request when shop or topic header is missing", async () => {
    const body = { id: 123 };
    const rawBody = JSON.stringify(body);
    const hmac = createHmac(rawBody);

    const reqHeaders = new Headers({
      "x-shopify-hmac-sha256": hmac,
    });

    const req = new Request("http://localhost:3000/api/shopify/webhooks", {
      method: "POST",
      headers: reqHeaders,
      body: rawBody,
    }) as unknown as NextRequest;

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe("Missing headers");
  });

  it("should process products/create webhook and update bot ecommerce_products in database", async () => {
    const mockStoreSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({ data: { bot_id: "bot-123", access_token: "token" } }),
      }),
    });

    const mockBotSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({ data: { ecommerce_products: [] } }),
      }),
    });

    const mockBotUpdate = jest.fn().mockReturnValue({
      eq: jest.fn().mockResolvedValue({ error: null }),
    });

    mockFrom.mockImplementation((tableName: string) => {
      if (tableName === "shopify_stores") {
        return { select: mockStoreSelect };
      }
      if (tableName === "bots") {
        return { select: mockBotSelect, update: mockBotUpdate };
      }
      return {};
    });

    const productPayload = {
      id: 999,
      title: "Shopify Hoodie",
      body_html: "<p>Warm cotton hoodie</p>",
      handle: "shopify-hoodie",
      variants: [{ price: "49.99", inventory_quantity: 10 }],
      images: [{ src: "https://example.com/hoodie.jpg" }],
    };

    const req = createWebhookRequest(productPayload, {
      "x-shopify-topic": "products/create",
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.ok).toBe(true);
    expect(mockBotUpdate).toHaveBeenCalledWith({
      ecommerce_products: [
        expect.objectContaining({
          shopify_id: "gid://shopify/Product/999",
          name: "Shopify Hoodie",
          price: 49.99,
          url: "https://test-store.myshopify.com/products/shopify-hoodie",
          available: true,
        }),
      ],
    });
  });

  it("should process app/uninstalled webhook and delete store record", async () => {
    const mockStoreSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({ data: { bot_id: "bot-123" } }),
      }),
    });

    const mockStoreDelete = jest.fn().mockReturnValue({
      eq: jest.fn().mockResolvedValue({ error: null }),
    });

    const mockBotSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({ data: { ecommerce_products: [] } }),
      }),
    });

    mockFrom.mockImplementation((tableName: string) => {
      if (tableName === "shopify_stores") {
        return { select: mockStoreSelect, delete: mockStoreDelete };
      }
      if (tableName === "bots") {
        return { select: mockBotSelect };
      }
      return {};
    });

    const req = createWebhookRequest({ id: 1 }, {
      "x-shopify-topic": "app/uninstalled",
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.ok).toBe(true);
    expect(mockStoreDelete).toHaveBeenCalled();
  });
});
