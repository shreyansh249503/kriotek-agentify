process.env.NEXT_PUBLIC_SUPABASE_URL = "https://supabase.example.com";
process.env.SUPABASE_SERVICE_ROLE_KEY = "test_service_key";

import { GET, PATCH } from "./route";
import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifySessionToken, getShopFromSession } from "../../lib/verifySessionToken";

jest.mock("@supabase/supabase-js", () => ({
  createClient: jest.fn(),
}));

jest.mock("../../lib/verifySessionToken", () => ({
  verifySessionToken: jest.fn(),
  getShopFromSession: jest.fn(),
}));

describe("API: /api/shopify/admin/bot", () => {
  const mockSingle = jest.fn();
  const mockUpdate = jest.fn();
  const mockEq = jest.fn();
  const mockSelect = jest.fn(() => ({ eq: mockEq }));
  const mockFrom = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {});

    mockEq.mockImplementation(() => ({
      single: mockSingle,
      eq: mockEq,
      select: mockSelect,
    }));

    mockUpdate.mockReturnValue({
      eq: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: mockSingle,
        }),
      }),
    });

    mockFrom.mockImplementation((table: string) => {
      if (table === "shopify_stores") {
        return { select: mockSelect, eq: mockEq };
      }
      if (table === "bots") {
        return { select: mockSelect, update: mockUpdate, eq: mockEq };
      }
      if (table === "crawled_pages") {
        return { select: mockSelect, eq: mockEq };
      }
      return {};
    });

    (createClient as jest.Mock).mockReturnValue({ from: mockFrom });
    (verifySessionToken as jest.Mock).mockReturnValue({ shop: "shop.myshopify.com" });
    (getShopFromSession as jest.Mock).mockReturnValue("shop.myshopify.com");
  });

  describe("GET", () => {
    it("should return 401 if token verification fails", async () => {
      (verifySessionToken as jest.Mock).mockImplementationOnce(() => {
        throw new Error("Invalid token");
      });

      const req = new NextRequest("http://localhost/api/shopify/admin/bot");
      const res = await GET(req);
      const data = await res.json();

      expect(res.status).toBe(401);
      expect(data).toEqual({ error: "Unauthorized" });
    });

    it("should return empty payload if no bot_id is linked to the store", async () => {
      mockSingle.mockResolvedValueOnce({ data: null });

      const req = new NextRequest("http://localhost/api/shopify/admin/bot", {
        headers: { authorization: "Bearer valid_token" },
      });
      const res = await GET(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data).toEqual({ bot: null, crawled_pages: [] });
    });

    it("should return 404 if bot_id exists but bot record is not found in bots table", async () => {
      mockSingle
        .mockResolvedValueOnce({ data: { bot_id: "bot_123" } })
        .mockResolvedValueOnce({ data: null, error: new Error("Bot not found") });

      const req = new NextRequest("http://localhost/api/shopify/admin/bot", {
        headers: { authorization: "Bearer valid_token" },
      });
      const res = await GET(req);
      const data = await res.json();

      expect(res.status).toBe(404);
      expect(data).toEqual({ error: "Bot not found" });
    });

    it("should return bot details and crawled_pages when bot exists", async () => {
      const mockBot = { id: "bot_123", name: "Shopify Assistant", public_key: "pk_123" };
      const mockPages = [{ id: "p1", page_url: "https://shop.myshopify.com/about" }];

      mockSingle
        .mockResolvedValueOnce({ data: { bot_id: "bot_123" } }) 
        .mockResolvedValueOnce({ data: mockBot });

      mockEq.mockImplementationOnce(() => ({ single: mockSingle }))
        .mockImplementationOnce(() => ({ single: mockSingle }))
        .mockImplementationOnce(() => Promise.resolve({ data: mockPages }));

      const req = new NextRequest("http://localhost/api/shopify/admin/bot", {
        headers: { authorization: "Bearer valid_token" },
      });
      const res = await GET(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.bot).toEqual(mockBot);
    });
  });

  describe("PATCH", () => {
    it("should return 401 if token verification fails", async () => {
      (verifySessionToken as jest.Mock).mockImplementationOnce(() => {
        throw new Error("Invalid token");
      });

      const req = new NextRequest("http://localhost/api/shopify/admin/bot", {
        method: "PATCH",
        body: JSON.stringify({ id: "bot_123", name: "Updated Bot" }),
      });
      const res = await PATCH(req);
      const data = await res.json();

      expect(res.status).toBe(401);
      expect(data).toEqual({ error: "Unauthorized" });
    });

    it("should return 403 if store bot_id does not match payload bot id", async () => {
      mockSingle.mockResolvedValueOnce({ data: { bot_id: "bot_123" } });

      const req = new NextRequest("http://localhost/api/shopify/admin/bot", {
        method: "PATCH",
        headers: { authorization: "Bearer valid_token" },
        body: JSON.stringify({ id: "other_bot_id", name: "Hacked Bot" }),
      });
      const res = await PATCH(req);
      const data = await res.json();

      expect(res.status).toBe(403);
      expect(data).toEqual({ error: "Forbidden" });
    });

    it("should update bot properties and return updated bot", async () => {
      const updatedBot = { id: "bot_123", name: "Updated Shopify Bot", tone: "friendly" };

      mockSingle
        .mockResolvedValueOnce({ data: { bot_id: "bot_123" } }) 
        .mockResolvedValueOnce({ data: updatedBot }); 

      const req = new NextRequest("http://localhost/api/shopify/admin/bot", {
        method: "PATCH",
        headers: { authorization: "Bearer valid_token" },
        body: JSON.stringify({ id: "bot_123", name: "Updated Shopify Bot", tone: "friendly" }),
      });
      const res = await PATCH(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data).toEqual({ success: true, bot: updatedBot });
    });
  });
});
