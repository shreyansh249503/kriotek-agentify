import { checkRateLimit, clearInMemoryRateLimits, getClientIp } from "./rateLimit";

describe("Rate Limiter (rateLimit.ts)", () => {
  beforeEach(() => {
    clearInMemoryRateLimits();
  });

  describe("getClientIp", () => {
    it("should extract IP from x-forwarded-for header", () => {
      const req = new Request("http://localhost/api/chat", {
        headers: { "x-forwarded-for": "203.0.113.195, 70.41.3.18" },
      });
      expect(getClientIp(req)).toBe("203.0.113.195");
    });

    it("should extract IP from cf-connecting-ip header", () => {
      const req = new Request("http://localhost/api/chat", {
        headers: { "cf-connecting-ip": "198.51.100.1" },
      });
      expect(getClientIp(req)).toBe("198.51.100.1");
    });

    it("should extract IP from x-real-ip header", () => {
      const req = new Request("http://localhost/api/chat", {
        headers: { "x-real-ip": "198.51.100.2" },
      });
      expect(getClientIp(req)).toBe("198.51.100.2");
    });

    it("should default to 127.0.0.1 when no proxy headers exist", () => {
      const req = new Request("http://localhost/api/chat");
      expect(getClientIp(req)).toBe("127.0.0.1");
    });
  });

  describe("checkRateLimit with In-Memory fallback", () => {
    it("should allow requests within limit", async () => {
      const req = new Request("http://localhost/api/chat", {
        headers: { "x-forwarded-for": "10.0.0.1" },
      });
      const res = await checkRateLimit(req, "bot-key-1", {
        ipLimit: 5,
        ipWindowSeconds: 60,
      });

      expect(res.success).toBe(true);
      expect(res.limit).toBe(5);
      expect(res.remaining).toBe(4);
      expect(res.headers["X-RateLimit-Limit"]).toBe("5");
    });

    it("should block when IP rate limit is exceeded", async () => {
      const ip = "10.0.0.2";
      const req = () =>
        new Request("http://localhost/api/chat", {
          headers: { "x-forwarded-for": ip },
        });

      // Exhaust 3 requests limit
      await checkRateLimit(req(), "bot-key-2", { ipLimit: 3, ipWindowSeconds: 60 });
      await checkRateLimit(req(), "bot-key-2", { ipLimit: 3, ipWindowSeconds: 60 });
      await checkRateLimit(req(), "bot-key-2", { ipLimit: 3, ipWindowSeconds: 60 });

      // 4th request should fail
      const blockedRes = await checkRateLimit(req(), "bot-key-2", {
        ipLimit: 3,
        ipWindowSeconds: 60,
      });

      expect(blockedRes.success).toBe(false);
      expect(blockedRes.reason).toBe("ip_limit_exceeded");
      expect(blockedRes.remaining).toBe(0);
      expect(blockedRes.retryAfter).toBeGreaterThan(0);
      expect(blockedRes.headers["Retry-After"]).toBeDefined();
    });

    it("should block when Bot rate limit is exceeded across multiple IPs", async () => {
      const botKey = "bot-hot-key";
      const req1 = new Request("http://localhost/api/chat", {
        headers: { "x-forwarded-for": "10.0.0.10" },
      });
      const req2 = new Request("http://localhost/api/chat", {
        headers: { "x-forwarded-for": "10.0.0.11" },
      });
      const req3 = new Request("http://localhost/api/chat", {
        headers: { "x-forwarded-for": "10.0.0.12" },
      });

      // Bot limit 2, IP limit 10
      await checkRateLimit(req1, botKey, { ipLimit: 10, botLimit: 2 });
      await checkRateLimit(req2, botKey, { ipLimit: 10, botLimit: 2 });

      const blockedRes = await checkRateLimit(req3, botKey, { ipLimit: 10, botLimit: 2 });

      expect(blockedRes.success).toBe(false);
      expect(blockedRes.reason).toBe("bot_limit_exceeded");
      expect(blockedRes.remaining).toBe(0);
    });
  });
});
