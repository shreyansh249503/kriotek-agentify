import { Bot, ShopifyStore } from "./entities";

export interface OriginVerificationResult {
  allowed: boolean;
  reason?: string;
  matchedOrigin?: string;
  requestOrigin?: string;
}

/**
 * Normalizes a URL or domain string to a clean hostname (lowercase, no protocol, no port, no path)
 */
export function extractHostname(urlOrDomain: string): string {
  if (!urlOrDomain) return "";
  let clean = urlOrDomain.trim().toLowerCase();

  // If missing protocol but looks like URL, prepend https:// for URL parser
  if (!clean.startsWith("http://") && !clean.startsWith("https://")) {
    clean = `https://${clean}`;
  }

  try {
    const parsed = new URL(clean);
    return parsed.hostname;
  } catch {
    // Fallback regex strip
    return clean
      .replace(/^https?:\/\//, "")
      .split("/")[0]
      .split(":")[0];
  }
}

/**
 * Checks if a candidate hostname matches a pattern (supports wildcards like *.example.com)
 */
export function matchesDomainPattern(hostname: string, pattern: string): boolean {
  const cleanHost = extractHostname(hostname);
  const cleanPattern = extractHostname(pattern);

  if (!cleanHost || !cleanPattern) return false;

  if (cleanHost === cleanPattern) {
    return true;
  }

  // Handle wildcard domain matching, e.g., *.example.com or example.com matching sub.example.com
  if (pattern.startsWith("*.")) {
    const rootPattern = pattern.slice(2).toLowerCase();
    return cleanHost.endsWith(`.${rootPattern}`) || cleanHost === rootPattern;
  }

  return false;
}

const DEV_ALLOWED_HOSTNAMES = [
  "localhost",
  "127.0.0.1",
  "::1",
];

function isDevOrigin(hostname: string): boolean {
  if (DEV_ALLOWED_HOSTNAMES.includes(hostname)) return true;
  if (hostname.endsWith(".ngrok-free.app") || hostname.endsWith(".ngrok.io") || hostname.endsWith(".ngrok.app")) {
    return true;
  }
  return false;
}

/**
 * Verifies if an incoming chat request originates from an authorized merchant domain
 */
export function verifyOrigin(
  req: Request,
  bot: Bot,
  shopifyStores?: ShopifyStore[] | ShopifyStore | null,
): OriginVerificationResult {
  const originHeader = req.headers.get("origin");
  const refererHeader = req.headers.get("referer");
  const rawOrigin = originHeader || refererHeader || "";

  // If no origin and no referer header
  if (!rawOrigin) {
    // If running in development or test, allow requests with missing referer/origin
    if (process.env.NODE_ENV !== "production") {
      return { allowed: true, reason: "dev_no_origin_header" };
    }

    // In production: if bot explicitly configured allowed_origins or has shopify stores, require origin/referer
    const hasConfiguredRestrictions =
      (bot.allowed_origins && bot.allowed_origins.length > 0) ||
      (Array.isArray(shopifyStores) ? shopifyStores.length > 0 : Boolean(shopifyStores));

    if (hasConfiguredRestrictions) {
      return {
        allowed: false,
        reason: "missing_origin_header",
      };
    }

    // Unrestricted bot
    return { allowed: true, reason: "unrestricted_bot" };
  }

  const requestHost = extractHostname(rawOrigin);

  // 1. Development bypass
  if (process.env.NODE_ENV !== "production" || isDevOrigin(requestHost)) {
    if (isDevOrigin(requestHost)) {
      return {
        allowed: true,
        matchedOrigin: requestHost,
        requestOrigin: rawOrigin,
        reason: "dev_allowed_domain",
      };
    }
  }

  // 2. Check Shopify Stores
  const stores = Array.isArray(shopifyStores)
    ? shopifyStores
    : shopifyStores
      ? [shopifyStores]
      : [];

  for (const store of stores) {
    if (store && store.shop) {
      const storeHost = extractHostname(store.shop);
      if (matchesDomainPattern(requestHost, storeHost) || matchesDomainPattern(requestHost, store.shop)) {
        return {
          allowed: true,
          matchedOrigin: store.shop,
          requestOrigin: rawOrigin,
          reason: "shopify_store_matched",
        };
      }
    }
  }

  // 3. Check Bot Allowed Origins
  const allowedList = Array.isArray(bot.allowed_origins) ? bot.allowed_origins : [];
  if (allowedList.length > 0) {
    for (const pattern of allowedList) {
      if (matchesDomainPattern(requestHost, pattern)) {
        return {
          allowed: true,
          matchedOrigin: pattern,
          requestOrigin: rawOrigin,
          reason: "allowed_origins_matched",
        };
      }
    }

    // Origin was supplied but didn't match any allowed domain
    return {
      allowed: false,
      requestOrigin: rawOrigin,
      reason: "origin_not_whitelisted",
    };
  }

  // 4. If neither shopify store nor allowed_origins are restricted, default to pass
  return {
    allowed: true,
    requestOrigin: rawOrigin,
    reason: "no_restrictions_configured",
  };
}
