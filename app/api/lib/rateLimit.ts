export interface RateLimitResult {
  success: boolean;
  reason?: "ip_limit_exceeded" | "bot_limit_exceeded";
  limit: number;
  remaining: number;
  reset: number; // Unix timestamp in seconds
  retryAfter: number; // Seconds until next token / window reset
  headers: Record<string, string>;
}

export interface RateLimitOptions {
  ipLimit?: number;
  ipWindowSeconds?: number;
  botLimit?: number;
  botWindowSeconds?: number;
}

// In-Memory Sliding Window Store Fallback
interface WindowEntry {
  timestamps: number[];
}

const ipMemoryStore = new Map<string, WindowEntry>();
const botMemoryStore = new Map<string, WindowEntry>();

export function clearInMemoryRateLimits(): void {
  ipMemoryStore.clear();
  botMemoryStore.clear();
}

/**
 * Extract client IP address from standard proxy/CDN headers
 */
export function getClientIp(req: Request): string {
  const headers = req.headers;
  const forwardedFor = headers.get("x-forwarded-for");
  if (forwardedFor) {
    const ip = forwardedFor.split(",")[0].trim();
    if (ip) return ip;
  }

  const cfConnectingIp = headers.get("cf-connecting-ip");
  if (cfConnectingIp) return cfConnectingIp.trim();

  const realIp = headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  return "127.0.0.1";
}

function checkMemorySlidingWindow(
  store: Map<string, WindowEntry>,
  key: string,
  limit: number,
  windowSeconds: number,
): { success: boolean; limit: number; remaining: number; reset: number; retryAfter: number } {
  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  const windowStart = now - windowMs;

  const entry = store.get(key) || { timestamps: [] };
  // Remove expired timestamps
  const validTimestamps = entry.timestamps.filter((ts) => ts > windowStart);

  if (validTimestamps.length >= limit) {
    const oldest = validTimestamps[0];
    const resetMs = oldest + windowMs;
    const retryAfter = Math.max(1, Math.ceil((resetMs - now) / 1000));
    const reset = Math.ceil(resetMs / 1000);

    store.set(key, { timestamps: validTimestamps });
    return {
      success: false,
      limit,
      remaining: 0,
      reset,
      retryAfter,
    };
  }

  validTimestamps.push(now);
  store.set(key, { timestamps: validTimestamps });

  const remaining = Math.max(0, limit - validTimestamps.length);
  const reset = Math.ceil((now + windowMs) / 1000);

  return {
    success: true,
    limit,
    remaining,
    reset,
    retryAfter: 0,
  };
}

// Lazy loaded Upstash instances
let upstashClient: unknown = null;
let upstashIpLimiter: { limit: (id: string) => Promise<{ success: boolean; limit: number; remaining: number; reset: number }> } | null = null;
let upstashBotLimiter: { limit: (id: string) => Promise<{ success: boolean; limit: number; remaining: number; reset: number }> } | null = null;

async function getUpstashLimiters(
  ipLimit: number,
  ipWindowSeconds: number,
  botLimit: number,
  botWindowSeconds: number,
) {
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

  if (!redisUrl || !redisToken) {
    return null;
  }

  try {
    if (!upstashClient) {
      const { Redis } = await import("@upstash/redis");
      upstashClient = new Redis({
        url: redisUrl,
        token: redisToken,
      });
    }

    if (!upstashIpLimiter) {
      const { Ratelimit } = await import("@upstash/ratelimit");
      upstashIpLimiter = new Ratelimit({
        redis: upstashClient as never,
        limiter: Ratelimit.slidingWindow(ipLimit, `${ipWindowSeconds} s`),
        prefix: "@ratelimit:ip",
      });
    }

    if (!upstashBotLimiter) {
      const { Ratelimit } = await import("@upstash/ratelimit");
      upstashBotLimiter = new Ratelimit({
        redis: upstashClient as never,
        limiter: Ratelimit.slidingWindow(botLimit, `${botWindowSeconds} s`),
        prefix: "@ratelimit:bot",
      });
    }

    return { ipLimiter: upstashIpLimiter, botLimiter: upstashBotLimiter };
  } catch (err) {
    console.warn("[RateLimit] Error loading @upstash modules, using in-memory store:", err);
    return null;
  }
}

/**
 * Checks dual-tier rate limiting for an incoming chat request
 */
export async function checkRateLimit(
  req: Request,
  publicKey?: string,
  options?: RateLimitOptions,
): Promise<RateLimitResult> {
  const ipLimit = options?.ipLimit ?? 20; // 20 requests per min per IP
  const ipWindowSeconds = options?.ipWindowSeconds ?? 60;
  const botLimit = options?.botLimit ?? 100; // 100 requests per min per Bot
  const botWindowSeconds = options?.botWindowSeconds ?? 60;

  const clientIp = getClientIp(req);
  const limiters = await getUpstashLimiters(ipLimit, ipWindowSeconds, botLimit, botWindowSeconds);

  // 1. Check IP limit
  if (limiters?.ipLimiter) {
    try {
      const ipRes = await limiters.ipLimiter.limit(clientIp);
      if (!ipRes.success) {
        const retryAfter = Math.max(1, Math.ceil((ipRes.reset - Date.now()) / 1000));
        return {
          success: false,
          reason: "ip_limit_exceeded",
          limit: ipRes.limit,
          remaining: ipRes.remaining,
          reset: Math.ceil(ipRes.reset / 1000),
          retryAfter,
          headers: {
            "X-RateLimit-Limit": String(ipRes.limit),
            "X-RateLimit-Remaining": String(ipRes.remaining),
            "X-RateLimit-Reset": String(Math.ceil(ipRes.reset / 1000)),
            "Retry-After": String(retryAfter),
          },
        };
      }
    } catch (err) {
      console.warn("[RateLimit] Upstash Redis error on IP check, falling back to memory:", err);
      const memIp = checkMemorySlidingWindow(ipMemoryStore, clientIp, ipLimit, ipWindowSeconds);
      if (!memIp.success) {
        return buildMemoryResult("ip_limit_exceeded", memIp);
      }
    }
  } else {
    const memIp = checkMemorySlidingWindow(ipMemoryStore, clientIp, ipLimit, ipWindowSeconds);
    if (!memIp.success) {
      return buildMemoryResult("ip_limit_exceeded", memIp);
    }
  }

  // 2. Check Bot limit (if publicKey provided)
  if (publicKey) {
    if (limiters?.botLimiter) {
      try {
        const botRes = await limiters.botLimiter.limit(publicKey);
        if (!botRes.success) {
          const retryAfter = Math.max(1, Math.ceil((botRes.reset - Date.now()) / 1000));
          return {
            success: false,
            reason: "bot_limit_exceeded",
            limit: botRes.limit,
            remaining: botRes.remaining,
            reset: Math.ceil(botRes.reset / 1000),
            retryAfter,
            headers: {
              "X-RateLimit-Limit": String(botRes.limit),
              "X-RateLimit-Remaining": String(botRes.remaining),
              "X-RateLimit-Reset": String(Math.ceil(botRes.reset / 1000)),
              "Retry-After": String(retryAfter),
            },
          };
        }
      } catch (err) {
        console.warn("[RateLimit] Upstash Redis error on Bot check, falling back to memory:", err);
        const memBot = checkMemorySlidingWindow(botMemoryStore, publicKey, botLimit, botWindowSeconds);
        if (!memBot.success) {
          return buildMemoryResult("bot_limit_exceeded", memBot);
        }
      }
    } else {
      const memBot = checkMemorySlidingWindow(botMemoryStore, publicKey, botLimit, botWindowSeconds);
      if (!memBot.success) {
        return buildMemoryResult("bot_limit_exceeded", memBot);
      }
    }
  }

  // Default passing result
  const defaultReset = Math.ceil((Date.now() + ipWindowSeconds * 1000) / 1000);
  return {
    success: true,
    limit: ipLimit,
    remaining: Math.max(0, ipLimit - (ipMemoryStore.get(clientIp)?.timestamps.length || 1)),
    reset: defaultReset,
    retryAfter: 0,
    headers: {
      "X-RateLimit-Limit": String(ipLimit),
      "X-RateLimit-Remaining": String(
        Math.max(0, ipLimit - (ipMemoryStore.get(clientIp)?.timestamps.length || 1)),
      ),
      "X-RateLimit-Reset": String(defaultReset),
    },
  };
}

function buildMemoryResult(
  reason: "ip_limit_exceeded" | "bot_limit_exceeded",
  mem: { limit: number; remaining: number; reset: number; retryAfter: number },
): RateLimitResult {
  return {
    success: false,
    reason,
    limit: mem.limit,
    remaining: mem.remaining,
    reset: mem.reset,
    retryAfter: mem.retryAfter,
    headers: {
      "X-RateLimit-Limit": String(mem.limit),
      "X-RateLimit-Remaining": String(mem.remaining),
      "X-RateLimit-Reset": String(mem.reset),
      "Retry-After": String(mem.retryAfter),
    },
  };
}
