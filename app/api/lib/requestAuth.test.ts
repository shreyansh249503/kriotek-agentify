import { canManageBot, getRequestPrincipal } from "./requestAuth";
import { getDb } from "./db";
import { getUserFromRequest } from "./auth";
import {
  getShopFromSession,
  verifySessionToken,
} from "../shopify/lib/verifySessionToken";

jest.mock("./db");
jest.mock("./auth");
jest.mock("../shopify/lib/verifySessionToken", () => ({
  verifySessionToken: jest.fn(),
  getShopFromSession: jest.fn(),
}));

const withAuth = (token?: string) =>
  new Request("http://localhost/api/x", {
    headers: token ? { authorization: `Bearer ${token}` } : {},
  });

describe("requestAuth", () => {
  const botRepo = { findOne: jest.fn() };
  const storeRepo = { findOne: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
    (getDb as jest.Mock).mockResolvedValue({
      getRepository: (name: string) => (name === "Bot" ? botRepo : storeRepo),
    });
    (verifySessionToken as jest.Mock).mockImplementation(() => {
      throw new Error("not a shopify token");
    });
    (getUserFromRequest as jest.Mock).mockResolvedValue(null);
  });

  describe("getRequestPrincipal", () => {
    it("returns null without a bearer token", async () => {
      expect(await getRequestPrincipal(withAuth())).toBeNull();
      expect(getUserFromRequest).not.toHaveBeenCalled();
    });

    it("recognises a Shopify session token", async () => {
      (verifySessionToken as jest.Mock).mockReturnValueOnce({ dest: "x" });
      (getShopFromSession as jest.Mock).mockReturnValueOnce("a.myshopify.com");
      expect(await getRequestPrincipal(withAuth("shop-jwt"))).toEqual({
        kind: "shop",
        shop: "a.myshopify.com",
      });
    });

    it("falls back to a Supabase user", async () => {
      (getUserFromRequest as jest.Mock).mockResolvedValueOnce({ id: "u1" });
      expect(await getRequestPrincipal(withAuth("supabase-jwt"))).toEqual({
        kind: "user",
        userId: "u1",
      });
    });

    it("returns null for an invalid token", async () => {
      expect(await getRequestPrincipal(withAuth("garbage"))).toBeNull();
    });
  });

  describe("canManageBot", () => {
    it("allows the bot's owner", async () => {
      botRepo.findOne.mockResolvedValueOnce({ id: "b1", user_id: "u1" });
      expect(await canManageBot({ kind: "user", userId: "u1" }, "pk")).toBe(true);
    });

    it("rejects another user", async () => {
      botRepo.findOne.mockResolvedValueOnce({ id: "b1", user_id: "u1" });
      expect(await canManageBot({ kind: "user", userId: "u2" }, "pk")).toBe(false);
    });

    it("allows the shop the bot is linked to", async () => {
      botRepo.findOne.mockResolvedValueOnce({ id: "b1", user_id: "u1" });
      storeRepo.findOne.mockResolvedValueOnce({ shop: "a.myshopify.com", bot_id: "b1" });
      expect(await canManageBot({ kind: "shop", shop: "a.myshopify.com" }, "pk")).toBe(true);
    });

    it("rejects a shop linked to a different bot", async () => {
      botRepo.findOne.mockResolvedValueOnce({ id: "b1", user_id: "u1" });
      storeRepo.findOne.mockResolvedValueOnce({ shop: "b.myshopify.com", bot_id: "b2" });
      expect(await canManageBot({ kind: "shop", shop: "b.myshopify.com" }, "pk")).toBe(false);
    });

    it("rejects unknown bots", async () => {
      botRepo.findOne.mockResolvedValueOnce(null);
      expect(await canManageBot({ kind: "user", userId: "u1" }, "pk")).toBe(false);
    });
  });
});
