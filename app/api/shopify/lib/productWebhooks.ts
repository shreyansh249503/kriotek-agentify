import type { EntityManager } from "typeorm";
import { getDb } from "../../lib/db";
import type { Product } from "@/types/bot";
import {
  fromWebhookProduct,
  isOlderThan,
  isProductActive,
  productGid,
  toBotProduct,
  type ShopifyBotProduct,
  type ShopifyWebhookProductPayload,
} from "@/lib/shopify/productMapper";

export const PRODUCT_TOPICS = new Set(["products/create", "products/update", "products/delete"]);

export type ProductWebhookResult =
  | "duplicate" // this webhook ID was already processed
  | "no_store" // the shop isn't linked to a bot
  | "saved" // product added or replaced
  | "removed" // product deleted, or no longer active
  | "stale" // the bot already has a newer version of the product
  | "deleted_earlier"; // the product was deleted; a late create/update is ignored

interface ProductWebhook {
  shop: string;
  topic: string;
  /** X-Shopify-Webhook-Id; the same on every retry of one delivery. */
  webhookId: string | null;
  payload: ShopifyWebhookProductPayload;
}

/**
 * Records a webhook ID; false when it was already recorded (a retry or duplicate delivery).
 * Inside a transaction a concurrent duplicate waits here until the first one commits.
 */
export async function claimWebhook(
  run: Pick<EntityManager, "query">,
  { webhookId, topic, shop }: Pick<ProductWebhook, "webhookId" | "topic" | "shop">,
): Promise<boolean> {
  if (!webhookId) return true;
  const rows = await run.query(
    `INSERT INTO shopify_webhook_events (webhook_id, topic, shop) VALUES ($1, $2, $3)
     ON CONFLICT (webhook_id) DO NOTHING
     RETURNING webhook_id`,
    [webhookId, topic, shop],
  );
  return Array.isArray(rows) && rows.length > 0;
}

function parseProducts(value: unknown): Product[] {
  if (Array.isArray(value)) return value as Product[];
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

function toIso(value: unknown): string | null {
  if (value instanceof Date) return value.toISOString();
  return typeof value === "string" ? value : null;
}

/**
 * Saves a full sync's products on the bot under the same row lock as the webhooks, merging
 * instead of overwriting:
 * - products not from Shopify (e.g. added from a crawled URL) are kept;
 * - a product a webhook already saved in a newer version keeps that version;
 * - a product deleted, or made inactive, by a newer webhook stays removed;
 * - a product the sync didn't see but a webhook added after the sync started is kept.
 * Returns the bot's new product list, or null if the bot doesn't exist.
 */
export async function saveSyncedProducts({
  shop,
  botId,
  synced,
  syncStartedAt,
}: {
  shop: string;
  botId: string;
  synced: ShopifyBotProduct[];
  syncStartedAt: Date;
}): Promise<Product[] | null> {
  const db = await getDb();
  return db.transaction(async (m) => {
    const [bot] = await m.query(`SELECT ecommerce_products FROM bots WHERE id = $1 FOR UPDATE`, [botId]);
    if (!bot) return null;

    const current = parseProducts(bot.ecommerce_products);
    const storedById = new Map(current.filter((p) => p.shopify_id).map((p) => [p.shopify_id!, p]));
    const removals: { product_id: string; deleted: boolean; product_updated_at: unknown }[] = await m.query(
      `SELECT product_id, deleted, product_updated_at FROM shopify_product_removals WHERE shop = $1`,
      [shop],
    );
    const removedById = new Map(removals.map((r) => [r.product_id, r]));
    const syncedIds = new Set(synced.map((p) => p.shopify_id));

    const fromSync = synced.flatMap((p): Product[] => {
      const removal = removedById.get(p.shopify_id);
      if (removal?.deleted) return [];
      if (removal && isOlderThan(p.updated_at, toIso(removal.product_updated_at))) return [];
      const stored = storedById.get(p.shopify_id);
      return [stored && isOlderThan(p.updated_at, stored.updated_at) ? stored : p];
    });
    const addedDuringSync = current.filter(
      (p) =>
        p.shopify_id &&
        !syncedIds.has(p.shopify_id) &&
        p.updated_at &&
        Date.parse(p.updated_at) > syncStartedAt.getTime(),
    );
    const next = [...current.filter((p) => !p.shopify_id), ...fromSync, ...addedDuringSync];

    await m.query(`UPDATE bots SET ecommerce_products = $2::jsonb, ecommerce_enabled = true WHERE id = $1`, [
      botId,
      JSON.stringify(next),
    ]);
    return next;
  });
}

/**
 * Applies a products/create, products/update or products/delete webhook to the shop's bot
 * in one transaction. Webhooks for the same bot queue on the bot row's lock, so concurrent
 * deliveries (e.g. a bulk edit) can't overwrite each other. If anything fails, nothing is
 * kept, including the webhook ID, so Shopify's retry is processed normally.
 */
export async function applyProductWebhook({ shop, topic, webhookId, payload }: ProductWebhook): Promise<ProductWebhookResult> {
  const db = await getDb();
  return db.transaction(async (m) => {
    if (!(await claimWebhook(m, { webhookId, topic, shop }))) return "duplicate";

    const [store] = await m.query(`SELECT bot_id, currency FROM shopify_stores WHERE shop = $1`, [shop]);
    if (!store?.bot_id) return "no_store";

    const [bot] = await m.query(`SELECT ecommerce_products FROM bots WHERE id = $1 FOR UPDATE`, [store.bot_id]);
    if (!bot) return "no_store";

    // Read only after taking the lock: a delete for this product commits before we get it.
    const id = productGid(payload.id);
    const [removal] = await m.query(
      `SELECT deleted, product_updated_at FROM shopify_product_removals WHERE shop = $1 AND product_id = $2`,
      [shop, id],
    );

    const products = parseProducts(bot.ecommerce_products);
    const index = products.findIndex((p) => p.shopify_id === id);
    const others = products.filter((_, i) => i !== index);

    const save = async (next: Product[]) => {
      await m.query(`UPDATE bots SET ecommerce_products = $2::jsonb WHERE id = $1`, [
        store.bot_id,
        JSON.stringify(next),
      ]);
    };

    if (topic === "products/delete") {
      await m.query(
        `INSERT INTO shopify_product_removals (shop, product_id, deleted) VALUES ($1, $2, true)
         ON CONFLICT (shop, product_id) DO UPDATE SET deleted = true, removed_at = NOW()`,
        [shop, id],
      );
      if (index >= 0) await save(others);
      return "removed";
    }

    if (removal?.deleted) return "deleted_earlier";

    const input = fromWebhookProduct(payload);
    const existing = index >= 0 ? products[index] : undefined;
    if (
      isOlderThan(input.updatedAt, existing?.updated_at) ||
      isOlderThan(input.updatedAt, toIso(removal?.product_updated_at))
    ) {
      return "stale";
    }

    if (!isProductActive(input)) {
      // Remember when it went inactive, so a late update from before that can't re-add it.
      await m.query(
        `INSERT INTO shopify_product_removals (shop, product_id, deleted, product_updated_at)
         VALUES ($1, $2, false, $3::timestamptz)
         ON CONFLICT (shop, product_id) DO UPDATE
           SET product_updated_at = EXCLUDED.product_updated_at, removed_at = NOW()
           WHERE NOT shopify_product_removals.deleted`,
        [shop, id, input.updatedAt ?? null],
      );
      if (index >= 0) await save(others);
      return "removed";
    }

    const currency =
      store.currency ||
      existing?.currency ||
      products.find((p) => p.shopify_id && p.currency)?.currency;
    const product = toBotProduct(input, { shop, currency });

    const next = [...products];
    if (index >= 0) next[index] = product;
    else next.push(product);
    await save(next);

    if (removal) {
      await m.query(
        `DELETE FROM shopify_product_removals WHERE shop = $1 AND product_id = $2 AND NOT deleted`,
        [shop, id],
      );
    }
    return "saved";
  });
}
