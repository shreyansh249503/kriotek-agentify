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

  if (!decoded.dest) {
    throw new Error("Invalid session token");
  }

  return decoded;
}

export function getShopFromSession(session: ShopifySession): string {
  return new URL(session.dest).hostname;
}
