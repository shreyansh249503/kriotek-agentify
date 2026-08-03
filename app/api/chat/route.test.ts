import { TextEncoder, TextDecoder } from "util";
import { ReadableStream } from "stream/web";
import { POST, OPTIONS } from "./route";
import { getBotByPublicKey } from "../lib/bot";
import { retrieveWebsiteContext } from "../lib/rag";
import { sendOwnerNotification, sendUserEmail } from "../lib/sendEmail";
import { getDb } from "../lib/db";
import { runLeadAgent } from "../lib/agents/leadAgent";
import { runReceptionistAgent } from "../lib/agents/receptionistAgent";

if (typeof global.TextEncoder === "undefined") {
  global.TextEncoder = TextEncoder;
}
if (typeof global.TextDecoder === "undefined") {
  (global as unknown as Record<string, unknown>).TextDecoder = TextDecoder;
}
if (typeof global.ReadableStream === "undefined") {
  (global as unknown as Record<string, unknown>).ReadableStream = ReadableStream as unknown as typeof global.ReadableStream;
}

// Polyfill Request and Response for JSDOM if needed
if (typeof Request === "undefined") {
  (global as unknown as Record<string, unknown>).Request = class MockRequest {
    private body: unknown;
    constructor(_url: string, init?: { body?: string }) {
      this.body = init?.body ? JSON.parse(init.body) : {};
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

jest.mock("../lib/agents/leadAgent", () => ({
  runLeadAgent: jest.fn(),
}));

jest.mock("../lib/agents/receptionistAgent", () => ({
  runReceptionistAgent: jest.fn(),
}));

describe("Chat Route (/api/chat)", () => {
  const mockedGetBot = getBotByPublicKey as jest.Mock;
  const mockedGetDb = getDb as jest.Mock;
  const mockedRunLead = runLeadAgent as jest.Mock;
  const mockedRunReceptionist = runReceptionistAgent as jest.Mock;

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
  };

  beforeEach(() => {
    jest.clearAllMocks();

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

  const createRequest = (body: Record<string, unknown>) => {
    return new Request("http://localhost:3000/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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
      const req = createRequest({ message: "Hello" }); // Missing publicKey
      const res = await POST(req as unknown as Request);
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.error).toBe("publicKey and message are required");
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
      expect(mockUpdateConvo).toHaveBeenCalledWith("convo-123", {
        message_count: 3,
        messages: expect.stringContaining("Can I get help from human?"),
      });
    });

    it("should return 429 when receptionist agent fails with quota error", async () => {
      mockFindOneConvo.mockResolvedValueOnce(null); // New conversation
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
  });
});
