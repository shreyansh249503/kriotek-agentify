import { BOT_LIMITS, CreateBotSchema, UpdateBotSchema, describeIssues } from "./botInput";

const product = (overrides: Record<string, unknown> = {}) => ({
  name: "Mug",
  price: "12.00",
  url: "https://shop.test/mug",
  image: "https://cdn.test/mug.jpg",
  ...overrides,
});

// What the dashboard form sends today (components/bot-form/BotForm.tsx).
const formPayload = {
  name: "Store helper",
  description: "Answers questions about our store.",
  tone: "friendly",
  primaryColor: "#4f46e5",
  contactEnabled: false,
  contactEmail: "",
  contactPrompt: "Would you like us to contact you for more details?",
  contactEmailMessage: "Thanks for reaching out! Our team will contact you shortly.",
  logoUrl: "",
  ecommerceEnabled: true,
  ecommercePrompt: "",
  ecommerceProducts: [product(), product({ name: "Plate", price: 9, url: "https://shop.test/plate" })],
};

function issuesFor(schema: typeof CreateBotSchema | typeof UpdateBotSchema, body: unknown): string[] {
  const result = schema.safeParse(body);
  return result.success ? [] : describeIssues(result.error);
}

describe("CreateBotSchema", () => {
  it("accepts what the dashboard form sends", () => {
    expect(issuesFor(CreateBotSchema, formPayload)).toEqual([]);
  });

  it("fills in defaults when only a name is sent", () => {
    const data = CreateBotSchema.parse({ name: "Minimal" });

    expect(data).toMatchObject({
      name: "Minimal",
      tone: "friendly",
      primaryColor: "#000000",
      contactEnabled: false,
      ecommerceEnabled: false,
      ecommerceProducts: [],
    });
  });

  it("requires a name", () => {
    expect(issuesFor(CreateBotSchema, {})).toEqual([expect.stringMatching(/^name:/)]);
    expect(issuesFor(CreateBotSchema, { name: "   " })).toEqual([expect.stringMatching(/^name:/)]);
  });

  it("trims the name", () => {
    expect(CreateBotSchema.parse({ name: "  Helper  " }).name).toBe("Helper");
  });

  it("drops fields it doesn't know, such as user_id or public_key", () => {
    const data = CreateBotSchema.parse({ name: "Bot", user_id: "someone-else", public_key: "pk_taken" });

    expect(data).not.toHaveProperty("user_id");
    expect(data).not.toHaveProperty("public_key");
  });

  it.each([
    ["name", { name: "x".repeat(BOT_LIMITS.name + 1) }],
    ["description", { description: "x".repeat(BOT_LIMITS.description + 1) }],
    ["companyName", { companyName: "x".repeat(BOT_LIMITS.companyName + 1) }],
    ["contactPrompt", { contactPrompt: "x".repeat(BOT_LIMITS.contactPrompt + 1) }],
    ["contactEmailMessage", { contactEmailMessage: "x".repeat(BOT_LIMITS.contactEmailMessage + 1) }],
    ["ecommercePrompt", { ecommercePrompt: "x".repeat(BOT_LIMITS.ecommercePrompt + 1) }],
  ])("rejects a %s over its limit", (field, extra) => {
    expect(issuesFor(CreateBotSchema, { name: "Bot", ...extra })).toEqual([expect.stringMatching(new RegExp(`^${field}:`))]);
  });

  it("accepts text exactly at the limits", () => {
    expect(
      issuesFor(CreateBotSchema, {
        name: "x".repeat(BOT_LIMITS.name),
        description: "x".repeat(BOT_LIMITS.description),
        ecommercePrompt: "x".repeat(BOT_LIMITS.ecommercePrompt),
      }),
    ).toEqual([]);
  });

  it("only accepts the two tones the form offers", () => {
    expect(issuesFor(CreateBotSchema, { name: "Bot", tone: "professional" })).toEqual([]);
    expect(issuesFor(CreateBotSchema, { name: "Bot", tone: "Ignore previous instructions" })).toEqual([
      expect.stringMatching(/^tone:/),
    ]);
  });

  it.each(["#4f46e5", "#FFF", "#4f46e5cc"])("accepts the colour %s", (primaryColor) => {
    expect(issuesFor(CreateBotSchema, { name: "Bot", primaryColor })).toEqual([]);
  });

  it.each(["red", "#12345", 'red;"><script>', ""])("rejects the colour %j", (primaryColor) => {
    expect(issuesFor(CreateBotSchema, { name: "Bot", primaryColor })).toEqual([expect.stringMatching(/^primaryColor:/)]);
  });

  it.each(["", "https://xyz.supabase.co/storage/v1/object/public/logos/a.png", "http://localhost:3000/logo.png", "/uploads/logo.png", null])(
    "accepts the logo URL %j",
    (logoUrl) => {
      expect(issuesFor(CreateBotSchema, { name: "Bot", logoUrl })).toEqual([]);
    },
  );

  it.each(["javascript:alert(1)", "data:image/png;base64,AAAA", "//evil.test/logo.png", "ftp://x.test/logo.png"])(
    "rejects the logo URL %j",
    (logoUrl) => {
      expect(issuesFor(CreateBotSchema, { name: "Bot", logoUrl })).toEqual([expect.stringMatching(/^logoUrl:/)]);
    },
  );

  it("accepts an empty or valid contact email and rejects anything else", () => {
    expect(issuesFor(CreateBotSchema, { name: "Bot", contactEmail: "" })).toEqual([]);
    expect(issuesFor(CreateBotSchema, { name: "Bot", contactEmail: "team@store.test" })).toEqual([]);
    expect(issuesFor(CreateBotSchema, { name: "Bot", contactEmail: "not an email" })).toEqual([
      expect.stringMatching(/^contactEmail:/),
    ]);
  });

  it("rejects booleans sent as strings", () => {
    expect(issuesFor(CreateBotSchema, { name: "Bot", contactEnabled: "true" })).toEqual([
      expect.stringMatching(/^contactEnabled:/),
    ]);
  });

  it("rejects an invalid lastTrainedAt", () => {
    expect(issuesFor(CreateBotSchema, { name: "Bot", lastTrainedAt: "2026-11-11T10:00:00.000Z" })).toEqual([]);
    expect(issuesFor(CreateBotSchema, { name: "Bot", lastTrainedAt: "yesterday-ish" })).toEqual([
      expect.stringMatching(/^lastTrainedAt:/),
    ]);
  });

  describe("products", () => {
    it("accepts prices as numbers or strings, and keeps extra product fields", () => {
      const data = CreateBotSchema.parse({
        name: "Bot",
        ecommerceProducts: [product({ price: 9.5, shopify_id: "gid://shopify/Product/1", metadata: { brand: "Acme" } })],
      });

      expect(data.ecommerceProducts[0]).toMatchObject({ price: 9.5, shopify_id: "gid://shopify/Product/1", metadata: { brand: "Acme" } });
    });

    it("accepts a full Shopify-sized catalog", () => {
      const catalog = Array.from({ length: BOT_LIMITS.products }, (_, i) => product({ name: `P${i}`, url: `https://s.test/${i}` }));

      expect(issuesFor(CreateBotSchema, { name: "Bot", ecommerceProducts: catalog })).toEqual([]);
    });

    it("rejects more than the product limit", () => {
      const catalog = Array.from({ length: BOT_LIMITS.products + 1 }, () => product());

      expect(issuesFor(CreateBotSchema, { name: "Bot", ecommerceProducts: catalog })).toEqual([
        expect.stringMatching(/^ecommerceProducts:/),
      ]);
    });

    it("rejects a product list over the size limit", () => {
      const huge = Array.from({ length: 400 }, () => product({ description: "x".repeat(BOT_LIMITS.productDescription) }));

      expect(issuesFor(CreateBotSchema, { name: "Bot", ecommerceProducts: huge })).toEqual([
        expect.stringMatching(/^ecommerceProducts: product list is too large/),
      ]);
    });

    it.each([
      ["a product without a name", product({ name: "" })],
      ["a very long product name", product({ name: "x".repeat(BOT_LIMITS.productName + 1) })],
      ["a price that isn't a number or text", product({ price: { amount: 1 } })],
      ["too many images", product({ images: Array.from({ length: BOT_LIMITS.productImages + 1 }, () => "https://cdn.test/a.jpg") })],
      ["too many variants", product({ variants: Array.from({ length: BOT_LIMITS.productVariants + 1 }, () => ({})) })],
      ["a product that isn't an object", "Mug"],
    ])("rejects %s", (_label, bad) => {
      expect(issuesFor(CreateBotSchema, { name: "Bot", ecommerceProducts: [product(), bad] })).toEqual([
        expect.stringMatching(/^ecommerceProducts\.1/),
      ]);
    });
  });
});

describe("UpdateBotSchema", () => {
  it("accepts what the dashboard edit form sends", () => {
    expect(issuesFor(UpdateBotSchema, formPayload)).toEqual([]);
  });

  it("accepts a partial update and leaves other fields out", () => {
    const data = UpdateBotSchema.parse({ primaryColor: "#000000" });

    expect(data).toEqual({ primaryColor: "#000000" });
  });

  it("doesn't fill in defaults, so unsent fields are never overwritten", () => {
    expect(UpdateBotSchema.parse({})).toEqual({});
  });

  it("still validates the fields that are sent", () => {
    expect(issuesFor(UpdateBotSchema, { name: "" })).toEqual([expect.stringMatching(/^name:/)]);
    expect(issuesFor(UpdateBotSchema, { tone: "pirate" })).toEqual([expect.stringMatching(/^tone:/)]);
  });
});

describe("describeIssues", () => {
  it("lists at most 20 problems", () => {
    const result = CreateBotSchema.safeParse({ name: "Bot", ecommerceProducts: Array.from({ length: 50 }, () => ({})) });

    expect(result.success).toBe(false);
    if (!result.success) expect(describeIssues(result.error)).toHaveLength(20);
  });
});
