import { TextEncoder, TextDecoder } from "util";
import { ReadableStream } from "stream/web";
import {
  POST,
  OPTIONS,
  MAX_HISTORY_MESSAGES,
  MAX_MESSAGE_LENGTH,
  ESTIMATED_SYSTEM_PROMPT_TOKENS,
  trimHistoryForModel,
} from "./route";
import { getBotByPublicKey } from "../lib/bot";
import { sendOwnerNotification, sendUserEmail } from "../lib/sendEmail";
import { getDb } from "../lib/db";
import { runLeadAgent, runReceptionistAgent, classifyUserIntent } from "../lib/agents";
import { checkRateLimit } from "../lib/rateLimit";
import { verifyOrigin } from "../lib/originGuard";
import { checkBotBudget, recordBotTokenUsage } from "../lib/tokenBudget";
import { UsageAccumulator } from "../lib/usage";
import { appendMessages } from "../lib/conversations";

if (typeof global.TextEncoder === "undefined") {
  global.TextEncoder = TextEncoder;
}
if (typeof global.TextDecoder === "undefined") {
  (global as unknown as Record<string, unknown>).TextDecoder = TextDecoder;
}
if (typeof global.ReadableStream === "undefined") {
  (global as unknown as Record<string, unknown>).ReadableStream = ReadableStream as unknown as typeof global.ReadableStream;
}

if (typeof Request === "undefined") {
  (global as unknown as Record<string, unknown>).Request = class MockRequest {
    private body: unknown;
    headers: Map<string, string>;
    constructor(_url: string, init?: { body?: string; headers?: Record<string, string> }) {
      this.body = init?.body ? JSON.parse(init.body) : {};
      this.headers = new Map(Object.entries(init?.headers || {}));
    }
    json() {
      return Promise.resolve(this.body);
    }
  };
}

if (typeof Response === "undefined" || !Response.json) {
  (global as unknown as Record<string, unknown>).Response = class MockResponse {
    status: number;
    headers: Map<string, string>;
    body: unknown;

    constructor(body: unknown, init?: { status?: number; headers?: Record<string, string> }) {
      this.body = body;
      this.status = init?.status ?? 200;
      this.headers = new Map(Object.entries(init?.headers || {}));
    }

    static json(data: unknown, init?: { status?: number; headers?: Record<string, string> }) {
      return new MockResponse(JSON.stringify(data), init);
    }

    json() {
      return Promise.resolve(typeof this.body === "string" ? JSON.parse(this.body) : this.body);
    }

    text() {
      return Promise.resolve(String(this.body));
    }
  };
}

// The real package starts a dynamic import on load, which Jest rejects. No keys are set, so no client is built.
jest.mock("langfuse", () => ({
  Langfuse: jest.fn(),
}));

jest.mock("../lib/conversations", () => ({
  ...jest.requireActual("../lib/conversations"),
  appendMessages: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("../lib/bot", () => ({
  getBotByPublicKey: jest.fn(),
}));

jest.mock("../lib/rag", () => ({
  retrieveWebsiteContext: jest.fn().mockResolvedValue("Website context text"),
}));

jest.mock("../lib/sendEmail", () => ({
  sendOwnerNotification: jest.fn().mockResolvedValue(undefined),
  sendUserEmail: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("../lib/db", () => ({
  getDb: jest.fn(),
}));

jest.mock("../lib/emailTemplates", () => ({
  generateUserConfirmationTemplate: jest.fn().mockReturnValue("<p>Confirmation</p>"),
}));

jest.mock("../lib/agents", () => ({
  runLeadAgent: jest.fn(),
  runReceptionistAgent: jest.fn(),
  runSalesAgent: jest.fn(),
  classifyUserIntent: jest.fn().mockResolvedValue({
    primaryIntent: "GENERAL",
    confidence: 0.9,
    rationale: "Mock general query",
    suggestedRouting: "RECEPTIONIST",
  }),
}));

jest.mock("../lib/rateLimit", () => ({
  checkRateLimit: jest.fn(),
}));

jest.mock("../lib/originGuard", () => ({
  verifyOrigin: jest.fn(),
}));

jest.mock("../lib/tokenBudget", () => ({
  checkBotBudget: jest.fn(),
  estimateTokens: jest.fn(() => 10),
  recordBotTokenUsage: jest.fn().mockResolvedValue(undefined),
}));

describe("Chat Route (/api/chat)", () => {
  const mockedGetBot = getBotByPublicKey as jest.Mock;
  const mockedGetDb = getDb as jest.Mock;
  const mockedRunLead = runLeadAgent as jest.Mock;
  const mockedRunReceptionist = runReceptionistAgent as jest.Mock;
  const mockedCheckRateLimit = checkRateLimit as jest.Mock;
  const mockedVerifyOrigin = verifyOrigin as jest.Mock;
  const mockedCheckBotBudget = checkBotBudget as jest.Mock;

  const mockFindOneConvo = jest.fn();
  const mockCreateConvo = jest.fn((data) => data);
  const mockSaveConvo = jest.fn().mockResolvedValue(undefined);
  const mockUpdateConvo = jest.fn().mockResolvedValue(undefined);

  const mockFindOneShopify = jest.fn().mockResolvedValue(null);
  const mockCreateLead = jest.fn((data) => data);
  const mockSaveLead = jest.fn().mockResolvedValue(undefined);

  const mockBot = {
    id: "bot-123",
    name: "Support Assistant",
    description: "Bot description",
    contact_enabled: true,
    contact_prompt: "Please state your name and email",
    contact_email: "owner@example.com",
    contact_email_message: "Thanks for contacting us",
    allowed_origins: [],
    monthly_token_budget: 500000,
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockedCheckRateLimit.mockResolvedValue({
      success: true,
      limit: 20,
      remaining: 19,
      reset: Math.ceil(Date.now() / 1000) + 60,
      retryAfter: 0,
      headers: {
        "X-RateLimit-Limit": "20",
        "X-RateLimit-Remaining": "19",
      },
    });

    mockedCheckBotBudget.mockResolvedValue({
      allowed: true,
      currentTokens: 1000,
      budgetLimit: 500000,
      percentageUsed: 0.2,
      reason: "within_budget",
    });

    mockedVerifyOrigin.mockReturnValue({
      allowed: true,
      reason: "dev_allowed_domain",
    });

    mockedGetBot.mockResolvedValue(mockBot);

    mockedGetDb.mockResolvedValue({
      getRepository: (entityName: string) => {
        if (entityName === "Conversation") {
          return {
            findOne: mockFindOneConvo,
            create: mockCreateConvo,
            save: mockSaveConvo,
            update: mockUpdateConvo,
          };
        }
        if (entityName === "ShopifyStore") {
          return {
            findOne: mockFindOneShopify,
          };
        }
        if (entityName === "Lead") {
          return {
            create: mockCreateLead,
            save: mockSaveLead,
          };
        }
        return {};
      },
    });
  });

  afterEach(async () => {
    // Each POST saves the reply in the background; let it finish so it can't leak into the next test.
    await new Promise((resolve) => setTimeout(resolve, 20));
  });

  const createRequest = (body: Record<string, unknown>, headers?: Record<string, string>) => {
    return new Request("http://localhost:3000/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      body: JSON.stringify(body),
    });
  };

  describe("OPTIONS /api/chat", () => {
    it("should return 204 status with CORS headers", async () => {
      const res = await OPTIONS();
      expect(res.status).toBe(204);
      expect(res.headers.get("Access-Control-Allow-Origin")).toBe("*");
    });
  });

  describe("POST /api/chat", () => {
    it("should return 400 Bad Request if publicKey or message is missing", async () => {
      const req = createRequest({ message: "Hello" });
      const res = await POST(req as unknown as Request);
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.error).toBe("publicKey and message are required");
    });

    it("should return 400 with CORS headers when the body is not valid JSON", async () => {
      const req = {
        headers: new Map<string, string>(),
        json: () => Promise.reject(new SyntaxError("Unexpected token")),
      };

      const res = await POST(req as unknown as Request);
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.error).toBe("publicKey and message are required");
      expect(res.headers.get("Access-Control-Allow-Origin")).toBe("*");
      expect(mockedCheckRateLimit).not.toHaveBeenCalled();
    });

    it("should return 400 when the message is only whitespace", async () => {
      const res = await POST(createRequest({ publicKey: "pk_123", message: "   " }) as unknown as Request);
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.error).toBe("publicKey and message are required");
    });

    it("should return 400 when the message is not a string", async () => {
      const res = await POST(createRequest({ publicKey: "pk_123", message: { text: "hi" } }) as unknown as Request);

      expect(res.status).toBe(400);
    });

    it("should return 400 when the message is too long", async () => {
      const res = await POST(
        createRequest({ publicKey: "pk_123", message: "a".repeat(MAX_MESSAGE_LENGTH + 1) }) as unknown as Request,
      );
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.error).toBe(`message must be at most ${MAX_MESSAGE_LENGTH} characters`);
      expect(mockedGetBot).not.toHaveBeenCalled();
    });

    it("should return 404 with CORS headers for an unknown bot", async () => {
      mockedGetBot.mockResolvedValueOnce(null);

      const res = await POST(createRequest({ publicKey: "pk_missing", message: "Hello" }) as unknown as Request);
      const data = await res.json();

      expect(res.status).toBe(404);
      expect(data.error).toBe("Bot not found");
      expect(res.headers.get("Access-Control-Allow-Origin")).toBe("*");
      expect(mockedCheckBotBudget).not.toHaveBeenCalled();
    });

    it("should return 429 when rate limit check fails", async () => {
      mockedCheckRateLimit.mockResolvedValueOnce({
        success: false,
        reason: "ip_limit_exceeded",
        limit: 20,
        remaining: 0,
        reset: Math.ceil(Date.now() / 1000) + 30,
        retryAfter: 30,
        headers: {
          "X-RateLimit-Limit": "20",
          "X-RateLimit-Remaining": "0",
          "Retry-After": "30",
        },
      });

      const req = createRequest({
        publicKey: "pk_123",
        message: "Spam message",
      });

      const res = await POST(req as unknown as Request);
      const data = await res.json();

      expect(res.status).toBe(429);
      expect(data.error).toContain("Rate limit exceeded");
      expect(data.reason).toBe("ip_limit_exceeded");
      expect(res.headers.get("Retry-After")).toBe("30");
    });

    it("should return 429 when monthly token budget is exceeded", async () => {
      mockedCheckBotBudget.mockResolvedValueOnce({
        allowed: false,
        currentTokens: 500000,
        budgetLimit: 500000,
        percentageUsed: 100,
        reason: "budget_exceeded",
      });

      const req = createRequest({
        publicKey: "pk_123",
        message: "Hello assistant",
      });

      const res = await POST(req as unknown as Request);
      const data = await res.json();

      expect(res.status).toBe(429);
      expect(data.error).toContain("monthly quota has been reached");
      expect(data.reason).toBe("budget_exceeded");
    });

    it("should return 403 when origin is unauthorized", async () => {
      mockedVerifyOrigin.mockReturnValueOnce({
        allowed: false,
        reason: "origin_not_whitelisted",
        requestOrigin: "https://unauthorized-domain.com",
      });

      const req = createRequest({
        publicKey: "pk_123",
        message: "Hello from unauthorized site",
      });

      const res = await POST(req as unknown as Request);
      const data = await res.json();

      expect(res.status).toBe(403);
      expect(data.error).toContain("Forbidden");
      expect(data.reason).toBe("origin_not_whitelisted");
    });

    it("should handle manual support state conversation", async () => {
      mockFindOneConvo.mockResolvedValueOnce({
        id: "convo-123",
        bot_id: "bot-123",
        state: "manual",
        message_count: 2,
        messages: JSON.stringify([{ role: "user", content: "Previous msg" }]),
      });

      const req = createRequest({
        publicKey: "pk_123",
        message: "Can I get help from human?",
        conversationId: "12345678-1234-4234-8234-1234567890ab",
      });

      const res = await POST(req as unknown as Request);
      const text = await res.text();

      expect(res.status).toBe(200);
      expect(text).toBe("Message sent to customer support.");
      expect(appendMessages).toHaveBeenCalledWith("convo-123", [
        { role: "user", content: "Can I get help from human?" },
      ]);
      expect(mockUpdateConvo).not.toHaveBeenCalledWith("convo-123", expect.objectContaining({ messages: expect.anything() }));
    });

    it("should return 429 when receptionist agent fails with quota error", async () => {
      mockFindOneConvo.mockResolvedValueOnce(null);
      mockedRunLead.mockResolvedValueOnce({
        collectedInfo: {},
        missingFields: ["name", "email"],
        isComplete: false,
      });

      mockedRunReceptionist.mockImplementationOnce(() => {
        const err = new Error("quota exceeded") as Error & { statusCode?: number };
        err.statusCode = 429;
        throw err;
      });

      const req = createRequest({
        publicKey: "pk_123",
        message: "What products do you offer?",
      });

      const res = await POST(req as unknown as Request);
      const text = await res.text();

      expect(res.status).toBe(429);
      expect(text).toBe("Your free tier of the day is over. Please try again later.");
    });

    it("should fire lead completion pipeline and stream receptionist response", async () => {
      mockFindOneConvo.mockResolvedValueOnce({
        id: "convo-999",
        bot_id: "bot-123",
        state: "idle",
        message_count: 1,
        messages: "[]",
      });

      mockedRunLead.mockResolvedValueOnce({
        collectedInfo: { name: "John Doe", email: "john@example.com", phone: "1234567890" },
        missingFields: [],
        isComplete: true,
      });

      async function* mockStream() {
        yield { type: "text-delta", text: "Hello! How can I help " };
        yield { type: "text-delta", text: "you today?" };
      }

      mockedRunReceptionist.mockReturnValueOnce({
        fullStream: mockStream(),
      });

      const req = createRequest({
        publicKey: "pk_123",
        message: "My name is John Doe, email john@example.com",
        conversationId: "12345678-1234-4234-8234-1234567890ab",
      });

      const res = await POST(req as unknown as Request);

      expect(res.status).toBe(200);
      expect(mockSaveLead).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "John Doe",
          email: "john@example.com",
        })
      );
      expect(sendUserEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: "john@example.com",
        })
      );
      expect(sendOwnerNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          ownerEmail: "owner@example.com",
        })
      );
    });

    async function* emptyStream() {}

    it("should tell the intent classifier the real Shopify connection state", async () => {
      mockFindOneConvo.mockResolvedValue(null);
      mockedRunLead.mockResolvedValue({ collectedInfo: {}, missingFields: ["name", "email"], isComplete: false });
      mockedRunReceptionist.mockImplementation(() => ({ fullStream: emptyStream() }));

      await POST(createRequest({ publicKey: "pk_123", message: "Where is order #1042?" }) as unknown as Request);
      expect(classifyUserIntent).toHaveBeenLastCalledWith(
        expect.any(Array),
        expect.objectContaining({ shopifyConnected: false }),
        expect.any(UsageAccumulator),
      );

      mockFindOneShopify.mockResolvedValueOnce({ id: "store-1", shop: "demo.myshopify.com", bot_id: "bot-123" });
      await POST(createRequest({ publicKey: "pk_123", message: "Where is order #1042?" }) as unknown as Request);
      expect(classifyUserIntent).toHaveBeenLastCalledWith(
        expect.any(Array),
        expect.objectContaining({ shopifyConnected: true }),
        expect.any(UsageAccumulator),
      );
    });

    describe("token accounting", () => {
      const mockedRecordUsage = recordBotTokenUsage as jest.Mock;

      async function* replyStream() {
        yield { type: "text-delta", text: "Hello there" };
      }

      async function waitForUsageRecord() {
        for (let i = 0; i < 50 && mockedRecordUsage.mock.calls.length === 0; i++) {
          await new Promise((resolve) => setTimeout(resolve, 0));
        }
      }

      beforeEach(() => {
        mockFindOneConvo.mockResolvedValue(null);
        mockedRunLead.mockImplementation(
          async (_messages: unknown, _prompt: unknown, _known: unknown, usage: UsageAccumulator) => {
            usage.add({ inputTokens: 40, outputTokens: 10, totalTokens: 50 });
            return { collectedInfo: {}, missingFields: ["name", "email"], isComplete: false };
          },
        );
      });

      it("records the reply's total usage plus the helper calls, once per message", async () => {
        mockedRunReceptionist.mockReturnValueOnce({
          fullStream: replyStream(),
          totalUsage: Promise.resolve({ inputTokens: 900, outputTokens: 100, totalTokens: 1000 }),
        });

        await POST(createRequest({ publicKey: "pk_123", message: "Hi" }) as unknown as Request);
        await waitForUsageRecord();

        expect(mockedRecordUsage).toHaveBeenCalledTimes(1);
        expect(mockedRecordUsage).toHaveBeenCalledWith("bot-123", {
          inputTokens: 940,
          outputTokens: 110,
          totalTokens: 1050,
          messageCount: 1,
        });
      });

      it("records an estimate including the system prompt when usage is missing", async () => {
        const warnSpy = jest.spyOn(console, "warn").mockImplementationOnce(() => {});
        mockedRunReceptionist.mockReturnValueOnce({
          fullStream: replyStream(),
          totalUsage: Promise.reject(new Error("no usage")),
        });

        await POST(createRequest({ publicKey: "pk_123", message: "Hi" }) as unknown as Request);
        await waitForUsageRecord();

        // estimateTokens is mocked to 10 per text.
        expect(mockedRecordUsage).toHaveBeenCalledWith("bot-123", {
          inputTokens: ESTIMATED_SYSTEM_PROMPT_TOKENS + 10 + 40,
          outputTokens: 10 + 10,
          totalTokens: ESTIMATED_SYSTEM_PROMPT_TOKENS + 10 + 10 + 50,
          messageCount: 1,
        });
        expect(warnSpy).toHaveBeenCalled();
      });

      it("still records helper usage when the reply fails to start", async () => {
        mockedRunReceptionist.mockImplementationOnce(() => {
          throw new Error("model unavailable");
        });

        const res = await POST(createRequest({ publicKey: "pk_123", message: "Hi" }) as unknown as Request);

        expect(res.status).toBe(500);
        expect(mockedRecordUsage).toHaveBeenCalledWith(
          "bot-123",
          expect.objectContaining({ inputTokens: 40, outputTokens: 10, totalTokens: 50, messageCount: 0 }),
        );
      });
    });

    it("should return 503 when the budget check could not run", async () => {
      mockedCheckBotBudget.mockResolvedValueOnce({
        allowed: false,
        currentTokens: 0,
        budgetLimit: 500000,
        percentageUsed: 0,
        reason: "check_failed",
      });

      const res = await POST(createRequest({ publicKey: "pk_123", message: "Hi" }) as unknown as Request);
      const data = await res.json();

      expect(res.status).toBe(503);
      expect(data.reason).toBe("budget_check_failed");
      expect(res.headers.get("Access-Control-Allow-Origin")).toBe("*");
      expect(mockedRunReceptionist).not.toHaveBeenCalled();
    });

    it("should keep an agent's reply sent while the AI reply is streaming", async () => {
      // Stand-in for the database row: appendMessages adds to it, as the SQL does.
      const stored = [{ role: "user", content: "earlier question" }];
      (appendMessages as jest.Mock).mockImplementation(async (_id: string, msgs: unknown[]) => {
        stored.push(...(msgs as typeof stored));
      });
      mockFindOneConvo.mockResolvedValueOnce({
        id: "convo-race",
        bot_id: "bot-123",
        state: "idle",
        message_count: 1,
        messages: JSON.stringify(stored),
      });
      mockedRunLead.mockResolvedValueOnce({ collectedInfo: {}, missingFields: ["name", "email"], isComplete: false });

      async function* streamWithTakeover() {
        yield { type: "text-delta", text: "Let me check" };
        // The agent replies (via the admin route) before the AI reply is saved.
        await appendMessages("convo-race", [{ role: "assistant", sender: "human", content: "Agent here" }]);
        yield { type: "text-delta", text: " that for you." };
      }
      mockedRunReceptionist.mockReturnValueOnce({
        fullStream: streamWithTakeover(),
        totalUsage: Promise.resolve({ inputTokens: 1, outputTokens: 1, totalTokens: 2 }),
      });

      await POST(
        createRequest({
          publicKey: "pk_123",
          message: "new question",
          conversationId: "12345678-1234-4234-8234-1234567890ab",
        }) as unknown as Request,
      );
      await new Promise((resolve) => setTimeout(resolve, 20));

      expect(stored).toEqual([
        { role: "user", content: "earlier question" },
        { role: "user", content: "new question" },
        { role: "assistant", sender: "human", content: "Agent here" },
        { role: "assistant", content: "Let me check that for you." },
      ]);
      (appendMessages as jest.Mock).mockReset().mockResolvedValue(undefined);
    });

    it("should send only recent history to the model but save the full history", async () => {
      const history = Array.from({ length: 30 }, (_, i) => ({
        role: i % 2 === 0 ? "user" : "assistant",
        content: `message ${i}`,
      }));
      mockFindOneConvo.mockResolvedValueOnce({
        id: "convo-long",
        bot_id: "bot-123",
        state: "idle",
        message_count: 30,
        messages: JSON.stringify(history),
      });
      mockedRunLead.mockResolvedValueOnce({ collectedInfo: {}, missingFields: ["name", "email"], isComplete: false });
      mockedRunReceptionist.mockReturnValueOnce({ fullStream: emptyStream() });

      await POST(
        createRequest({
          publicKey: "pk_123",
          message: "latest question",
          conversationId: "12345678-1234-4234-8234-1234567890ab",
        }) as unknown as Request,
      );

      const sentMessages = mockedRunReceptionist.mock.calls[0][0].messages;
      expect(sentMessages.length).toBeLessThanOrEqual(MAX_HISTORY_MESSAGES);
      expect(sentMessages[0].role).toBe("user");
      expect(sentMessages[sentMessages.length - 1]).toEqual({ role: "user", content: "latest question" });

      // Only the new message is appended; the stored history is never rewritten.
      expect(appendMessages).toHaveBeenCalledWith("convo-long", [{ role: "user", content: "latest question" }]);
    });
  });
});

describe("trimHistoryForModel", () => {
  it("keeps short histories unchanged", () => {
    const messages = [
      { role: "user" as const, content: "hi" },
      { role: "assistant" as const, content: "hello" },
      { role: "user" as const, content: "help" },
    ];
    expect(trimHistoryForModel(messages)).toEqual(messages);
  });

  it("drops leading assistant turns left after slicing", () => {
    const messages = Array.from({ length: MAX_HISTORY_MESSAGES + 1 }, (_, i) => ({
      role: (i % 2 === 0 ? "user" : "assistant") as "user" | "assistant",
      content: `m${i}`,
    }));

    const trimmed = trimHistoryForModel(messages);

    expect(trimmed[0].role).toBe("user");
    expect(trimmed.length).toBeLessThanOrEqual(MAX_HISTORY_MESSAGES);
    expect(trimmed[trimmed.length - 1]).toEqual(messages[messages.length - 1]);
  });
});
