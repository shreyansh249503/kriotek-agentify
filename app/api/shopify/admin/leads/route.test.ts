process.env.NEXT_PUBLIC_SUPABASE_URL = "https://supabase.example.com";
process.env.SUPABASE_SERVICE_ROLE_KEY = "test_service_key";

import { GET } from "./route";
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

describe("API: /api/shopify/admin/leads", () => {
  const mockSingle = jest.fn();
  const mockOrder = jest.fn();
  const mockEq = jest.fn();
  const mockSelect = jest.fn();
  const mockFrom = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {});

    mockEq.mockImplementation(() => ({
      single: mockSingle,
      order: mockOrder,
      eq: mockEq,
    }));

    mockSelect.mockImplementation(() => ({
      eq: mockEq,
    }));

    mockFrom.mockImplementation((table: string) => {
      if (table === "shopify_stores") {
        return { select: mockSelect, eq: mockEq };
      }
      if (table === "leads") {
        return { select: mockSelect, eq: mockEq };
      }
      return {};
    });

    (createClient as jest.Mock).mockReturnValue({ from: mockFrom });
    (verifySessionToken as jest.Mock).mockReturnValue({ shop: "shop.myshopify.com" });
    (getShopFromSession as jest.Mock).mockReturnValue("shop.myshopify.com");
  });

  it("should return 401 if session token verification fails", async () => {
    (verifySessionToken as jest.Mock).mockImplementationOnce(() => {
      throw new Error("Unauthorized");
    });

    const req = new NextRequest("http://localhost/api/shopify/admin/leads");
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(401);
    expect(data).toEqual({ error: "Unauthorized" });
  });

  it("should return empty leads list if store is not linked to a bot_id", async () => {
    mockSingle.mockResolvedValueOnce({ data: null });

    const req = new NextRequest("http://localhost/api/shopify/admin/leads", {
      headers: { authorization: "Bearer valid_token" },
    });
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toEqual({ leads: [] });
  });

  it("should return list of leads for the store's bot_id", async () => {
    const mockLeads = [
      { id: "l1", name: "Alice", email: "alice@example.com" },
      { id: "l2", name: "Bob", email: "bob@example.com" },
    ];

    mockSingle.mockResolvedValueOnce({ data: { bot_id: "bot_123" } });
    mockOrder.mockResolvedValueOnce({ data: mockLeads, error: null });

    const req = new NextRequest("http://localhost/api/shopify/admin/leads", {
      headers: { authorization: "Bearer valid_token" },
    });
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toEqual({ leads: mockLeads });
  });

  it("should return 500 when Supabase query returns an error", async () => {
    mockSingle.mockResolvedValueOnce({ data: { bot_id: "bot_123" } });
    mockOrder.mockResolvedValueOnce({ data: null, error: new Error("DB Error") });

    const req = new NextRequest("http://localhost/api/shopify/admin/leads", {
      headers: { authorization: "Bearer valid_token" },
    });
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data).toEqual({ error: "Failed to fetch leads" });
  });
});
