process.env.NEXT_PUBLIC_SUPABASE_URL = "https://supabase.example.com";
process.env.SUPABASE_SERVICE_ROLE_KEY = "test_service_key";

import { POST } from "./route";
import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { setupCollection } from "../../../lib/vector-db-setup";
import { getDb } from "../../../lib/db";
import { crawlWebsite } from "../../../lib/crawler";
import { chunkText } from "../../../lib/chunker";
import { ingestDocument } from "../../../lib/ingest";
import { verifySessionToken, getShopFromSession } from "../../lib/verifySessionToken";

jest.mock("@supabase/supabase-js", () => ({
  createClient: jest.fn(),
}));

jest.mock("ai", () => ({ generateObject: jest.fn() }));
jest.mock("@ai-sdk/google", () => ({ google: jest.fn() }));
jest.mock("cheerio", () => ({ load: jest.fn() }));

jest.mock("../../../lib/vector-db-setup");
jest.mock("../../../lib/db");
jest.mock("../../../lib/crawler");
jest.mock("../../../lib/chunker");
jest.mock("../../../lib/ingest");

jest.mock("../../lib/verifySessionToken", () => ({
  verifySessionToken: jest.fn(),
  getShopFromSession: jest.fn(),
}));

describe("API: /api/shopify/admin/ingest-url", () => {
  const mockSingle = jest.fn();
  const mockFrom = jest.fn();

  const mockBotRepo = { findOne: jest.fn() };
  const mockCrawledPageRepo = { exists: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {});
    jest.spyOn(console, "log").mockImplementation(() => {});

    (setupCollection as jest.Mock).mockResolvedValue(undefined);
    (createClient as jest.Mock).mockReturnValue({ from: mockFrom });
    (verifySessionToken as jest.Mock).mockReturnValue({ shop: "shop.myshopify.com" });
    (getShopFromSession as jest.Mock).mockReturnValue("shop.myshopify.com");

    mockFrom.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: mockSingle,
        }),
      }),
    });

    (getDb as jest.Mock).mockResolvedValue({
      getRepository: jest.fn().mockImplementation((entityName: string) => {
        if (entityName === "Bot") return mockBotRepo;
        if (entityName === "CrawledPage") return mockCrawledPageRepo;
        return {};
      }),
    });
  });

  it("should return 401 if session token verification fails", async () => {
    (verifySessionToken as jest.Mock).mockImplementationOnce(() => {
      throw new Error("Unauthorized");
    });

    const req = new NextRequest("http://localhost/api/shopify/admin/ingest-url", { method: "POST" });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(401);
    expect(data).toEqual({ error: "Unauthorized" });
  });

  it("should return 400 if no bot is linked to store", async () => {
    mockSingle.mockResolvedValueOnce({ data: null });

    const req = new NextRequest("http://localhost/api/shopify/admin/ingest-url", {
      method: "POST",
      headers: { authorization: "Bearer token" },
      body: JSON.stringify({ url: "https://example.com/about" }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data).toEqual({ error: "No bot linked to this store" });
  });

  it("should return 400 if url parameter is missing in request body", async () => {
    mockSingle.mockResolvedValueOnce({ data: { bot_id: "bot_123" } });

    const req = new NextRequest("http://localhost/api/shopify/admin/ingest-url", {
      method: "POST",
      headers: { authorization: "Bearer token" },
      body: JSON.stringify({}),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data).toEqual({ error: "url is required" });
  });

  it("should return alreadyCrawled message if URL is already in CrawledPage repository", async () => {
    mockSingle.mockResolvedValueOnce({ data: { bot_id: "bot_123" } });
    mockBotRepo.findOne.mockResolvedValueOnce({ id: "bot_123", public_key: "pk_123" });
    mockCrawledPageRepo.exists.mockResolvedValueOnce(true);

    const req = new NextRequest("http://localhost/api/shopify/admin/ingest-url", {
      method: "POST",
      headers: { authorization: "Bearer token" },
      body: JSON.stringify({ url: "https://example.com/about" }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toEqual({
      alreadyCrawled: true,
      message: "This URL has already been crawled",
    });
  });

  it("should crawl, chunk, and ingest document when page has sufficient content", async () => {
    mockSingle.mockResolvedValueOnce({ data: { bot_id: "bot_123" } });
    mockBotRepo.findOne.mockResolvedValueOnce({ id: "bot_123", public_key: "pk_123" });
    mockCrawledPageRepo.exists.mockResolvedValueOnce(false);

    const fullContent = "A".repeat(300);
    (crawlWebsite as jest.Mock).mockResolvedValueOnce({ collectedText: fullContent });
    (chunkText as jest.Mock).mockReturnValue(["chunk_1", "chunk_2"]);
    (ingestDocument as jest.Mock).mockResolvedValue(undefined);

    const req = new NextRequest("http://localhost/api/shopify/admin/ingest-url", {
      method: "POST",
      headers: { authorization: "Bearer token" },
      body: JSON.stringify({ url: "https://example.com/faq" }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(crawlWebsite).toHaveBeenCalledWith("https://example.com/faq", "pk_123", 40, false);
    expect(ingestDocument).toHaveBeenCalledTimes(2);
    expect(data).toEqual({
      success: true,
      chunksIngested: 2,
    });
  });
});
