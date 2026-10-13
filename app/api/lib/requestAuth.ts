import { getDb } from "./db";
import { getUserFromRequest } from "./auth";
import { Bot, ShopifyStore } from "./entities";
import {
  getShopFromSession,
  verifySessionToken,
} from "../shopify/lib/verifySessionToken";

/**
 * Who is calling: a merchant signed in to the web dashboard (Supabase JWT) or
 * a merchant inside the Shopify admin (App Bridge session token). Both send
 * `Authorization: Bearer <token>`; we try Shopify first because its tokens are
 * cheap to verify locally.
 */
export type RequestPrincipal =
  | { kind: "user"; userId: string }
  | { kind: "shop"; shop: string };

export async function getRequestPrincipal(
  req: Request,
): Promise<RequestPrincipal | null> {
  const header = req.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) return null;

  try {
    const session = verifySessionToken(header);
    return { kind: "shop", shop: getShopFromSession(session) };
  } catch {
    // Not a Shopify session token; fall through to Supabase.
  }

  const user = await getUserFromRequest(req);
  return user ? { kind: "user", userId: user.id } : null;
}

/** True if the principal may manage the bot with this public key. */
export async function canManageBot(
  principal: RequestPrincipal,
  publicKey: string,
): Promise<boolean> {
  if (!publicKey) return false;
  const db = await getDb();
  const bot = await db
    .getRepository<Bot>("Bot")
    .findOne({ where: { public_key: publicKey } });
  if (!bot) return false;

  if (principal.kind === "user") return bot.user_id === principal.userId;

  const store = await db
    .getRepository<ShopifyStore>("ShopifyStore")
    .findOne({ where: { shop: principal.shop } });
  return Boolean(store?.bot_id && store.bot_id === bot.id);
}
