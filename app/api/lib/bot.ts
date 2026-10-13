import { getDb } from "./db";
import { Bot } from "./entities";
import { getUserFromRequest } from "./auth";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function getBotByPublicKey(publicKey: string) {
  const db = await getDb();
  const bot = await db.getRepository<Bot>("Bot").findOne({
    where: { public_key: publicKey },
  });

  if (!bot) {
    throw new Error("Bot not found");
  }

  return bot;
}

export type OwnedBotResult =
  | { ok: true; bot: Bot; userId: string }
  | { ok: false; response: Response };

/**
 * Resolves the signed-in user from the request and loads the bot identified by
 * `idOrPublicKey` only if that user owns it. Returns a ready-made error
 * Response (401/404) otherwise. A bot owned by someone else is reported as 404
 * so callers can't probe which bots exist.
 */
export async function getOwnedBot(
  req: Request,
  idOrPublicKey: string,
  extraHeaders: Record<string, string> = {},
): Promise<OwnedBotResult> {
  const user = await getUserFromRequest(req);
  if (!user) {
    return {
      ok: false,
      response: Response.json(
        { error: "Unauthorized" },
        { status: 401, headers: extraHeaders },
      ),
    };
  }

  if (!idOrPublicKey) {
    return {
      ok: false,
      response: Response.json(
        { error: "Bot not found" },
        { status: 404, headers: extraHeaders },
      ),
    };
  }

  const db = await getDb();
  const where = UUID_RE.test(idOrPublicKey)
    ? { id: idOrPublicKey, user_id: user.id }
    : { public_key: idOrPublicKey, user_id: user.id };
  const bot = await db.getRepository<Bot>("Bot").findOne({ where });

  if (!bot) {
    return {
      ok: false,
      response: Response.json(
        { error: "Bot not found" },
        { status: 404, headers: extraHeaders },
      ),
    };
  }

  return { ok: true, bot, userId: user.id };
}
