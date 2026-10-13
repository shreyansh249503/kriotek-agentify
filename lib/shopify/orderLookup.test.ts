import {
  lookupShopifyOrder,
  normalizeOrderNumber,
  normalizePhone,
  verifyOrderContact,
} from "./orderLookup";
import type { RawShopifyOrderNode } from "./shopifyOrderMapper";

jest.mock("@supabase/supabase-js", () => ({ createClient: jest.fn() }));

const store = { shop: "shop.myshopify.com", access_token: "tok" };
const loadStore = jest.fn().mockResolvedValue(store);

function order(overrides: Partial<RawShopifyOrderNode> = {}): RawShopifyOrderNode {
  return {
    id: "gid://shopify/Order/1",
    name: "#1001",
    createdAt: "2026-01-01T00:00:00Z",
    email: "buyer@example.com",
    phone: "+49 151 2345678",
    ...overrides,
  };
}

function mockShopify(nodes: RawShopifyOrderNode[], ok = true) {
  (global.fetch as jest.Mock).mockResolvedValueOnce({
    ok,
    status: ok ? 200 : 500,
    json: jest.fn().mockResolvedValue({
      data: { orders: { edges: nodes.map((node) => ({ node })) } },
    }),
  });
}

describe("orderLookup", () => {
  const originalFetch = global.fetch;
  beforeEach(() => {
    global.fetch = jest.fn();
    jest.spyOn(console, "error").mockImplementation(() => {});
  });
  afterAll(() => {
    global.fetch = originalFetch;
  });

  describe("normalizers", () => {
    it("accepts order numbers with or without #", () => {
      expect(normalizeOrderNumber("#1001")).toBe("1001");
      expect(normalizeOrderNumber(" 1001 ")).toBe("1001");
    });

    it("rejects order numbers that could inject search syntax", () => {
      expect(normalizeOrderNumber('1001" OR email:*')).toBeNull();
      expect(normalizeOrderNumber("")).toBeNull();
    });

    it("rejects phone numbers shorter than 7 digits", () => {
      expect(normalizePhone("1")).toBeNull();
      expect(normalizePhone("12345")).toBeNull();
      expect(normalizePhone("+49 151 2345678")).toBe("491512345678");
    });
  });

  describe("verifyOrderContact", () => {
    it("matches on exact email, case-insensitive", () => {
      expect(verifyOrderContact(order(), "buyer@example.com", null)).toBe(true);
      expect(verifyOrderContact(order({ email: "Buyer@Example.com" }), "buyer@example.com", null)).toBe(true);
    });

    it("does not match a different email", () => {
      expect(verifyOrderContact(order(), "attacker@example.com", null)).toBe(false);
    });

    it("matches a phone given with or without country code", () => {
      expect(verifyOrderContact(order(), null, "01512345678".replace(/^0/, ""))).toBe(true);
      expect(verifyOrderContact(order(), null, "491512345678")).toBe(true);
    });

    it("never verifies an order that has no contact details", () => {
      const bare = order({ email: null, phone: null, customer: null, shippingAddress: null });
      expect(verifyOrderContact(bare, "buyer@example.com", "491512345678")).toBe(false);
    });
  });

  describe("lookupShopifyOrder", () => {
    it("requires an email or phone before calling Shopify", async () => {
      const res = await lookupShopifyOrder({ botId: "b", orderNumber: "1001" }, { loadStore });
      expect(res).toMatchObject({ ok: false, code: "verification_required" });
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it("treats a too-short phone as missing", async () => {
      const res = await lookupShopifyOrder(
        { botId: "b", orderNumber: "1001", phone: "1" },
        { loadStore },
      );
      expect(res).toMatchObject({ ok: false, code: "verification_required" });
    });

    it("returns the journey when the contact details match", async () => {
      mockShopify([order()]);
      const res = await lookupShopifyOrder(
        { botId: "b", orderNumber: "#1001", email: "buyer@example.com" },
        { loadStore },
      );
      expect(res.ok).toBe(true);
      const body = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
      expect(body.variables.query).toBe('name:"#1001" OR name:"1001"');
    });

    it("refuses when the email does not match", async () => {
      mockShopify([order()]);
      const res = await lookupShopifyOrder(
        { botId: "b", orderNumber: "1001", email: "attacker@example.com" },
        { loadStore },
      );
      expect(res).toMatchObject({ ok: false, code: "verification_failed" });
    });

    it("gives the same message for unknown orders and wrong contact details", async () => {
      mockShopify([]);
      const missing = await lookupShopifyOrder(
        { botId: "b", orderNumber: "9999", email: "buyer@example.com" },
        { loadStore },
      );
      mockShopify([order()]);
      const wrong = await lookupShopifyOrder(
        { botId: "b", orderNumber: "1001", email: "x@example.com" },
        { loadStore },
      );
      expect(missing.ok || wrong.ok).toBe(false);
      if (!missing.ok && !wrong.ok) expect(missing.message).toBe(wrong.message);
    });

    it("ignores search results whose order number differs", async () => {
      mockShopify([order({ name: "#10010" })]);
      const res = await lookupShopifyOrder(
        { botId: "b", orderNumber: "1001", email: "buyer@example.com" },
        { loadStore },
      );
      expect(res.ok).toBe(false);
    });

    it("reports when the store is not connected", async () => {
      const res = await lookupShopifyOrder(
        { botId: "b", orderNumber: "1001", email: "buyer@example.com" },
        { loadStore: jest.fn().mockResolvedValue(null) },
      );
      expect(res).toMatchObject({ ok: false, code: "not_configured" });
    });
  });
});
