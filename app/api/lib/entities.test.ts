import {
  Bot,
  Conversation,
  Lead,
  CrawledPage,
  BotDocument,
  ShopifyStore,
} from "./entities";

describe("TypeORM Entities instantiation", () => {
  it("should instantiate Bot entity with expected default properties", () => {
    const bot = new Bot();
    bot.id = "bot-uuid";
    bot.name = "Support Bot";

    expect(bot.id).toBe("bot-uuid");
    expect(bot.name).toBe("Support Bot");
  });

  it("should instantiate Conversation entity", () => {
    const convo = new Conversation();
    convo.id = "convo-uuid";
    convo.state = "active";
    convo.message_count = 5;

    expect(convo.id).toBe("convo-uuid");
    expect(convo.state).toBe("active");
    expect(convo.message_count).toBe(5);
  });

  it("should instantiate Lead entity", () => {
    const lead = new Lead();
    lead.id = "lead-uuid";
    lead.name = "John Doe";
    lead.email = "john@example.com";

    expect(lead.id).toBe("lead-uuid");
    expect(lead.name).toBe("John Doe");
    expect(lead.email).toBe("john@example.com");
  });

  it("should instantiate CrawledPage, BotDocument, and ShopifyStore entities", () => {
    const page = new CrawledPage();
    page.bot_public_key = "key-123";
    page.page_url = "https://example.com/about";

    const doc = new BotDocument();
    doc.public_key = "key-123";
    doc.content = "Sample doc content";

    const store = new ShopifyStore();
    store.shop = "my-store.myshopify.com";
    store.access_token = "shpat_xxx";

    expect(page.page_url).toBe("https://example.com/about");
    expect(doc.content).toBe("Sample doc content");
    expect(store.shop).toBe("my-store.myshopify.com");
  });
});
