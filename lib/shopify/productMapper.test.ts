import {
  fromGraphQLProduct,
  fromWebhookProduct,
  isOlderThan,
  isProductActive,
  toBotProduct,
  type ShopifyGraphQLProductNode,
  type ShopifyWebhookProductPayload,
} from "./productMapper";

const shop = "test-store.myshopify.com";

// The same Shopify product, as the sync query and a products/update webhook describe it.
const graphqlNode: ShopifyGraphQLProductNode = {
  id: "gid://shopify/Product/42",
  title: "Linen Shirt",
  descriptionHtml: "<p>Breathable <b>linen</b></p>",
  handle: "linen-shirt",
  status: "ACTIVE",
  updatedAt: "2026-11-05T10:00:00Z",
  productType: "Shirts",
  vendor: "Acme",
  tags: ["summer", "linen"],
  options: [
    { name: "Color", values: ["White", "Blue"] },
    { name: "Size", values: ["M"] },
  ],
  priceRangeV2: { minVariantPrice: { amount: "39.00", currencyCode: "EUR" } },
  images: { edges: [{ node: { url: "https://cdn.shopify.com/a.jpg" } }, { node: { url: "https://cdn.shopify.com/b.jpg" } }] },
  variants: {
    edges: [
      {
        node: {
          id: "gid://shopify/ProductVariant/1",
          title: "White / M",
          price: "39.00",
          availableForSale: true,
          sku: "LS-W-M",
          selectedOptions: [
            { name: "Color", value: "White" },
            { name: "Size", value: "M" },
          ],
        },
      },
      {
        node: {
          id: "gid://shopify/ProductVariant/2",
          title: "Blue / M",
          price: "41.00",
          availableForSale: false,
          sku: "LS-B-M",
          selectedOptions: [
            { name: "Color", value: "Blue" },
            { name: "Size", value: "M" },
          ],
        },
      },
    ],
  },
};

const webhookPayload: ShopifyWebhookProductPayload = {
  id: 42,
  title: "Linen Shirt",
  body_html: "<p>Breathable <b>linen</b></p>",
  handle: "linen-shirt",
  status: "active",
  updated_at: "2026-11-05T10:00:00Z",
  product_type: "Shirts",
  vendor: "Acme",
  tags: "summer, linen",
  // Deliberately out of order: option1/2/3 follow position, not array order.
  options: [
    { name: "Size", position: 2, values: ["M"] },
    { name: "Color", position: 1, values: ["White", "Blue"] },
  ],
  variants: [
    { id: 1, title: "White / M", price: "39.00", sku: "LS-W-M", inventory_quantity: 3, inventory_management: "shopify", option1: "White", option2: "M" },
    { id: 2, title: "Blue / M", price: "41.00", sku: "LS-B-M", inventory_quantity: 0, inventory_management: "shopify", inventory_policy: "deny", option1: "Blue", option2: "M" },
  ],
  images: [
    { src: "https://cdn.shopify.com/b.jpg", position: 2 },
    { src: "https://cdn.shopify.com/a.jpg", position: 1 },
  ],
};

describe("productMapper", () => {
  it("gives the same product for the sync and the webhook", () => {
    const fromSync = toBotProduct(fromGraphQLProduct(graphqlNode), { shop, currency: "EUR" });
    const fromWebhook = toBotProduct(fromWebhookProduct(webhookPayload), { shop, currency: "EUR" });

    expect(fromWebhook).toEqual(fromSync);
    expect(fromSync).toMatchObject({
      shopify_id: "gid://shopify/Product/42",
      description: "Breathable linen",
      price: 39,
      currency: "EUR",
      image_url: "https://cdn.shopify.com/a.jpg",
      url: "https://test-store.myshopify.com/products/linen-shirt",
      available: true,
      updated_at: "2026-11-05T10:00:00Z",
      metadata: { color: ["White", "Blue"], size: "M", tags: ["summer", "linen"], inStock: true },
    });
  });

  it("maps webhook option1/2/3 to the variant's color and size by option position", () => {
    const product = toBotProduct(fromWebhookProduct(webhookPayload), { shop, currency: "EUR" });

    expect(product.variants).toEqual([
      expect.objectContaining({ id: "gid://shopify/ProductVariant/1", color: "White", size: "M", available: true }),
      expect.objectContaining({ id: "gid://shopify/ProductVariant/2", color: "Blue", size: "M", available: false }),
    ]);
  });

  it("treats untracked or oversellable stock as available, like availableForSale", () => {
    const variants = fromWebhookProduct({
      ...webhookPayload,
      variants: [
        { id: 1, price: "1", inventory_quantity: 0, inventory_management: null },
        { id: 2, price: "1", inventory_quantity: 0, inventory_management: "shopify", inventory_policy: "continue" },
        { id: 3, price: "1", inventory_quantity: 0, inventory_management: "shopify", inventory_policy: "deny" },
      ],
    }).variants;

    expect(variants.map((v) => v.available)).toEqual([true, true, false]);
  });

  it("uses the shop's currency, then the product's, and never hardcodes one when either is known", () => {
    const input = fromGraphQLProduct(graphqlNode);

    expect(toBotProduct(input, { shop, currency: "GBP" }).currency).toBe("GBP");
    expect(toBotProduct(input, { shop, currency: null }).currency).toBe("EUR");
    expect(toBotProduct(fromWebhookProduct(webhookPayload), { shop, currency: "INR" }).currency).toBe("INR");
  });

  it("marks draft and archived products inactive", () => {
    expect(isProductActive(fromWebhookProduct({ ...webhookPayload, status: "draft" }))).toBe(false);
    expect(isProductActive(fromGraphQLProduct({ ...graphqlNode, status: "ARCHIVED" }))).toBe(false);
    expect(isProductActive(fromWebhookProduct(webhookPayload))).toBe(true);
    expect(isProductActive(fromWebhookProduct({ ...webhookPayload, status: undefined }))).toBe(true);
  });

  it("isOlderThan compares instants and ignores missing timestamps", () => {
    expect(isOlderThan("2026-11-05T09:00:00Z", "2026-11-05T10:00:00Z")).toBe(true);
    expect(isOlderThan("2026-11-05T10:00:00Z", "2026-11-05T10:00:00Z")).toBe(false);
    expect(isOlderThan("2026-11-05T06:00:00-05:00", "2026-11-05T10:00:00Z")).toBe(false);
    expect(isOlderThan(null, "2026-11-05T10:00:00Z")).toBe(false);
    expect(isOlderThan("2026-11-05T10:00:00Z", undefined)).toBe(false);
  });
});
