import { classifyUserIntent } from "./routerAgent";
import { generateObject } from "ai";

jest.mock("ai", () => ({
  generateObject: jest.fn(),
}));

jest.mock("@ai-sdk/google", () => ({
  google: jest.fn(),
}));

describe("classifyUserIntent", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "log").mockImplementation(() => {});
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  it("should fast-path classify basic greetings as GENERAL without invoking generateObject", async () => {
    const messages = [{ role: "user" as const, content: "Hello!" }];
    const result = await classifyUserIntent(messages, {
      ecommerceEnabled: true,
      shopifyConnected: true,
    });

    expect(result.primaryIntent).toBe("GENERAL");
    expect(result.confidence).toBeGreaterThanOrEqual(0.9);
    expect(generateObject).not.toHaveBeenCalled();
  });

  it("should fast-path classify explicit human takeover demands as COMPLAINT", async () => {
    const messages = [
      { role: "user" as const, content: "I want to speak to a human representative now" },
    ];
    const result = await classifyUserIntent(messages, {
      ecommerceEnabled: true,
      shopifyConnected: true,
    });

    expect(result.primaryIntent).toBe("COMPLAINT");
    expect(generateObject).not.toHaveBeenCalled();
  });

  it("should fast-path classify explicit order tracking syntax as ORDER_LOOKUP", async () => {
    const messages = [
      { role: "user" as const, content: "Where is my order #1042? Can you track it?" },
    ];
    const result = await classifyUserIntent(messages, {
      ecommerceEnabled: true,
      shopifyConnected: true,
    });

    expect(result.primaryIntent).toBe("ORDER_LOOKUP");
    expect(result.entities?.orderNumber).toBe("#1042");
    expect(generateObject).not.toHaveBeenCalled();
  });

  it("should use LLM generateObject for contextual sales intent queries", async () => {
    (generateObject as jest.Mock).mockResolvedValueOnce({
      object: {
        primaryIntent: "SALES",
        confidence: 0.96,
        reasoning: "User is asking for gift recommendations for an upcoming birthday",
        entities: {
          productKeywords: ["gifts", "tech gadgets"],
        },
      },
    });

    const messages = [
      { role: "user" as const, content: "My brother is turning 20 and loves gadgets, what should I get him?" },
    ];

    const result = await classifyUserIntent(messages, {
      ecommerceEnabled: true,
      shopifyConnected: true,
      hasCatalog: true,
    });

    expect(result.primaryIntent).toBe("SALES");
    expect(result.confidence).toBe(0.96);
    expect(generateObject).toHaveBeenCalledTimes(1);
  });

  it("should correctly classify support inquiries and not confuse them with sales", async () => {
    (generateObject as jest.Mock).mockResolvedValueOnce({
      object: {
        primaryIntent: "SUPPORT",
        confidence: 0.94,
        reasoning: "User is asking how to wash apparel, which is a care/policy support question",
      },
    });

    const messages = [
      { role: "user" as const, content: "How do I wash my cotton hoodie without shrinking it?" },
    ];

    const result = await classifyUserIntent(messages, {
      ecommerceEnabled: true,
      shopifyConnected: true,
      hasCatalog: true,
    });

    expect(result.primaryIntent).toBe("SUPPORT");
    expect(generateObject).toHaveBeenCalledTimes(1);
  });

  it("should fallback gracefully if generateObject throws an error", async () => {
    (generateObject as jest.Mock).mockRejectedValueOnce(new Error("AI Gateway Timeout"));

    const messages = [
      { role: "user" as const, content: "How much is the blue running shoe?" },
    ];

    const result = await classifyUserIntent(messages, {
      ecommerceEnabled: true,
      shopifyConnected: true,
      hasCatalog: true,
    });

    expect(result.primaryIntent).toBe("SALES");
    expect(result.confidence).toBe(0.5);
  });
});
