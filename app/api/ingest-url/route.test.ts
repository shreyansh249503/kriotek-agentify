import { POST } from "./route";
import { getUserFromRequest } from "../lib/auth";
import { crawlWebsite } from "../lib/crawler";
import { getDb } from "../lib/db";
import { ingestDocument } from "../lib/ingest";

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
    static json(data: unknown, init?: { status?: number }) {
      return {
        status: init?.status ?? 200,
        json: () => Promise.resolve(data),
      };
    }
  };
}

jest.mock("../lib/vector-db-setup", () => ({
  setupCollection: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("../lib/auth", () => ({
  getUserFromRequest: jest.fn(),
}));

jest.mock("../lib/crawler", () => ({
  crawlWebsite: jest.fn(),
}));

jest.mock("../lib/db", () => ({
  getDb: jest.fn(),
}));

jest.mock("../lib/ingest", () => ({
  ingestDocument: jest.fn().mockResolvedValue(undefined),
}));

describe("POST /api/ingest-url", () => {
  const mockedGetUser = getUserFromRequest as jest.Mock;
  const mockedCrawl = crawlWebsite as jest.Mock;
  const mockedGetDb = getDb as jest.Mock;

  const mockFindOne = jest.fn();
  const mockExists = jest.fn();
  const mockSave = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetDb.mockResolvedValue({
      getRepository: (entityName: string) => {
        if (entityName === "Bot") {
          return { findOne: mockFindOne, save: mockSave };
        }
        if (entityName === "CrawledPage") {
          return { exists: mockExists };
        }
        return {};
      },
    });
  });

  const createRequest = (body: Record<string, unknown>) => {
    return new Request("http://localhost:3000/api/ingest-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  };

  it("should return 401 Unauthorized if user session is invalid", async () => {
    mockedGetUser.mockResolvedValueOnce(null);

    const req = createRequest({ publicKey: "pk_123", url: "https://example.com" });
    const res = (await POST(req as unknown as Request)) as unknown as { status: number; json: () => Promise<Record<string, unknown>> };
    const data = await res.json();

    expect(res.status).toBe(401);
    expect(data.error).toBe("Unauthorized");
  });

  it("should return 400 Bad Request if publicKey or url is missing", async () => {
    mockedGetUser.mockResolvedValueOnce({ id: "user-1" });

    const req = createRequest({ publicKey: "pk_123" });
    const res = (await POST(req as unknown as Request)) as unknown as { status: number; json: () => Promise<Record<string, unknown>> };
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe("publicKey and url required");
  });

  it("should return 403 Forbidden if bot does not belong to the user", async () => {
    mockedGetUser.mockResolvedValueOnce({ id: "user-1" });
    mockFindOne.mockResolvedValueOnce(null);

    const req = createRequest({ publicKey: "pk_123", url: "https://example.com" });
    const res = (await POST(req as unknown as Request)) as unknown as { status: number; json: () => Promise<Record<string, unknown>> };
    const data = await res.json();

    expect(res.status).toBe(403);
    expect(data.error).toBe("Forbidden");
  });

  it("should return 200 with alreadyCrawled flag if URL has already been crawled", async () => {
    mockedGetUser.mockResolvedValueOnce({ id: "user-1" });
    mockFindOne.mockResolvedValueOnce({ id: "bot-1", public_key: "pk_123" });
    mockExists.mockResolvedValueOnce(true);

    const req = createRequest({ publicKey: "pk_123", url: "https://example.com" });
    const res = (await POST(req as unknown as Request)) as unknown as { status: number; json: () => Promise<Record<string, unknown>> };
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.alreadyCrawled).toBe(true);
  });

  it("should return 400 if crawler finds no readable text content", async () => {
    mockedGetUser.mockResolvedValueOnce({ id: "user-1" });
    mockFindOne.mockResolvedValueOnce({ id: "bot-1", public_key: "pk_123" });
    mockExists.mockResolvedValueOnce(false);
    mockedCrawl.mockResolvedValueOnce({ collectedText: "short", products: [] });

    const req = createRequest({ publicKey: "pk_123", url: "https://example.com" });
    const res = (await POST(req as unknown as Request)) as unknown as { status: number; json: () => Promise<Record<string, unknown>> };
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe("No readable content found on this page");
  });

  it("should successfully crawl, extract products, chunk, and ingest document content", async () => {
    mockedGetUser.mockResolvedValueOnce({ id: "user-1" });

    const mockBotObj = {
      id: "bot-1",
      public_key: "pk_123",
      ecommerce_products: [],
      ecommerce_enabled: false,
    };
    mockFindOne.mockResolvedValueOnce(mockBotObj);
    mockExists.mockResolvedValueOnce(false);

    const sampleLongText = "A".repeat(850);
    const newProduct = { name: "Test Product", price: "29.99", url: "https://example.com/p1", image: "" };
    mockedCrawl.mockResolvedValueOnce({
      collectedText: sampleLongText,
      products: [newProduct],
    });

    const req = createRequest({
      publicKey: "pk_123",
      url: "https://example.com",
      extractProducts: true,
    });
    const res = (await POST(req as unknown as Request)) as unknown as { status: number; json: () => Promise<Record<string, unknown>> };
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.chunksIngested).toBe(2);
    expect(data.productsExtractedCount).toBe(1);
    expect(mockSave).toHaveBeenCalledTimes(1);
    expect(ingestDocument).toHaveBeenCalledTimes(2);
  });

  it("should return 400 Bad Request if publicKey is missing", async () => {
    mockedGetUser.mockResolvedValueOnce({ id: "user-1" });

    const req = createRequest({ url: "https://example.com" });
    const res = (await POST(req as unknown as Request)) as unknown as { status: number; json: () => Promise<Record<string, unknown>> };
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe("publicKey and url required");
  });

  it("should deduplicate extracted products against existing bot products", async () => {
    mockedGetUser.mockResolvedValueOnce({ id: "user-1" });

    const existingProduct = { name: "Test Product", price: "29.99", url: "https://example.com/p1", image: "" };
    const mockBotObj = {
      id: "bot-1",
      public_key: "pk_123",
      ecommerce_products: [existingProduct],
      ecommerce_enabled: true,
    };
    mockFindOne.mockResolvedValueOnce(mockBotObj);
    mockExists.mockResolvedValueOnce(false);

    const sampleLongText = "B".repeat(300);
    const duplicateProduct = { name: "test product", price: "29.99", url: "https://example.com/p1", image: "" };
    const brandNewProduct = { name: "Another Product", price: "15.00", url: "https://example.com/p2", image: "" };

    mockedCrawl.mockResolvedValueOnce({
      collectedText: sampleLongText,
      products: [duplicateProduct, brandNewProduct],
    });

    const req = createRequest({
      publicKey: "pk_123",
      url: "https://example.com/shop",
      extractProducts: true,
    });
    const res = (await POST(req as unknown as Request)) as unknown as { status: number; json: () => Promise<Record<string, unknown>> };
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.productsExtractedCount).toBe(1);
    expect(mockBotObj.ecommerce_products).toHaveLength(2);
  });
});
