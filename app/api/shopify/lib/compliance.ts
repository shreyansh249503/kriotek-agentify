import { getDb } from "../../lib/db";
import { supabaseAdmin } from "../../lib/supabase-admin";
import { sendUserEmail } from "../../lib/sendEmail";

const MIN_PHONE_DIGITS = 7;

export interface CustomerIdentity {
  email?: string | null;
  phone?: string | null;
}

interface CustomerRecords {
  leads: Record<string, unknown>[];
  conversations: Record<string, unknown>[];
}

function normalize({ email, phone }: CustomerIdentity) {
  const normalizedEmail = email?.trim().toLowerCase() || null;
  const digits = phone ? phone.replace(/\D/g, "") : "";
  return { email: normalizedEmail, phone: digits.length >= MIN_PHONE_DIGITS ? digits : null };
}

// Matches by case-insensitive email, or by phone digits ignoring formatting. Either number may
// carry a country code the other lacks, so a 7+ digit suffix match in either direction counts.
const CUSTOMER_MATCH_SQL = `
  bot_id = $1 AND (
    ($2::text IS NOT NULL AND lower(email) = $2)
    OR (
      $3::text IS NOT NULL
      AND length(regexp_replace(coalesce(phone, ''), '\\D', '', 'g')) >= ${MIN_PHONE_DIGITS}
      AND (
        regexp_replace(phone, '\\D', '', 'g') LIKE '%' || $3
        OR $3 LIKE '%' || regexp_replace(phone, '\\D', '', 'g')
      )
    )
  )`;

async function getStore(shop: string): Promise<{ bot_id: string | null } | null> {
  const db = await getDb();
  const rows = await db.query(`SELECT bot_id FROM shopify_stores WHERE shop = $1`, [shop]);
  return rows[0] ?? null;
}

/** customers/redact: delete the customer's leads and conversations for this shop's bot. */
export async function redactCustomer(shop: string, identity: CustomerIdentity) {
  const store = await getStore(shop);
  const { email, phone } = normalize(identity);
  if (!store?.bot_id || (!email && !phone)) return { leads: 0, conversations: 0 };

  const db = await getDb();
  return db.transaction(async (manager) => {
    const params = [store.bot_id, email, phone];
    const leads = await manager.query(`DELETE FROM leads WHERE ${CUSTOMER_MATCH_SQL} RETURNING id`, params);
    const conversations = await manager.query(`DELETE FROM conversations WHERE ${CUSTOMER_MATCH_SQL} RETURNING id`, params);
    return { leads: returnedRowCount(leads), conversations: returnedRowCount(conversations) };
  });
}

// TypeORM's postgres driver returns [rows, affectedCount] for DELETE ... RETURNING.
function returnedRowCount(result: unknown): number {
  if (Array.isArray(result) && Array.isArray(result[0])) return result[0].length;
  return Array.isArray(result) ? result.length : 0;
}

/**
 * app/uninstalled: wipe the (now revoked) token but keep the row, because shop/redact
 * arrives ~48h later and needs the shop's bot_id.
 */
export async function markUninstalled(shop: string) {
  const db = await getDb();
  await db.query(
    `UPDATE shopify_stores SET access_token = '', uninstalled_at = NOW() WHERE shop = $1`,
    [shop],
  );
}

/**
 * shop/redact: erase the shop's customer data (conversations, leads), remove the products
 * imported from Shopify, and delete the store record. The merchant's Agentify bot itself stays.
 */
export async function redactShop(shop: string) {
  const store = await getStore(shop);
  const db = await getDb();

  await db.transaction(async (manager) => {
    if (store?.bot_id) {
      await manager.query(`DELETE FROM conversations WHERE bot_id = $1`, [store.bot_id]);
      await manager.query(`DELETE FROM leads WHERE bot_id = $1`, [store.bot_id]);
      await manager.query(
        `UPDATE bots
            SET ecommerce_products = COALESCE(
              (SELECT jsonb_agg(p) FROM jsonb_array_elements(ecommerce_products) p WHERE p->>'shopify_id' IS NULL),
              '[]'::jsonb
            )
          WHERE id = $1 AND jsonb_typeof(ecommerce_products) = 'array'`,
        [store.bot_id],
      );
    }
    await manager.query(`DELETE FROM shopify_stores WHERE shop = $1`, [shop]);
  });
}

/** customers/data_request: everything stored about the customer for this shop's bot. */
export async function findCustomerRecords(shop: string, identity: CustomerIdentity): Promise<CustomerRecords | null> {
  const store = await getStore(shop);
  const { email, phone } = normalize(identity);
  if (!store?.bot_id) return null;
  if (!email && !phone) return { leads: [], conversations: [] };

  const db = await getDb();
  const params = [store.bot_id, email, phone];
  const leads = await db.query(
    `SELECT name, email, phone, created_at FROM leads WHERE ${CUSTOMER_MATCH_SQL} ORDER BY created_at`,
    params,
  );
  const conversations = await db.query(
    `SELECT id, name, email, phone, messages, created_at FROM conversations WHERE ${CUSTOMER_MATCH_SQL} ORDER BY created_at`,
    params,
  );
  return { leads, conversations };
}

async function getMerchantEmail(shop: string): Promise<string | null> {
  const db = await getDb();
  const rows = await db.query(
    `SELECT b.user_id, b.contact_email
       FROM shopify_stores s JOIN bots b ON b.id = s.bot_id
      WHERE s.shop = $1`,
    [shop],
  );
  const bot = rows[0];
  if (!bot) return null;

  const { data } = await supabaseAdmin.auth.admin.getUserById(bot.user_id);
  return data?.user?.email || bot.contact_email || null;
}

/**
 * Emails the merchant the customer's data so they can fulfil the request (Shopify asks the
 * app to provide it to the store owner). Runs after the webhook response.
 */
export async function sendCustomerDataExport(
  shop: string,
  identity: CustomerIdentity,
  dataRequestId: string | number | undefined,
) {
  const records = await findCustomerRecords(shop, identity);
  if (!records) return;

  const to = await getMerchantEmail(shop);
  if (!to) {
    console.error(`[compliance] No merchant email for ${shop}; data request ${dataRequestId} not delivered`);
    return;
  }

  const total = records.leads.length + records.conversations.length;
  const body = [
    `Shopify customer data request ${dataRequestId ?? ""} for ${shop}.`,
    "",
    total === 0
      ? "Agentify holds no leads or chat conversations for this customer."
      : `Agentify holds ${records.leads.length} lead(s) and ${records.conversations.length} conversation(s) for this customer:`,
    "",
    total === 0 ? "" : JSON.stringify(records, null, 2),
  ].join("\n");

  await sendUserEmail({
    to,
    subject: `Customer data request for ${shop}`,
    body,
    html: `<pre style="white-space:pre-wrap;font-family:monospace">${escapeHtml(body)}</pre>`,
  });
}

function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}
