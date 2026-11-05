import { getDb } from "../../lib/db";
import { applyProductWebhook, saveSyncedProducts } from "./productWebhooks";
import type { ShopifyBotProduct, ShopifyWebhookProductPayload } from "@/lib/shopify/productMapper";
import type { Product } from "@/types/bot";

jest.mock("../../lib/db", () => ({ getDb: jest.fn() }));

const shop = "test-store.myshopify.com";

/**
 * In-memory stand-in for the tables the handler touches. It answers each statement the way
 * Postgres would, and the transaction restores everything if the work throws (a rollback).
 */
function fakeDb() {
  const state = {
    events: new Set<string>(),
    store: { bot_id: "bot-1", currency: "EUR" as string | null } as { bot_id: string; currency: string | null } | null,
    products: [] as Product[],
    removals: new Map<string, { deleted: boolean; product_updated_at: Date | null }>(),
    failOnSave: false,
  };

  const query = jest.fn(async (sql: string, params: unknown[] = []) => {
    if (sql.includes("INSERT INTO shopify_webhook_events")) {
      const id = params[0] as string;
      if (state.events.has(id)) return [];
      state.events.add(id);
      return [{ webhook_id: id }];
    }
    if (sql.includes("FROM shopify_stores")) return state.store ? [state.store] : [];
    if (sql.includes("FROM bots") && sql.includes("FOR UPDATE")) {
      return [{ ecommerce_products: JSON.parse(JSON.stringify(state.products)) }];
    }
    if (sql.includes("SELECT product_id, deleted, product_updated_at FROM shopify_product_removals")) {
      return [...state.removals].map(([product_id, r]) => ({ product_id, ...r }));
    }
    if (sql.includes("SELECT deleted, product_updated_at FROM shopify_product_removals")) {
      const removal = state.removals.get(params[1] as string);
      return removal ? [removal] : [];
    }
    if (sql.includes("UPDATE bots SET ecommerce_products")) {
      if (state.failOnSave) throw new Error("connection lost");
      state.products = JSON.parse(params[1] as string);
      return [[], 1];
    }
    if (sql.includes("INSERT INTO shopify_product_removals")) {
      const key = params[1] as string;
      const existing = state.removals.get(key);
      if (sql.includes("true)")) {
        state.removals.set(key, { deleted: true, product_updated_at: existing?.product_updated_at ?? null });
      } else if (!existing?.deleted) {
        state.removals.set(key, { deleted: false, product_updated_at: params[2] ? new Date(params[2] as string) : null });
      }
      return [];
    }
    if (sql.includes("DELETE FROM shopify_product_removals")) {
      const key = params[1] as string;
      if (state.removals.get(key)?.deleted === false) state.removals.delete(key);
      return [[], 1];
    }
    throw new Error(`unexpected SQL: ${sql}`);
  });

  (getDb as jest.Mock).mockResolvedValue({
    transaction: async (work: (m: { query: typeof query }) => unknown) => {
      const snapshot = {
        events: new Set(state.events),
        products: JSON.parse(JSON.stringify(state.products)),
        removals: new Map(state.removals),
      };
      try {
        return await work({ query });
      } catch (err) {
        Object.assign(state, snapshot);
        throw err;
      }
    },
  });

  return { state, query };
}

const product = (overrides: Partial<ShopifyWebhookProductPayload> = {}): ShopifyWebhookProductPayload => ({
  id: 7,
  title: "Canvas Tote",
  body_html: "<p>Sturdy tote</p>",
  handle: "canvas-tote",
  status: "active",
  updated_at: "2026-11-05T10:00:00Z",
  variants: [{ id: 70, price: "25.00", inventory_quantity: 5, inventory_management: "shopify" }],
  ...overrides,
});

const send = (topic: string, payload: ShopifyWebhookProductPayload | { id: number }, webhookId: string | null = null) =>
  applyProductWebhook({ shop, topic, webhookId, payload: payload as ShopifyWebhookProductPayload });

describe("applyProductWebhook", () => {
  beforeEach(() => jest.clearAllMocks());

  it("adds a new product with the store's currency", async () => {
    const { state } = fakeDb();

    expect(await send("products/create", product(), "wh-1")).toBe("saved");

    expect(state.products).toEqual([
      expect.objectContaining({ shopify_id: "gid://shopify/Product/7", name: "Canvas Tote", price: 25, currency: "EUR" }),
    ]);
  });

  it("processes a duplicate webhook ID only once", async () => {
    const { state, query } = fakeDb();

    expect(await send("products/update", product({ title: "First" }), "wh-dup")).toBe("saved");
    state.products[0].name = "Edited since";
    expect(await send("products/update", product({ title: "First" }), "wh-dup")).toBe("duplicate");

    expect(state.products[0].name).toBe("Edited since");
    expect(query.mock.calls.filter(([sql]) => sql.includes("UPDATE bots"))).toHaveLength(1);
  });

  it("forgets the webhook ID when processing fails, so Shopify's retry is applied", async () => {
    const { state } = fakeDb();
    state.failOnSave = true;

    await expect(send("products/create", product(), "wh-retry")).rejects.toThrow("connection lost");
    expect(state.events.has("wh-retry")).toBe(false);

    state.failOnSave = false;
    expect(await send("products/create", product(), "wh-retry")).toBe("saved");
    expect(state.products).toHaveLength(1);
  });

  it("ignores an update older than the stored product", async () => {
    const { state } = fakeDb();
    await send("products/update", product({ title: "Newer", updated_at: "2026-11-05T12:00:00Z" }));

    expect(await send("products/update", product({ title: "Older", updated_at: "2026-11-05T11:00:00Z" }))).toBe("stale");
    expect(state.products[0].name).toBe("Newer");
  });

  it("applies an update with the same timestamp, since its order can't be told apart", async () => {
    const { state } = fakeDb();
    await send("products/update", product({ title: "A" }));

    expect(await send("products/update", product({ title: "B" }))).toBe("saved");
    expect(state.products[0].name).toBe("B");
  });

  it("removes a product that becomes draft, and a late older update can't re-add it", async () => {
    const { state } = fakeDb();
    await send("products/create", product({ updated_at: "2026-11-05T10:00:00Z" }));

    expect(await send("products/update", product({ status: "draft", updated_at: "2026-11-05T12:00:00Z" }))).toBe("removed");
    expect(state.products).toEqual([]);

    expect(await send("products/update", product({ updated_at: "2026-11-05T11:00:00Z" }))).toBe("stale");
    expect(state.products).toEqual([]);

    // Published again later: it comes back and the marker is cleared.
    expect(await send("products/update", product({ updated_at: "2026-11-05T13:00:00Z" }))).toBe("saved");
    expect(state.products).toHaveLength(1);
    expect(state.removals.size).toBe(0);
  });

  it("deletes a product, and a late create/update can't bring it back", async () => {
    const { state } = fakeDb();
    await send("products/create", product());

    expect(await send("products/delete", { id: 7 })).toBe("removed");
    expect(state.products).toEqual([]);

    expect(await send("products/update", product({ updated_at: "2026-11-06T10:00:00Z" }))).toBe("deleted_earlier");
    expect(state.products).toEqual([]);
  });

  it("keeps other products, including ones not from Shopify", async () => {
    const { state } = fakeDb();
    state.products = [
      { name: "Manual product", price: 5, image: "", url: "https://example.com/p" },
      { shopify_id: "gid://shopify/Product/8", name: "Other", price: 1, image: "", url: "u", currency: "EUR" },
    ];

    await send("products/create", product());
    await send("products/delete", { id: 8 });

    expect(state.products.map((p) => p.name)).toEqual(["Manual product", "Canvas Tote"]);
  });

  it("falls back to the currency of products already synced when the store has none yet", async () => {
    const { state } = fakeDb();
    state.store = { bot_id: "bot-1", currency: null };
    state.products = [{ shopify_id: "gid://shopify/Product/8", name: "Other", price: 1, image: "", url: "u", currency: "JPY" }];

    await send("products/create", product());

    expect(state.products[1].currency).toBe("JPY");
  });

  it("does nothing for a shop that isn't linked to a bot", async () => {
    const { state, query } = fakeDb();
    state.store = null;

    expect(await send("products/create", product(), "wh-x")).toBe("no_store");
    expect(query.mock.calls.some(([sql]) => sql.includes("UPDATE bots"))).toBe(false);
  });

  it("locks the bot row before reading products or removal markers", async () => {
    const { query } = fakeDb();

    await send("products/update", product(), "wh-lock");

    const statements = query.mock.calls.map(([sql]) => sql as string);
    const lock = statements.findIndex((sql) => sql.includes("FOR UPDATE"));
    const removal = statements.findIndex((sql) => sql.includes("FROM shopify_product_removals"));
    expect(statements[0]).toContain("INSERT INTO shopify_webhook_events");
    expect(lock).toBeGreaterThan(0);
    expect(removal).toBeGreaterThan(lock);
  });
});

describe("saveSyncedProducts", () => {
  const syncStartedAt = new Date("2026-11-05T12:00:00Z");
  const synced = (id: number, updated_at: string, name = `Synced ${id}`): ShopifyBotProduct => ({
    shopify_id: `gid://shopify/Product/${id}`,
    name,
    price: 10,
    image: "",
    url: `https://${shop}/products/p${id}`,
    currency: "EUR",
    updated_at,
  });

  beforeEach(() => jest.clearAllMocks());

  it("keeps products that aren't from Shopify", async () => {
    const { state } = fakeDb();
    state.products = [{ name: "Crawled product", price: 5, image: "", url: "https://example.com/p" }];

    await saveSyncedProducts({ shop, botId: "bot-1", synced: [synced(1, "2026-11-05T10:00:00Z")], syncStartedAt });

    expect(state.products.map((p) => p.name)).toEqual(["Crawled product", "Synced 1"]);
  });

  it("keeps a newer version a webhook saved while the sync was running", async () => {
    const { state } = fakeDb();
    state.products = [{ ...synced(1, "2026-11-05T12:05:00Z", "Edited during sync") }];

    await saveSyncedProducts({ shop, botId: "bot-1", synced: [synced(1, "2026-11-05T11:00:00Z")], syncStartedAt });

    expect(state.products.map((p) => p.name)).toEqual(["Edited during sync"]);
  });

  it("doesn't re-add products deleted or deactivated by a newer webhook", async () => {
    const { state } = fakeDb();
    state.removals.set("gid://shopify/Product/1", { deleted: true, product_updated_at: null });
    state.removals.set("gid://shopify/Product/2", { deleted: false, product_updated_at: new Date("2026-11-05T12:01:00Z") });

    await saveSyncedProducts({
      shop,
      botId: "bot-1",
      synced: [synced(1, "2026-11-05T11:00:00Z"), synced(2, "2026-11-05T11:00:00Z"), synced(3, "2026-11-05T11:00:00Z")],
      syncStartedAt,
    });

    expect(state.products.map((p) => p.shopify_id)).toEqual(["gid://shopify/Product/3"]);
  });

  it("keeps a product created during the sync but drops ones gone from Shopify", async () => {
    const { state } = fakeDb();
    state.products = [synced(8, "2026-11-01T09:00:00Z", "Deleted in Shopify"), synced(9, "2026-11-05T12:02:00Z", "Created during sync")];

    const saved = await saveSyncedProducts({ shop, botId: "bot-1", synced: [synced(1, "2026-11-05T10:00:00Z")], syncStartedAt });

    expect(state.products.map((p) => p.name)).toEqual(["Synced 1", "Created during sync"]);
    expect(saved).toEqual(state.products);
  });

  it("locks the bot row before reading it", async () => {
    const { query } = fakeDb();

    await saveSyncedProducts({ shop, botId: "bot-1", synced: [], syncStartedAt });

    expect(query.mock.calls[0][0]).toContain("FOR UPDATE");
    expect(query.mock.calls.at(-1)?.[0]).toContain("ecommerce_enabled = true");
  });
});
