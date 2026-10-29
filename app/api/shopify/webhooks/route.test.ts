const secret = "test_shopify_webhook_secret_key";
process.env.SHOPIFY_API_SECRET = secret;
process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
process.env.SUPABASE_SERVICE_ROLE_KEY = "service_role_key";

import { POST } from "./route";
import { NextRequest, after } from "next/server";
import crypto from "crypto";
import { markUninstalled, redactCustomer, redactShop, sendCustomerDataExport } from "../lib/compliance";

jest.mock("next/server", () => ({
  ...jest.requireActual("next/server"),
  // Run deferred work immediately; outside a real request after() would throw.
  after: jest.fn((task: () => unknown) => {
    void task();
  }),
}));

jest.mock("../lib/compliance", () => ({
  markUninstalled: jest.fn(),
  redactCustomer: jest.fn(),
  redactShop: jest.fn(),
  sendCustomerDataExport: jest.fn().mockResolvedValue(undefined),
}));

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

  describe("uninstall and privacy (GDPR) webhooks", () => {
    const shop = "test-store.myshopify.com";

    it("app/uninstalled marks the store uninstalled instead of deleting it", async () => {
      const res = await POST(createWebhookRequest({ id: 1 }, { "x-shopify-topic": "app/uninstalled" }));

      expect(res.status).toBe(200);
      expect(markUninstalled).toHaveBeenCalledWith(shop);
      expect(redactShop).not.toHaveBeenCalled();
    });

    it("customers/data_request schedules the export and replies immediately", async () => {
      const payload = {
        shop_domain: shop,
        customer: { id: 101, email: "customer@example.com", phone: "+15551234567" },
        data_request: { id: 9001 },
      };

      const res = await POST(createWebhookRequest(payload, { "x-shopify-topic": "customers/data_request" }));

      expect(res.status).toBe(200);
      expect(after).toHaveBeenCalled();
      expect(sendCustomerDataExport).toHaveBeenCalledWith(
        shop,
        { email: "customer@example.com", phone: "+15551234567" },
        9001
      );
    });

    it("customers/data_request still replies 200 if the export fails later", async () => {
      jest.spyOn(console, "error").mockImplementation(() => {});
      (sendCustomerDataExport as jest.Mock).mockRejectedValueOnce(new Error("smtp down"));

      const res = await POST(
        createWebhookRequest({ customer: { email: "a@b.com" } }, { "x-shopify-topic": "customers/data_request" })
      );

      expect(res.status).toBe(200);
    });

    it("customers/redact deletes the customer's records", async () => {
      (redactCustomer as jest.Mock).mockResolvedValueOnce({ leads: 1, conversations: 2 });
      const payload = { customer: { id: 101, email: "privacy@example.com", phone: "+15551234567" } };

      const res = await POST(createWebhookRequest(payload, { "x-shopify-topic": "customers/redact" }));
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(redactCustomer).toHaveBeenCalledWith(shop, { email: "privacy@example.com", phone: "+15551234567" });
      expect(data.deleted).toEqual({ leads: 1, conversations: 2 });
    });

    it("shop/redact erases the shop's data", async () => {
      const res = await POST(createWebhookRequest({ shop_domain: shop }, { "x-shopify-topic": "shop/redact" }));

      expect(res.status).toBe(200);
      expect(redactShop).toHaveBeenCalledWith(shop);
    });

    it("returns 500 without internal details when a handler fails, so Shopify retries", async () => {
      jest.spyOn(console, "error").mockImplementation(() => {});
      (redactShop as jest.Mock).mockRejectedValueOnce(new Error("connection refused at 10.0.0.5"));

      const res = await POST(createWebhookRequest({}, { "x-shopify-topic": "shop/redact" }));
      const data = await res.json();

      expect(res.status).toBe(500);
      expect(JSON.stringify(data)).not.toContain("10.0.0.5");
    });

    it("rejects compliance webhooks with an invalid HMAC", async () => {
      const req = new Request("http://localhost:3000/api/shopify/webhooks", {
        method: "POST",
        headers: new Headers({
          "x-shopify-hmac-sha256": "forged",
          "x-shopify-shop-domain": shop,
          "x-shopify-topic": "shop/redact",
        }),
        body: "{}",
      }) as unknown as NextRequest;

      const res = await POST(req);

      expect(res.status).toBe(401);
      expect(redactShop).not.toHaveBeenCalled();
    });
  });
});
