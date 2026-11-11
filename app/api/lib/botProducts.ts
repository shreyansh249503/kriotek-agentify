import { getDb } from "./db";
import type { Product } from "@/types/bot";

/** bots.ecommerce_products as an array, whether the driver returns it parsed or as JSON text. */
export function parseProducts(value: unknown): Product[] {
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

function sameProduct(a: Product, b: Product): boolean {
  if (a.url && b.url && a.url === b.url) return true;
  const nameA = typeof a.name === "string" ? a.name.trim().toLowerCase() : "";
  const nameB = typeof b.name === "string" ? b.name.trim().toLowerCase() : "";
  return nameA !== "" && nameA === nameB;
}

/**
 * Adds products found by a URL crawl to the bot, skipping ones it already has (same URL or
 * same name). Runs under the bot row lock used by Shopify sync and product webhooks, and merges
 * into the bot's *current* product list, so changes made while the crawl was running (settings,
 * products added by a sync or by hand) are kept. Only the product columns are written.
 *
 * Returns how many products were added, or null if the bot no longer exists.
 */
export async function appendCrawledProducts(botId: string, crawled: Product[]): Promise<{ added: number } | null> {
  const db = await getDb();
  return db.transaction(async (m) => {
    const rows = await m.query(`SELECT ecommerce_products, ecommerce_enabled FROM bots WHERE id = $1 FOR UPDATE`, [
      botId,
    ]);
    const bot = Array.isArray(rows) ? rows[0] : undefined;
    if (!bot) return null;

    const merged = parseProducts(bot.ecommerce_products);
    let added = 0;
    for (const product of crawled) {
      if (!merged.some((existing) => sameProduct(existing, product))) {
        merged.push(product);
        added++;
      }
    }

    if (added > 0) {
      await m.query(`UPDATE bots SET ecommerce_products = $2::jsonb, ecommerce_enabled = true WHERE id = $1`, [
        botId,
        JSON.stringify(merged),
      ]);
    } else if (!bot.ecommerce_enabled) {
      await m.query(`UPDATE bots SET ecommerce_enabled = true WHERE id = $1`, [botId]);
    }
    return { added };
  });
}
