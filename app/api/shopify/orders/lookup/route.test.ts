process.env.NEXT_PUBLIC_SUPABASE_URL = "https://supabase.example.com";
process.env.SUPABASE_SERVICE_ROLE_KEY = "test_service_key";

import { POST } from "./route";
import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { lookupShopifyOrder } from "@/lib/shopify/orderLookup";

jest.mock("@supabase/supabase-js", () => ({ createClient: jest.fn() }));
jest.mock("@/lib/shopify/orderLookup", () => ({ lookupShopifyOrder: jest.fn() }));

function request(body: unknown) {
  return new NextRequest("http://localhost/api/shopify/orders/lookup", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

describe("API: /api/shopify/orders/lookup", () => {
  const mockSingle = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {});
    const chain = { eq: jest.fn(() => ({ single: mockSingle })) };
    (createClient as jest.Mock).mockReturnValue({
      from: jest.fn(() => ({ select: jest.fn(() => chain) })),
    });
  });

  it("returns 400 if order_number is missing", async () => {
    const res = await POST(request({ public_key: "pk" }));
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "Order number is required." });
  });

  it("returns 400 if public_key is missing (bot_id alone is not accepted)", async () => {
    const res = await POST(request({ bot_id: "bot_123", order_number: "1001" }));
    expect(res.status).toBe(400);
    expect(lookupShopifyOrder).not.toHaveBeenCalled();
  });

  it("returns 404 for an unknown public key", async () => {
    mockSingle.mockResolvedValueOnce({ data: null });
    const res = await POST(request({ public_key: "pk_x", order_number: "1001" }));
    expect(res.status).toBe(404);
  });

  it("passes the resolved bot and contact details to the shared lookup", async () => {
    mockSingle.mockResolvedValueOnce({ data: { id: "bot_resolved" } });
    (lookupShopifyOrder as jest.Mock).mockResolvedValueOnce({
      ok: true,
      journey: { orderNumber: "#1001" },
    });

    const res = await POST(
      request({ public_key: "pk", order_number: "1001", email: "buyer@example.com" }),
    );

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, journey: { orderNumber: "#1001" } });
    expect(lookupShopifyOrder).toHaveBeenCalledWith({
      botId: "bot_resolved",
      orderNumber: "1001",
      email: "buyer@example.com",
      phone: undefined,
    });
  });

  it("returns 400 when no email or phone is given", async () => {
    mockSingle.mockResolvedValueOnce({ data: { id: "bot_1" } });
    (lookupShopifyOrder as jest.Mock).mockResolvedValueOnce({
      ok: false,
      code: "verification_required",
      message: "need contact",
    });
    const res = await POST(request({ public_key: "pk", order_number: "1001" }));
    expect(res.status).toBe(400);
  });

  it("returns 404 (not 401) when verification fails, so order numbers can't be probed", async () => {
    mockSingle.mockResolvedValueOnce({ data: { id: "bot_1" } });
    (lookupShopifyOrder as jest.Mock).mockResolvedValueOnce({
      ok: false,
      code: "verification_failed",
      message: "no match",
    });
    const res = await POST(
      request({ public_key: "pk", order_number: "1001", email: "x@example.com" }),
    );
    expect(res.status).toBe(404);
  });
});
