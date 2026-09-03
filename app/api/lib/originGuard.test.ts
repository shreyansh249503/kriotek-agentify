import { extractHostname, matchesDomainPattern, verifyOrigin } from "./originGuard";
import { Bot, ShopifyStore } from "./entities";

describe("Origin Guard (originGuard.ts)", () => {
  const originalEnv = process.env.NODE_ENV;

  afterEach(() => {
    (process.env as Record<string, string | undefined>).NODE_ENV = originalEnv;
  });

  describe("extractHostname", () => {
    it("should correctly extract hostname from various URL formats", () => {
      expect(extractHostname("https://example.com/some/path")).toBe("example.com");
      expect(extractHostname("http://sub.domain.store.com:8080")).toBe("sub.domain.store.com");
      expect(extractHostname("my-store.myshopify.com")).toBe("my-store.myshopify.com");
      expect(extractHostname("HTTPS://WWW.EXAMPLE.COM/")).toBe("www.example.com");
    });
  });

  describe("matchesDomainPattern", () => {
    it("should match identical hostnames", () => {
      expect(matchesDomainPattern("example.com", "example.com")).toBe(true);
      expect(matchesDomainPattern("store.example.com", "https://store.example.com")).toBe(true);
    });

    it("should match wildcard patterns", () => {
      expect(matchesDomainPattern("sub.example.com", "*.example.com")).toBe(true);
      expect(matchesDomainPattern("deep.sub.example.com", "*.example.com")).toBe(true);
      expect(matchesDomainPattern("otherdomain.com", "*.example.com")).toBe(false);
    });
  });

  describe("verifyOrigin", () => {
    const mockBot = {
      id: "bot-123",
      allowed_origins: ["https://merchant-store.com", "*.trusted-partner.com"],
    } as unknown as Bot;

    const mockShopify = {
      id: "store-123",
      shop: "quickstart-shop.myshopify.com",
    } as unknown as ShopifyStore;

    it("should allow request from registered Shopify store", () => {
      const req = new Request("http://localhost/api/chat", {
        headers: { origin: "https://quickstart-shop.myshopify.com" },
      });
      const res = verifyOrigin(req, mockBot, mockShopify);
      expect(res.allowed).toBe(true);
      expect(res.reason).toBe("shopify_store_matched");
    });

    it("should allow request from bot.allowed_origins", () => {
      const req = new Request("http://localhost/api/chat", {
        headers: { referer: "https://merchant-store.com/products/123" },
      });
      const res = verifyOrigin(req, mockBot, null);
      expect(res.allowed).toBe(true);
      expect(res.reason).toBe("allowed_origins_matched");
    });

    it("should allow wildcard subdomains in allowed_origins", () => {
      const req = new Request("http://localhost/api/chat", {
        headers: { origin: "https://app.trusted-partner.com" },
      });
      const res = verifyOrigin(req, mockBot, null);
      expect(res.allowed).toBe(true);
      expect(res.reason).toBe("allowed_origins_matched");
    });

    it("should allow localhost and ngrok in development", () => {
      const req = new Request("http://localhost/api/chat", {
        headers: { origin: "http://localhost:3000" },
      });
      const res = verifyOrigin(req, mockBot, mockShopify);
      expect(res.allowed).toBe(true);
      expect(res.reason).toBe("dev_allowed_domain");
    });

    it("should reject unauthorized origins in production", () => {
      (process.env as Record<string, string | undefined>).NODE_ENV = "production";
      const req = new Request("http://localhost/api/chat", {
        headers: { origin: "https://malicious-hijacker.com" },
      });
      const res = verifyOrigin(req, mockBot, mockShopify);
      expect(res.allowed).toBe(false);
      expect(res.reason).toBe("origin_not_whitelisted");
    });

    it("should reject missing origin in production when bot has domain restrictions", () => {
      (process.env as Record<string, string | undefined>).NODE_ENV = "production";
      const req = new Request("http://localhost/api/chat");
      const res = verifyOrigin(req, mockBot, mockShopify);
      expect(res.allowed).toBe(false);
      expect(res.reason).toBe("missing_origin_header");
    });
  });
});
