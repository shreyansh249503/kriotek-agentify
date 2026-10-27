import {
  createChatTrace,
  recordFeedbackScore,
  getLangfuseClient,
  flushLangfuse,
} from "./langfuse";

jest.mock("langfuse", () => {
  const mockSpan = jest.fn();
  const mockGeneration = jest.fn();
  const mockTrace = jest.fn(() => ({
    span: mockSpan,
    generation: mockGeneration,
  }));
  const mockScore = jest.fn();
  const mockFlushAsync = jest.fn().mockResolvedValue(undefined);

  return {
    Langfuse: jest.fn().mockImplementation(() => ({
      trace: mockTrace,
      score: mockScore,
      flushAsync: mockFlushAsync,
    })),
  };
});

describe("Langfuse Observability Module", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("handles missing environment variables gracefully without throwing", () => {
    delete process.env.LANGFUSE_PUBLIC_KEY;
    delete process.env.LANGFUSE_SECRET_KEY;

    const traceHandle = createChatTrace({
      botId: "bot-123",
      storeDomain: "test-shop.myshopify.com",
      conversationId: "convo-123",
      userMessage: "Hello!",
    });

    expect(traceHandle.traceId).toBeDefined();
    expect(traceHandle.traceId).toContain("trace_convo-123_");
    expect(() => traceHandle.recordSpan("test_span")).not.toThrow();
    expect(() =>
      traceHandle.recordGeneration({
        name: "test_gen",
        model: "gemini-1.5-flash",
        input: "hi",
        output: "hello",
      }),
    ).not.toThrow();
  });

  it("records spans and generations when configured", () => {
    process.env.LANGFUSE_PUBLIC_KEY = "pk-test";
    process.env.LANGFUSE_SECRET_KEY = "sk-test";

    const traceHandle = createChatTrace({
      botId: "bot-123",
      botName: "Test Store AI",
      storeId: "store-456",
      storeDomain: "test-store.myshopify.com",
      conversationId: "convo-789",
      userMessage: "Looking for hoodies",
    });

    traceHandle.recordSpan("rag_retrieval", { query: "hoodies" }, { results: 3 });
    traceHandle.recordGeneration({
      name: "sales_response",
      model: "gemini-1.5-flash",
      input: [{ role: "user", content: "Looking for hoodies" }],
      output: "We have awesome hoodies!",
      usage: { promptTokens: 120, completionTokens: 40, totalTokens: 160 },
    });

    expect(traceHandle.traceId).toBeDefined();
  });

  it("records user feedback score and flushes", async () => {
    process.env.LANGFUSE_PUBLIC_KEY = "pk-test";
    process.env.LANGFUSE_SECRET_KEY = "sk-test";

    const success = await recordFeedbackScore({
      traceId: "trace-123",
      name: "user_feedback",
      value: 1,
      comment: "Very helpful response!",
    });

    expect(typeof success).toBe("boolean");
    await expect(flushLangfuse()).resolves.not.toThrow();
  });
});
