import { createClient } from "@supabase/supabase-js";
import { lookupVerifiedOrder } from "@/lib/shopify/orderLookup";
import { createOrderLookupTool } from "./orderLookupTool";

jest.mock("@supabase/supabase-js", () => ({ createClient: jest.fn() }));
jest.mock("@/lib/shopify/orderLookup", () => ({
  ...jest.requireActual("@/lib/shopify/orderLookup"),
  lookupVerifiedOrder: jest.fn(),
}));
jest.mock("../crypto", () => ({ decryptToken: (t: string) => `decrypted:${t}` }));

type ToolResult = Record<string, unknown>;

describe("createOrderLookupTool", () => {
  const mockSingle = jest.fn();
  const run = (input: { order_number: string; email?: string; phone?: string }) => {
    const lookupTool = createOrderLookupTool("bot_1", (j) => `summarize ${j.orderNumber}`);
    return Promise.resolve(lookupTool.execute!(input, { toolCallId: "t1", messages: [] })) as Promise<ToolResult>;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {});
    (createClient as jest.Mock).mockReturnValue({
      from: () => ({ select: () => ({ eq: () => ({ single: mockSingle }) }) }),
    });
    mockSingle.mockResolvedValue({ data: { shop: "s.myshopify.com", access_token: "enc" }, error: null });
  });

  it("asks the model to collect contact details when none are verified", async () => {
    (lookupVerifiedOrder as jest.Mock).mockResolvedValue({ status: "verification_required" });

    const result = await run({ order_number: "1001" });

    expect(result.requiresVerification).toBe(true);
    expect(result.success).toBeUndefined();
    expect(result).not.toHaveProperty("tagPayload");
  });

  it("passes the decrypted token and customer details to the verified lookup", async () => {
    (lookupVerifiedOrder as jest.Mock).mockResolvedValue({ status: "not_found" });

    await run({ order_number: "1001", email: "a@b.com", phone: "5550123" });

    expect(lookupVerifiedOrder).toHaveBeenCalledWith({
      shop: "s.myshopify.com",
      accessToken: "decrypted:enc",
      orderNumber: "1001",
      email: "a@b.com",
      phone: "5550123",
    });
  });

  it("returns no order data when verification fails", async () => {
    (lookupVerifiedOrder as jest.Mock).mockResolvedValue({ status: "verification_failed" });

    const result = await run({ order_number: "1001", email: "attacker@example.com" });

    expect(result.error).toContain("Verification failed");
    expect(result).not.toHaveProperty("tagPayload");
  });

  it("returns the journey payload and agent-specific instruction when found", async () => {
    const journey = { orderNumber: "#1001", statusBadge: "Shipped", statusDescription: "On its way" };
    (lookupVerifiedOrder as jest.Mock).mockResolvedValue({ status: "found", journey });

    const result = await run({ order_number: "1001", email: "jane@example.com" });

    expect(result).toMatchObject({
      success: true,
      orderNumber: "#1001",
      instruction: "summarize #1001",
      tagPayload: `[ORDER_JOURNEY_JSON:${JSON.stringify(journey)}]`,
    });
  });

  it("reports a missing store integration", async () => {
    mockSingle.mockResolvedValue({ data: null, error: new Error("none") });

    const result = await run({ order_number: "1001", email: "a@b.com" });

    expect(result.error).toContain("not configured");
    expect(lookupVerifiedOrder).not.toHaveBeenCalled();
  });
});
