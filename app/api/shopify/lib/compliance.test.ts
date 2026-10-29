import { getDb } from "../../lib/db";
import { supabaseAdmin } from "../../lib/supabase-admin";
import { sendUserEmail } from "../../lib/sendEmail";
import {
  findCustomerRecords,
  markUninstalled,
  redactCustomer,
  redactShop,
  sendCustomerDataExport,
} from "./compliance";

jest.mock("../../lib/db", () => ({ getDb: jest.fn() }));
jest.mock("../../lib/supabase-admin", () => ({
  supabaseAdmin: { auth: { admin: { getUserById: jest.fn() } } },
}));
jest.mock("../../lib/sendEmail", () => ({ sendUserEmail: jest.fn() }));

describe("Shopify compliance", () => {
  const shop = "test-store.myshopify.com";
  const query = jest.fn();
  const txQuery = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (getDb as jest.Mock).mockResolvedValue({
      query,
      transaction: (work: (m: { query: jest.Mock }) => unknown) => work({ query: txQuery }),
    });
    // Default: the shop is linked to bot-1
    query.mockImplementation(async (sql: string) =>
      sql.includes("SELECT bot_id FROM shopify_stores") ? [{ bot_id: "bot-1" }] : []
    );
    txQuery.mockResolvedValue([[], 0]);
  });

  describe("redactCustomer", () => {
    it("deletes leads and conversations with normalized email and phone digits", async () => {
      txQuery
        .mockResolvedValueOnce([[{ id: "l1" }], 1])
        .mockResolvedValueOnce([[{ id: "c1" }, { id: "c2" }], 2]);

      const result = await redactCustomer(shop, { email: " Jane@Example.COM ", phone: "+1 (415) 555-0123" });

      expect(result).toEqual({ leads: 1, conversations: 2 });
      expect(txQuery).toHaveBeenNthCalledWith(1, expect.stringContaining("DELETE FROM leads"), [
        "bot-1",
        "jane@example.com",
        "14155550123",
      ]);
      expect(txQuery).toHaveBeenNthCalledWith(2, expect.stringContaining("DELETE FROM conversations"), [
        "bot-1",
        "jane@example.com",
        "14155550123",
      ]);
    });

    it("ignores phone numbers too short to identify a customer", async () => {
      await redactCustomer(shop, { email: "a@b.com", phone: "1234" });

      expect(txQuery.mock.calls[0][1]).toEqual(["bot-1", "a@b.com", null]);
    });

    it("does nothing without a usable email or phone", async () => {
      expect(await redactCustomer(shop, { phone: "12" })).toEqual({ leads: 0, conversations: 0 });
      expect(txQuery).not.toHaveBeenCalled();
    });

    it("does nothing for a shop with no linked bot", async () => {
      query.mockResolvedValue([]);

      expect(await redactCustomer(shop, { email: "a@b.com" })).toEqual({ leads: 0, conversations: 0 });
      expect(txQuery).not.toHaveBeenCalled();
    });
  });

  describe("markUninstalled", () => {
    it("wipes the token and records the uninstall time, keeping the row", async () => {
      await markUninstalled(shop);

      const [sql, params] = query.mock.calls[0];
      expect(sql).toMatch(/UPDATE shopify_stores SET access_token = '', uninstalled_at = NOW\(\)/);
      expect(sql).not.toMatch(/DELETE/);
      expect(params).toEqual([shop]);
    });
  });

  describe("redactShop", () => {
    it("erases conversations, leads and Shopify products, then deletes the store, in one transaction", async () => {
      await redactShop(shop);

      const statements = txQuery.mock.calls.map(([sql]) => sql as string);
      expect(statements[0]).toContain("DELETE FROM conversations WHERE bot_id = $1");
      expect(statements[1]).toContain("DELETE FROM leads WHERE bot_id = $1");
      expect(statements[2]).toContain("p->>'shopify_id' IS NULL");
      expect(statements[3]).toContain("DELETE FROM shopify_stores WHERE shop = $1");
      expect(statements.join(" ")).not.toContain("DELETE FROM bots");
    });

    it("still deletes the store row when no bot is linked", async () => {
      query.mockResolvedValue([]);

      await redactShop(shop);

      expect(txQuery).toHaveBeenCalledTimes(1);
      expect(txQuery).toHaveBeenCalledWith(expect.stringContaining("DELETE FROM shopify_stores"), [shop]);
    });
  });

  describe("customers/data_request export", () => {
    const leads = [{ name: "Jane", email: "jane@example.com", phone: null, created_at: "2026-10-01" }];
    const conversations = [{ id: "c1", email: "jane@example.com", messages: [{ role: "user", content: "<hi>" }] }];

    beforeEach(() => {
      query.mockImplementation(async (sql: string) => {
        if (sql.includes("SELECT bot_id FROM shopify_stores")) return [{ bot_id: "bot-1" }];
        if (sql.includes("FROM leads")) return leads;
        if (sql.includes("FROM conversations")) return conversations;
        if (sql.includes("JOIN bots")) return [{ user_id: "user-1", contact_email: "support@store.com" }];
        return [];
      });
    });

    it("finds the customer's leads and conversations", async () => {
      expect(await findCustomerRecords(shop, { email: "jane@example.com" })).toEqual({ leads, conversations });
    });

    it("emails the records to the merchant's account email, HTML-escaped", async () => {
      (supabaseAdmin.auth.admin.getUserById as jest.Mock).mockResolvedValue({
        data: { user: { email: "owner@merchant.com" } },
      });

      await sendCustomerDataExport(shop, { email: "jane@example.com" }, 9001);

      const email = (sendUserEmail as jest.Mock).mock.calls[0][0];
      expect(email.to).toBe("owner@merchant.com");
      expect(email.subject).toContain(shop);
      expect(email.body).toContain("9001");
      expect(email.body).toContain("1 lead(s) and 1 conversation(s)");
      expect(email.html).toContain("&lt;hi&gt;");
      expect(email.html).not.toContain("<hi>");
    });

    it("falls back to the bot's contact email", async () => {
      (supabaseAdmin.auth.admin.getUserById as jest.Mock).mockResolvedValue({ data: { user: null } });

      await sendCustomerDataExport(shop, { email: "jane@example.com" }, 1);

      expect((sendUserEmail as jest.Mock).mock.calls[0][0].to).toBe("support@store.com");
    });

    it("sends nothing when the shop has already been redacted", async () => {
      query.mockResolvedValue([]);

      await sendCustomerDataExport(shop, { email: "jane@example.com" }, 1);

      expect(sendUserEmail).not.toHaveBeenCalled();
    });
  });
});
