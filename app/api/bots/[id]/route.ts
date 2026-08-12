import { getDb } from "../../lib/db";
import { getUserFromRequest } from "../../lib/auth";
import { Bot } from "../../lib/entities";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  console.log("Fetching bot with ID:", id);
  console.log("ID type:", typeof id);
  const db = await getDb();
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
  let bot: unknown = null;
  try {
    const query = isUuid
      ? `SELECT * FROM bots WHERE id = $1`
      : `SELECT * FROM bots WHERE public_key = $1`;
    const rawRows = await db.query(query, [id]);
    if (Array.isArray(rawRows) && rawRows.length > 0) {
      bot = rawRows[0];
    } else {
      bot = await db.getRepository("Bot").findOne({
        where: isUuid ? { id } : { public_key: id },
      });
    }
  } catch {
    bot = await db.getRepository("Bot").findOne({
      where: isUuid ? { id } : { public_key: id },
    });
  }

  console.log("Query result:", bot);

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
  const body = await req.json();

  const {
    name,
    description,
    tone,
    primaryColor,
    contactEnabled,
    contactEmail,
    contactPrompt,
    contactEmailMessage,
    logoUrl,
    ecommerceEnabled,
    ecommercePrompt,
    ecommerceProducts,
    companyName,
    lastTrainedAt,
  } = body;

  const updateData: Record<string, unknown> = {
    name,
    description,
    tone,
    primary_color: primaryColor,
    contact_enabled: contactEnabled,
    contact_email: contactEmail,
    contact_prompt: contactPrompt,
    contact_email_message: contactEmailMessage,
    logo_url: logoUrl,
    ecommerce_enabled: ecommerceEnabled,
    ecommerce_prompt: ecommercePrompt,
    ecommerce_products: ecommerceProducts,
  };

  if (companyName !== undefined) {
    updateData.company_name = companyName;
  }
  if (lastTrainedAt !== undefined) {
    updateData.last_trained_at = lastTrainedAt ? new Date(lastTrainedAt) : new Date();
  }

  const db = await getDb();
  await db.getRepository("Bot").update(id, updateData);

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
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

  const botRepo = db.getRepository<Bot>("Bot");
  const bot = await botRepo.findOne({
    where: isUuid ? { id, user_id: user.id } : { public_key: id, user_id: user.id },
  });

  if (!bot) {
    return Response.json({ error: "Bot not found" }, { status: 404 });
  }

  const botId = bot.id;
  const publicKey = bot.public_key;

  if (publicKey) {
    await db.query(`DELETE FROM bot_documents WHERE public_key = $1`, [publicKey]).catch(() => {});
    await db.query(`DELETE FROM crawled_pages WHERE bot_public_key = $1`, [publicKey]).catch(() => {});
  }
  if (botId) {
    await db.query(`DELETE FROM leads WHERE bot_id = $1`, [botId]).catch(() => {});
    await db.query(`DELETE FROM conversations WHERE bot_id = $1`, [botId]).catch(() => {});
    await db.query(`UPDATE shopify_stores SET bot_id = NULL WHERE bot_id = $1`, [botId]).catch(() => {});
    await db.query(`DELETE FROM bots WHERE id = $1`, [botId]).catch(() => {});
  }

  return Response.json({ status: "ok", message: "Bot deleted successfully" });
}
