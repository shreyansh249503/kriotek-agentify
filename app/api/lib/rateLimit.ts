export interface RateLimitResult {
  success: boolean;
  reason?: "ip_limit_exceeded" | "bot_limit_exceeded";
  limit: number;
  remaining: number;
  reset: number;
  retryAfter: number;
  headers: Record<string, string>;
}

export interface RateLimitOptions {
  /** Separate counter per route, so e.g. widget polling doesn't consume the chat budget. */
  scope?: string;
  ipLimit?: number;
  ipWindowSeconds?: number;
  botLimit?: number;
  botWindowSeconds?: number;
}

interface WindowEntry {
  timestamps: number[];
}

const ipMemoryStore = new Map<string, WindowEntry>();
const botMemoryStore = new Map<string, WindowEntry>();

export function clearInMemoryRateLimits(): void {
  ipMemoryStore.clear();
  botMemoryStore.clear();
}

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

type UpstashLimiter = {
  limit: (id: string) => Promise<{ success: boolean; limit: number; remaining: number; reset: number }>;
};

let upstashClient: unknown = null;
// One limiter per scope + limit + window; a single shared instance would apply the first caller's limits to every route.
const upstashLimiters = new Map<string, UpstashLimiter>();

async function getUpstashLimiter(
  kind: "ip" | "bot",
  scope: string,
  limit: number,
  windowSeconds: number,
): Promise<UpstashLimiter> {
  const cacheKey = `${kind}:${scope}:${limit}:${windowSeconds}`;
  let limiter = upstashLimiters.get(cacheKey);
  if (!limiter) {
    const { Ratelimit } = await import("@upstash/ratelimit");
    limiter = new Ratelimit({
      redis: upstashClient as never,
      limiter: Ratelimit.slidingWindow(limit, `${windowSeconds} s`),
      prefix: `@ratelimit:${kind}:${scope}`,
    });
    upstashLimiters.set(cacheKey, limiter);
  }
  return limiter;
}

async function getUpstashLimiters(
  scope: string,
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

    return {
      ipLimiter: await getUpstashLimiter("ip", scope, ipLimit, ipWindowSeconds),
      botLimiter: await getUpstashLimiter("bot", scope, botLimit, botWindowSeconds),
    };
  } catch (err) {
    console.warn("[RateLimit] Error loading @upstash modules, using in-memory store:", err);
    return null;
  }
}

export async function checkRateLimit(
  req: Request,
  publicKey?: string,
  options?: RateLimitOptions,
): Promise<RateLimitResult> {
  const ipLimit = options?.ipLimit ?? 20;
  const ipWindowSeconds = options?.ipWindowSeconds ?? 60;
  const botLimit = options?.botLimit ?? 100;
  const botWindowSeconds = options?.botWindowSeconds ?? 60;

  const scope = options?.scope ?? "default";
  const clientIp = getClientIp(req);
  const ipMemoryKey = `${scope}:${clientIp}`;
  const botMemoryKey = `${scope}:${publicKey}`;
  const limiters = await getUpstashLimiters(scope, ipLimit, ipWindowSeconds, botLimit, botWindowSeconds);

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
      const memIp = checkMemorySlidingWindow(ipMemoryStore, ipMemoryKey, ipLimit, ipWindowSeconds);
      if (!memIp.success) {
        return buildMemoryResult("ip_limit_exceeded", memIp);
      }
    }
  } else {
    const memIp = checkMemorySlidingWindow(ipMemoryStore, ipMemoryKey, ipLimit, ipWindowSeconds);
    if (!memIp.success) {
      return buildMemoryResult("ip_limit_exceeded", memIp);
    }
  }

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
        const memBot = checkMemorySlidingWindow(botMemoryStore, botMemoryKey, botLimit, botWindowSeconds);
        if (!memBot.success) {
          return buildMemoryResult("bot_limit_exceeded", memBot);
        }
      }
    } else {
      const memBot = checkMemorySlidingWindow(botMemoryStore, botMemoryKey, botLimit, botWindowSeconds);
      if (!memBot.success) {
        return buildMemoryResult("bot_limit_exceeded", memBot);
      }
    }
  }

  const defaultReset = Math.ceil((Date.now() + ipWindowSeconds * 1000) / 1000);
  return {
    success: true,
    limit: ipLimit,
    remaining: Math.max(0, ipLimit - (ipMemoryStore.get(ipMemoryKey)?.timestamps.length || 1)),
    reset: defaultReset,
    retryAfter: 0,
    headers: {
      "X-RateLimit-Limit": String(ipLimit),
      "X-RateLimit-Remaining": String(
        Math.max(0, ipLimit - (ipMemoryStore.get(ipMemoryKey)?.timestamps.length || 1)),
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
