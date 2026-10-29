import { contactMatchesOrder, lookupVerifiedOrder, sanitizeSearchTerm } from "./orderLookup";
import { RawShopifyOrderNode } from "./shopifyOrderMapper";

const order = (overrides: Partial<RawShopifyOrderNode> = {}): RawShopifyOrderNode =>
  ({
    id: "gid://shopify/Order/5550001",
    name: "#1001",
    email: "jane@example.com",
    phone: "+1 (415) 555-0123",
    createdAt: "2026-10-01T00:00:00Z",
    displayFinancialStatus: "PAID",
    displayFulfillmentStatus: "UNFULFILLED",
    totalPriceSet: { presentmentMoney: { amount: "10.00", currencyCode: "USD" } },
    lineItems: { edges: [] },
    fulfillments: [],
    ...overrides,
  }) as unknown as RawShopifyOrderNode;

const shopifyReturns = (...nodes: RawShopifyOrderNode[]) => ({
  ok: true,
  json: async () => ({ data: { orders: { edges: nodes.map((node) => ({ node })) } } }),
});

describe("orderLookup", () => {
  const originalFetch = global.fetch;
  const base = { shop: "shop.myshopify.com", accessToken: "tok", orderNumber: "#1001" };

  beforeEach(() => {
    global.fetch = jest.fn();
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  describe("contactMatchesOrder", () => {
    it("matches the order email case-insensitively (caller lowercases input)", () => {
      expect(contactMatchesOrder(order({ email: "Jane@Example.com" }), "jane@example.com", "")).toBe(true);
    });

    it("matches the full phone or a suffix of at least 7 digits", () => {
      expect(contactMatchesOrder(order(), null, "14155550123")).toBe(true);
      expect(contactMatchesOrder(order(), null, "4155550123")).toBe(true);
      expect(contactMatchesOrder(order(), null, "5550123")).toBe(true);
    });

    it("matches when the customer adds a country code the record lacks", () => {
      expect(contactMatchesOrder(order({ phone: "4155550123" }), null, "14155550123")).toBe(true);
    });

    it("rejects short phone fragments", () => {
      expect(contactMatchesOrder(order(), null, "0123")).toBe(false);
      expect(contactMatchesOrder(order(), null, "3")).toBe(false);
    });

    it("never matches an order with no contact details on record", () => {
      const anonymous = order({ email: null, phone: null } as Partial<RawShopifyOrderNode>);
      expect(contactMatchesOrder(anonymous, "anyone@example.com", "5550123")).toBe(false);
    });

    it("rejects a different email", () => {
      expect(contactMatchesOrder(order(), "attacker@example.com", "")).toBe(false);
    });
  });

  describe("sanitizeSearchTerm", () => {
    it("strips Shopify search syntax characters", () => {
      expect(sanitizeSearchTerm('1001" OR email:*')).toBe("1001 OR email");
    });
  });

  describe("lookupVerifiedOrder", () => {
    it("requires an email or a 7+ digit phone before calling Shopify", async () => {
      expect(await lookupVerifiedOrder(base)).toEqual({ status: "verification_required" });
      expect(await lookupVerifiedOrder({ ...base, phone: "12-34" })).toEqual({ status: "verification_required" });
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it("returns the journey when the order number and email match", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce(shopifyReturns(order()));

      const result = await lookupVerifiedOrder({ ...base, email: " JANE@example.com " });

      expect(result.status).toBe("found");
      expect(result.status === "found" && result.journey.orderNumber).toBe("#1001");
    });

    it("reports verification_failed when the contact does not match", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce(shopifyReturns(order()));

      expect(await lookupVerifiedOrder({ ...base, email: "attacker@example.com" })).toEqual({
        status: "verification_failed",
      });
    });

    it("ignores orders whose number only partially matches", async () => {
      (global.fetch as jest.Mock).mockResolvedValue(
        shopifyReturns(order({ name: "#10011" }), order({ name: "#1", id: "gid://shopify/Order/1001999" }))
      );

      expect(await lookupVerifiedOrder({ ...base, email: "jane@example.com" })).toEqual({ status: "not_found" });
    });

    it("never falls back to listing recent orders", async () => {
      (global.fetch as jest.Mock).mockResolvedValue(shopifyReturns());

      await lookupVerifiedOrder({ ...base, email: "jane@example.com" });

      expect(global.fetch).toHaveBeenCalledTimes(2);
      for (const [, init] of (global.fetch as jest.Mock).mock.calls) {
        const { variables } = JSON.parse(init.body);
        expect(variables.query).toBeTruthy();
      }
    });

    it("sends sanitized order numbers to Shopify", async () => {
      (global.fetch as jest.Mock).mockResolvedValue(shopifyReturns());

      await lookupVerifiedOrder({ ...base, orderNumber: '1001" OR status:any', email: "jane@example.com" });

      const { variables } = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
      expect(variables.query).not.toContain('" OR status');
    });
  });
});
