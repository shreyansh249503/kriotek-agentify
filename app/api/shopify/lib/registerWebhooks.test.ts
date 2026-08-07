import { registerWebhooks } from "./registerWebhooks";

describe("registerWebhooks", () => {
  const originalFetch = global.fetch;
  const shop = "test-store.myshopify.com";
  const accessToken = "shpat_test_token_123";

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.SHOPIFY_APP_URL = "https://myapp.com";
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("should register all 4 webhooks with Shopify GraphQL/REST endpoint", async () => {
    const mockResponse = { ok: true, text: async () => "" };
    global.fetch = jest.fn().mockResolvedValue(mockResponse);
    const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});

    await registerWebhooks(shop, accessToken);

    expect(global.fetch).toHaveBeenCalledTimes(4);
    expect(global.fetch).toHaveBeenCalledWith(
      `https://${shop}/admin/api/2024-01/webhooks.json`,
      expect.objectContaining({
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": accessToken,
        },
      })
    );

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("Successfully registered webhook")
    );

    consoleSpy.mockRestore();
  });

  it("should log error when webhook registration response is not ok", async () => {
    const mockResponse = {
      ok: false,
      status: 422,
      text: async () => "Webhook already exists",
    };
    global.fetch = jest.fn().mockResolvedValue(mockResponse);
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    await registerWebhooks(shop, accessToken);

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining("Failed to register webhook"),
      422,
      "Webhook already exists"
    );

    consoleErrorSpy.mockRestore();
  });
});
