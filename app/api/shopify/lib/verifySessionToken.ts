import jwt from "jsonwebtoken";

export interface ShopifySession {
  shop: string;
  dest: string;
  aud: string;
  sub: string;
  exp: number;
  iss: string;
}

export function verifySessionToken(authHeader: string | null): ShopifySession {
  if (!authHeader?.startsWith("Bearer ")) {
    throw new Error("Missing authorization header");
  }

  const token = authHeader.replace("Bearer ", "");
  const secret = process.env.SHOPIFY_API_SECRET;
  if (!secret) throw new Error("SHOPIFY_API_SECRET is not configured");

  // Shopify session tokens are HS256 JWTs whose audience is our API key.
  const decoded = jwt.verify(token, secret, {
    algorithms: ["HS256"],
    clockTolerance: 300,
    ...(process.env.SHOPIFY_API_KEY ? { audience: process.env.SHOPIFY_API_KEY } : {}),
  }) as ShopifySession;

  if (!decoded.dest || !/^https:\/\/[a-zA-Z0-9][a-zA-Z0-9-]*\.myshopify\.com$/.test(decoded.dest)) {
    throw new Error("Invalid session token");
  }

  return decoded;
}

export function getShopFromSession(session: ShopifySession): string {
  return new URL(session.dest).hostname;
}
