import { getDb } from "../../lib/db";
import { getOwnedBot } from "../../lib/bot";
import { Bot } from "../../lib/entities";

/**
 * GET /api/bots/[id]
 * Returns the full bot record, but only to its owner. The storefront widget
 * uses /api/public/bot/[publicKey], which exposes only display fields.
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const owned = await getOwnedBot(req, id);
  if (!owned.ok) return owned.response;

  return Response.json(owned.bot);
}

/**
 * PUT /api/bots/[id]
 * Updates a bot the signed-in user owns. Only whitelisted fields are written.
 */
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const owned = await getOwnedBot(req, id);
  if (!owned.ok) return owned.response;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

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
    updateData.last_trained_at = lastTrainedAt
      ? new Date(lastTrainedAt as string)
      : new Date();
  }

  // Drop keys the client didn't send so a partial update can't null out fields.
  for (const key of Object.keys(updateData)) {
    if (updateData[key] === undefined) delete updateData[key];
  }

  const db = await getDb();
  await db.getRepository<Bot>("Bot").update(owned.bot.id, updateData);

  return Response.json({ status: "ok" });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const owned = await getOwnedBot(req, id);
  if (!owned.ok) return owned.response;

  const db = await getDb();
  const botId = owned.bot.id;
  const publicKey = owned.bot.public_key;

  if (publicKey) {
    await db.query(`DELETE FROM bot_documents WHERE public_key = $1`, [publicKey]).catch(() => {});
    await db.query(`DELETE FROM crawled_pages WHERE bot_public_key = $1`, [publicKey]).catch(() => {});
  }
  await db.query(`DELETE FROM leads WHERE bot_id = $1`, [botId]).catch(() => {});
  await db.query(`DELETE FROM conversations WHERE bot_id = $1`, [botId]).catch(() => {});
  await db.query(`UPDATE shopify_stores SET bot_id = NULL WHERE bot_id = $1`, [botId]).catch(() => {});
  await db.query(`DELETE FROM bots WHERE id = $1`, [botId]).catch(() => {});

  return Response.json({ status: "ok", message: "Bot deleted successfully" });
}
