import { getDb } from "../../lib/db";
import { getUserFromRequest } from "../../lib/auth";
import { Bot } from "../../lib/entities";
import { BOT_COLUMNS, UpdateBotSchema, describeIssues, readJson, type UpdateBotData } from "../../lib/botInput";
import { logger } from "../../../../lib/logger";
import * as Sentry from "@sentry/nextjs";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const user = await getUserFromRequest(req);
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = await getDb();
  const isUuid = UUID_REGEX.test(id);
  const where = isUuid ? { id, user_id: user.id } : { public_key: id, user_id: user.id };
  let bot: unknown = null;
  try {
    const rawRows = await db.query(
      `SELECT * FROM bots WHERE ${isUuid ? "id" : "public_key"} = $1 AND user_id = $2`,
      [id, user.id],
    );
    if (Array.isArray(rawRows) && rawRows.length > 0) {
      bot = rawRows[0];
    } else {
      bot = await db.getRepository("Bot").findOne({ where });
    }
  } catch {
    bot = await db.getRepository("Bot").findOne({ where });
  }

  if (!bot) {
    return Response.json({ error: "Bot not found" }, { status: 404 });
  }

  return Response.json(bot);
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const user = await getUserFromRequest(req);
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = await getDb();
  const botRepo = db.getRepository<Bot>("Bot");
  const bot = await botRepo.findOne({
    where: UUID_REGEX.test(id) ? { id, user_id: user.id } : { public_key: id, user_id: user.id },
  });
  if (!bot) {
    return Response.json({ error: "Bot not found" }, { status: 404 });
  }

  const body = await readJson(req);
  if (body === null) {
    return Response.json({ error: "Request body must be JSON" }, { status: 400 });
  }
  const parsed = UpdateBotSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: "Some bot settings are invalid", details: describeIssues(parsed.error) },
      { status: 400 },
    );
  }

  // Only the fields that were sent are written.
  const updateData: Record<string, unknown> = {};
  for (const [field, column] of Object.entries(BOT_COLUMNS) as [keyof UpdateBotData, string][]) {
    const value = parsed.data[field];
    if (value === undefined) continue;
    updateData[column] = field === "lastTrainedAt" ? (value ? new Date(value as string) : new Date()) : value;
  }

  if (Object.keys(updateData).length > 0) {
    await botRepo.update(bot.id, updateData);
  }

  return Response.json({ status: "ok" });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const user = await getUserFromRequest(req);
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = await getDb();
  const isUuid = UUID_REGEX.test(id);

  const botRepo = db.getRepository<Bot>("Bot");
  const bot = await botRepo.findOne({
    where: isUuid ? { id, user_id: user.id } : { public_key: id, user_id: user.id },
  });

  if (!bot) {
    return Response.json({ error: "Bot not found" }, { status: 404 });
  }

  // All or nothing: if any step fails the transaction rolls back and the bot stays intact.
  // The bot row is locked first, so a Shopify sync or URL training writing products waits,
  // and a bot deleted by a concurrent request is reported as not found.
  let deleted: boolean;
  try {
    deleted = await db.transaction(async (m) => {
      const locked = await m.query(`SELECT id FROM bots WHERE id = $1 AND user_id = $2 FOR UPDATE`, [
        bot.id,
        user.id,
      ]);
      if (!Array.isArray(locked) || locked.length === 0) return false;

      // Knowledge base rows are keyed by public_key, which has no foreign key to bots.
      if (bot.public_key) {
        await m.query(`DELETE FROM bot_documents WHERE public_key = $1`, [bot.public_key]);
        await m.query(`DELETE FROM crawled_pages WHERE bot_public_key = $1`, [bot.public_key]);
      }
      // These also cascade from bots; deleted explicitly so the result doesn't depend on the FKs.
      await m.query(`DELETE FROM leads WHERE bot_id = $1`, [bot.id]);
      await m.query(`DELETE FROM conversations WHERE bot_id = $1`, [bot.id]);
      await m.query(`UPDATE shopify_stores SET bot_id = NULL WHERE bot_id = $1`, [bot.id]);
      await m.query(`DELETE FROM bots WHERE id = $1`, [bot.id]);
      return true;
    });
  } catch (err) {
    logger.error("[bots] Delete failed, rolled back", err, { botId: bot.id });
    Sentry.captureException(err, { tags: { area: "bot_delete" }, extra: { botId: bot.id } });
    return Response.json({ error: "Could not delete bot. Nothing was deleted; please try again." }, { status: 500 });
  }

  if (!deleted) {
    return Response.json({ error: "Bot not found" }, { status: 404 });
  }

  return Response.json({ status: "ok", message: "Bot deleted successfully" });
}
