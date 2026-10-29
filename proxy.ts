import { NextRequest, NextResponse } from "next/server";

const SHOP_DOMAIN = /^[a-z0-9][a-z0-9-]*\.myshopify\.com$/;

/**
 * The embedded Shopify admin may only be framed by Shopify admin and the requesting shop
 * (Shopify App Store requirement). Other pages get frame-ancestors 'self' from next.config.ts.
 */
export function proxy(req: NextRequest) {
  const shop = req.nextUrl.searchParams.get("shop");
  const shopOrigin = shop && SHOP_DOMAIN.test(shop) ? `https://${shop}` : "https://*.myshopify.com";

  const res = NextResponse.next();
  res.headers.set("Content-Security-Policy", `frame-ancestors ${shopOrigin} https://admin.shopify.com;`);
  return res;
}

export const config = {
  matcher: ["/admin/shopify", "/admin/shopify/:path*"],
};
