/** @jest-environment node */
import { NextRequest } from "next/server";
import { config, proxy } from "./proxy";

const frameAncestors = (url: string) =>
  proxy(new NextRequest(url)).headers.get("Content-Security-Policy");

describe("proxy (Shopify admin framing)", () => {
  it("allows only Shopify admin and the requesting shop", () => {
    expect(frameAncestors("https://app.example.com/admin/shopify?shop=demo-store.myshopify.com")).toBe(
      "frame-ancestors https://demo-store.myshopify.com https://admin.shopify.com;"
    );
  });

  it.each([
    "evil.com",
    "evil.com https://attacker.example",
    "demo.myshopify.com.attacker.example",
    "DEMO;script.myshopify.com",
  ])("ignores an invalid shop parameter: %s", (shop) => {
    const policy = frameAncestors(`https://app.example.com/admin/shopify/bot?shop=${encodeURIComponent(shop)}`);
    expect(policy).toBe("frame-ancestors https://*.myshopify.com https://admin.shopify.com;");
    expect(policy).not.toContain("attacker");
  });

  it("falls back to any Shopify store when no shop is given", () => {
    expect(frameAncestors("https://app.example.com/admin/shopify/leads")).toBe(
      "frame-ancestors https://*.myshopify.com https://admin.shopify.com;"
    );
  });

  it("only runs on the embedded Shopify admin", () => {
    expect(config.matcher).toEqual(["/admin/shopify", "/admin/shopify/:path*"]);
  });
});
