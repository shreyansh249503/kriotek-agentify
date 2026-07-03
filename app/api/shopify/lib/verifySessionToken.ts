import jwt from "jsonwebtoken";

const { SHOPIFY_API_SECRET } = process.env;

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

  const decoded = jwt.verify(token, SHOPIFY_API_SECRET!, { clockTolerance: 300 }) as ShopifySession;

  // dest contains the shop URL e.g. https://my-store.myshopify.com
  if (!decoded.dest) {
    throw new Error("Invalid session token");
  }

  return decoded;
}

// Extract clean shop domain from dest
export function getShopFromSession(session: ShopifySession): string {
  return new URL(session.dest).hostname;
}
