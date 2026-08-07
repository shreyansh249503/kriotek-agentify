import { runReceptionistAgent } from "./receptionistAgent";
import { streamText } from "ai";

jest.mock("ai", () => ({
  streamText: jest.fn().mockReturnValue({ textStream: "mock stream" }),
  tool: jest.fn((config) => config),
}));

jest.mock("@ai-sdk/google", () => ({
  google: jest.fn().mockReturnValue("mock-google-model"),
}));

describe("receptionistAgent", () => {
  const mockBotConfig = {
    id: "bot-123",
    name: "Test Bot",
    description: "A test assistant bot",
    tone: "friendly",
    supported_languages: ["English"],
    ecommerce_enabled: true,
    ecommerce_prompt: "Recommend catalog items",
    ecommerce_products: [],
    primary_color: "#000000",
    contact_enabled: true,
    contact_email: "support@test.com",
    contact_prompt: "Ask for email",
    contact_email_message: "Thanks!",
    user_id: "user-123",
    logo_url: "",
    leads: [],
    conversations: [],
    shopify_stores: [],
  };

  it("should configure streamText without shopify tools when isShopifyConnected is false", () => {
    runReceptionistAgent({
      messages: [{ role: "user", content: "Hello" }],
      botConfig: mockBotConfig,
      leadDecision: null,
      websiteContext: "Website info",
      isShopifyConnected: false,
    });

    expect(streamText).toHaveBeenCalledWith(
      expect.objectContaining({
        model: "mock-google-model",
        messages: [{ role: "user", content: "Hello" }],
      })
    );
  });

  it("should include lookup_shopify_order tool when isShopifyConnected is true", () => {
    runReceptionistAgent({
      messages: [{ role: "user", content: "Where is my order #1001?" }],
      botConfig: mockBotConfig,
      leadDecision: {
        collectedInfo: { name: "John" },
        missingFields: ["email"],
        isComplete: false,
      },
      websiteContext: "Website info",
      isShopifyConnected: true,
    });

    expect(streamText).toHaveBeenCalledWith(
      expect.objectContaining({
        tools: expect.objectContaining({
          lookup_shopify_order: expect.anything(),
        }),
      })
    );
  });
});
