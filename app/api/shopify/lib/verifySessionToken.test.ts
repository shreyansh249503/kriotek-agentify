const secret = "test_shopify_secret_123";
process.env.SHOPIFY_API_SECRET = secret;

import { verifySessionToken, getShopFromSession, ShopifySession } from "./verifySessionToken";
import jwt from "jsonwebtoken";

describe("Shopify verifySessionToken Utility", () => {

  it("should throw error if authorization header is missing or does not start with Bearer", () => {
    expect(() => verifySessionToken(null)).toThrow("Missing authorization header");
    expect(() => verifySessionToken("Basic 12345")).toThrow("Missing authorization header");
  });

  it("should throw error if session token is invalid or missing dest claim", () => {
    const token = jwt.sign({ sub: "user-1" }, secret);
    expect(() => verifySessionToken(`Bearer ${token}`)).toThrow("Invalid session token");
  });

  it("should verify valid session token and return payload", () => {
    const payload: ShopifySession = {
      shop: "test-shop.myshopify.com",
      dest: "https://test-shop.myshopify.com",
      aud: "app-client-id",
      sub: "user-123",
      exp: Math.floor(Date.now() / 1000) + 3600,
      iss: "https://test-shop.myshopify.com/admin",
    };

    const token = jwt.sign(payload, secret);
    const result = verifySessionToken(`Bearer ${token}`);

    expect(result.shop).toBe("test-shop.myshopify.com");
    expect(result.dest).toBe("https://test-shop.myshopify.com");
  });

  it("should extract shop hostname from session payload", () => {
    const session: ShopifySession = {
      shop: "my-store.myshopify.com",
      dest: "https://my-store.myshopify.com",
      aud: "client-1",
      sub: "sub-1",
      exp: 1234567890,
      iss: "https://my-store.myshopify.com/admin",
    };

    const shopHost = getShopFromSession(session);
    expect(shopHost).toBe("my-store.myshopify.com");
  });
});
