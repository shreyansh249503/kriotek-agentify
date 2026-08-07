import { buildSystemPrompt } from "./agent";

describe("buildSystemPrompt", () => {
  it("should build base system prompt with company description and tone", () => {
    const prompt = buildSystemPrompt(
      {
        companyName: "Kriotek AI",
        companyDescription: "Leading AI solutions provider",
        tone: "friendly",
      },
      { websiteContext: "We build AI bots." }
    );

    expect(prompt).toContain("You are a confident, natural sales assistant for Kriotek AI.");
    expect(prompt).toContain("Leading AI solutions provider");
    expect(prompt).toContain("Warm, approachable, conversational");
    expect(prompt).toContain("WEBSITE CONTEXT");
    expect(prompt).toContain("We build AI bots.");
  });

  it("should append shopify order tracking instructions when shopifyEnabled is true", () => {
    const prompt = buildSystemPrompt(
      {
        companyName: "Shopify Store",
        companyDescription: "E-commerce store",
        shopifyEnabled: true,
      },
      { websiteContext: "" }
    );

    expect(prompt).toContain("SHOPIFY ORDER TRACKING & JOURNEY");
    expect(prompt).toContain("lookup_shopify_order");
  });

  it("should append contact collection guidelines when contactState is provided", () => {
    const prompt = buildSystemPrompt(
      {
        companyName: "Acme Inc",
        companyDescription: "Acme products",
      },
      { websiteContext: "" },
      {
        collected: { name: "Alice" },
        missingFields: ["email"],
        isComplete: false,
      }
    );

    expect(prompt).toContain("CONTACT COLLECTION — INTELLIGENT MODE");
    expect(prompt).toContain('Already confirmed — DO NOT re-ask: name: "Alice"');
    expect(prompt).toContain("Still need to collect IN THIS ORDER: email");
  });

  it("should output complete contact collection notice when contact is complete", () => {
    const prompt = buildSystemPrompt(
      {
        companyName: "Acme Inc",
        companyDescription: "Acme products",
      },
      { websiteContext: "" },
      {
        collected: { name: "Alice", email: "alice@example.com" },
        missingFields: [],
        isComplete: true,
      }
    );

    expect(prompt).toContain("CONTACT COLLECTION — COMPLETE");
    expect(prompt).toContain('USER name: "Alice"');
    expect(prompt).toContain('USER email: "alice@example.com"');
  });

  it("should build active e-commerce strategy section when ecommerceEnabled is true", () => {
    const prompt = buildSystemPrompt(
      {
        companyName: "Tech Shop",
        companyDescription: "Gadgets store",
        ecommerceEnabled: true,
        ecommerceProducts: [
          {
            name: "Smart Watch",
            price: "$99",
            url: "https://shop.com/watch",
            image: "https://shop.com/watch.jpg",
          },
        ],
      },
      { websiteContext: "" }
    );

    expect(prompt).toContain("E-COMMERCE & SALES STRATEGY");
    expect(prompt).toContain("Smart Watch");
    expect(prompt).toContain("<product-carousel>");
  });
});
