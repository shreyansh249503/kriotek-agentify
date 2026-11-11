import { appendCrawledProducts, parseProducts } from "./botProducts";
import { getDb } from "./db";
import type { Product } from "@/types/bot";

jest.mock("./db", () => ({ getDb: jest.fn() }));

type BotRow = Record<string, unknown> & { ecommerce_products: unknown; ecommerce_enabled: boolean };

/**
 * In-memory bots table that understands the statements appendCrawledProducts runs.
 * Writes inside a transaction only land if the callback finishes without throwing.
 */
function fakeDb(initial: Record<string, BotRow>) {
  const bots: Record<string, BotRow> = structuredCloneSafe(initial);
  const statements: string[] = [];

  async function transaction<T>(work: (m: { query: typeof query }) => Promise<T>): Promise<T> {
    const snapshot = structuredCloneSafe(bots);
    try {
      return await work({ query });
    } catch (err) {
      for (const key of Object.keys(bots)) delete bots[key];
      Object.assign(bots, snapshot);
      throw err;
    }
  }

  async function query(sql: string, params: unknown[]) {
    statements.push(sql);
    const bot = bots[params[0] as string];
    if (sql.startsWith("SELECT ecommerce_products, ecommerce_enabled FROM bots WHERE id = $1 FOR UPDATE")) {
      return bot ? [{ ecommerce_products: bot.ecommerce_products, ecommerce_enabled: bot.ecommerce_enabled }] : [];
    }
    if (sql.startsWith("UPDATE bots SET ecommerce_products = $2::jsonb, ecommerce_enabled = true WHERE id = $1")) {
      bot.ecommerce_products = JSON.parse(params[1] as string);
      bot.ecommerce_enabled = true;
      return [[], 1];
    }
    if (sql.startsWith("UPDATE bots SET ecommerce_enabled = true WHERE id = $1")) {
      bot.ecommerce_enabled = true;
      return [[], 1];
    }
    throw new Error(`Unexpected SQL: ${sql}`);
  }

  return { bots, statements, transaction };
}

function structuredCloneSafe<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

const product = (name: string, url: string, extra: Partial<Product> = {}): Product => ({
  name,
  url,
  price: "10.00",
  image: "",
  ...extra,
});

describe("appendCrawledProducts", () => {
  function setup(row: Partial<BotRow> = {}) {
    const db = fakeDb({
      "bot-1": {
        name: "Store bot",
        description: "Set by the merchant",
        ecommerce_enabled: true,
        ecommerce_products: [],
        ...row,
      } as BotRow,
    });
    (getDb as jest.Mock).mockResolvedValue({ transaction: db.transaction });
    return db;
  }

  it("locks the bot row before reading its products", async () => {
    const db = setup();

    await appendCrawledProducts("bot-1", [product("Mug", "https://shop.test/mug")]);

    expect(db.statements[0]).toBe("SELECT ecommerce_products, ecommerce_enabled FROM bots WHERE id = $1 FOR UPDATE");
  });

  it("keeps products added while the crawl was running", async () => {
    // A Shopify sync or the merchant added "Sync product" after the crawl loaded the bot.
    const db = setup({ ecommerce_products: [product("Sync product", "https://shop.test/sync", { shopify_id: "gid://1" })] });

    const result = await appendCrawledProducts("bot-1", [product("Crawled", "https://shop.test/crawled")]);

    expect(result).toEqual({ added: 1 });
    expect((db.bots["bot-1"].ecommerce_products as Product[]).map((p) => p.name)).toEqual(["Sync product", "Crawled"]);
  });

  it("writes only the product columns, so settings changed during the crawl are kept", async () => {
    const db = setup({ name: "Renamed during crawl", description: "Edited during crawl" });

    await appendCrawledProducts("bot-1", [product("Crawled", "https://shop.test/crawled")]);

    expect(db.bots["bot-1"].name).toBe("Renamed during crawl");
    expect(db.bots["bot-1"].description).toBe("Edited during crawl");
    for (const sql of db.statements.filter((s) => s.startsWith("UPDATE"))) {
      expect(sql).not.toMatch(/\b(name|description|tone|primary_color|logo_url|contact_\w+)\s*=/);
    }
  });

  it("skips products the bot already has, by URL or by name (case and spaces ignored)", async () => {
    const db = setup({ ecommerce_products: [product("Blue Mug", "https://shop.test/mug")] });

    const result = await appendCrawledProducts("bot-1", [
      product("Different name", "https://shop.test/mug"), // same URL
      product("  blue mug ", "https://shop.test/other"), // same name
      product("Plate", "https://shop.test/plate"),
    ]);

    expect(result).toEqual({ added: 1 });
    expect((db.bots["bot-1"].ecommerce_products as Product[]).map((p) => p.name)).toEqual(["Blue Mug", "Plate"]);
  });

  it("skips duplicates within the same crawl", async () => {
    const db = setup();

    const result = await appendCrawledProducts("bot-1", [
      product("Plate", "https://shop.test/plate"),
      product("Plate", "https://shop.test/plate"),
    ]);

    expect(result).toEqual({ added: 1 });
    expect(db.bots["bot-1"].ecommerce_products).toHaveLength(1);
  });

  it("doesn't crash on products without a name", async () => {
    setup({ ecommerce_products: [{ url: "https://shop.test/a" } as Product] });

    const result = await appendCrawledProducts("bot-1", [{ url: "https://shop.test/b" } as Product]);

    expect(result).toEqual({ added: 1 });
  });

  it("writes nothing when every product is already there and e-commerce is on", async () => {
    const db = setup({ ecommerce_products: [product("Mug", "https://shop.test/mug")] });

    const result = await appendCrawledProducts("bot-1", [product("Mug", "https://shop.test/mug")]);

    expect(result).toEqual({ added: 0 });
    expect(db.statements.filter((s) => s.startsWith("UPDATE"))).toEqual([]);
  });

  it("turns e-commerce on even when no new products were added", async () => {
    const db = setup({ ecommerce_enabled: false, ecommerce_products: [product("Mug", "https://shop.test/mug")] });

    await appendCrawledProducts("bot-1", [product("Mug", "https://shop.test/mug")]);

    expect(db.bots["bot-1"].ecommerce_enabled).toBe(true);
    expect(db.bots["bot-1"].ecommerce_products).toHaveLength(1);
  });

  it("handles products stored as JSON text", async () => {
    const db = setup({ ecommerce_products: JSON.stringify([product("Mug", "https://shop.test/mug")]) });

    await appendCrawledProducts("bot-1", [product("Plate", "https://shop.test/plate")]);

    expect(db.bots["bot-1"].ecommerce_products).toHaveLength(2);
  });

  it("returns null when the bot was deleted during the crawl", async () => {
    setup();

    expect(await appendCrawledProducts("missing-bot", [product("Mug", "https://shop.test/mug")])).toBeNull();
  });
});

describe("parseProducts", () => {
  it("accepts arrays and JSON text, and returns [] for anything else", () => {
    expect(parseProducts([{ name: "a" }])).toHaveLength(1);
    expect(parseProducts('[{"name":"a"}]')).toHaveLength(1);
    expect(parseProducts("not json")).toEqual([]);
    expect(parseProducts('{"name":"a"}')).toEqual([]);
    expect(parseProducts(null)).toEqual([]);
  });
});
