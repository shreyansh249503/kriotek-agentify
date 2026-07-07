import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

const {
  SHOPIFY_API_KEY,
  SHOPIFY_SCOPES,
  SHOPIFY_APP_URL,
  NEXT_PUBLIC_SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
} = process.env;

export async function GET(req: NextRequest) {
  const shop = req.nextUrl.searchParams.get("shop");
  const isEmbedded = req.nextUrl.searchParams.get("embedded") === "1";

  if (!shop || !isValidShopDomain(shop)) {
    return NextResponse.json({ error: "Invalid shop domain" }, { status: 400 });
  }

  const supabase = createClient(
    NEXT_PUBLIC_SUPABASE_URL!,
    SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    const { data: storeData } = await supabase
      .from("shopify_stores")
      .select("access_token")
      .eq("shop", shop)
      .single();

    const isInstalled = !!storeData?.access_token;

    if (isInstalled && isEmbedded) {
      const dashboardUrl = new URL(`/admin/shopify?${req.nextUrl.searchParams.toString()}`, SHOPIFY_APP_URL!);
      return NextResponse.redirect(dashboardUrl);
    }

    const state = crypto.randomBytes(16).toString("hex");
    const redirectUri = `${SHOPIFY_APP_URL}/api/shopify/callback`;
    const installUrl =
      `https://${shop}/admin/oauth/authorize` +
      `?client_id=${SHOPIFY_API_KEY}` +
      `&scope=${SHOPIFY_SCOPES}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&state=${state}`;

    if (isEmbedded) {
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta name="shopify-api-key" content="${SHOPIFY_API_KEY}" />
            <script src="https://cdn.shopify.com/shopifycloud/app-bridge.js"></script>
            <script>
              const installUrl = "${installUrl}";
              try {
                if (window.top !== window.self) {
                  window.top.location.href = installUrl;
                } else {
                  window.location.href = installUrl;
                }
              } catch (e) {
                console.error("Frame breakout failed, attempting fallback:", e);
                window.open(installUrl, "_top");
              }
            </script>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; background-color: #f6f6f7; color: #202223;">
            <div style="text-align: center; padding: 24px; background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.15);">
              <p style="font-size: 16px; margin-bottom: 12px;">Authorizing app permissions...</p>
              <a href="${installUrl}" target="_top" style="display: inline-block; font-size: 14px; color: #008060; text-decoration: none; font-weight: 500; border: 1px solid #babfc3; padding: 8px 16px; border-radius: 4px; background: white; cursor: pointer;">
                Click here to authorize manually
              </a>
            </div>
          </body>
        </html>
      `;

      const response = new NextResponse(html, {
        headers: { "Content-Type": "text/html" },
      });

      response.cookies.set("shopify_state", state, {
        httpOnly: true,
        secure: true,
        sameSite: "none", 
        maxAge: 60 * 10, 
      });

      return response;
    }

    const response = NextResponse.redirect(installUrl);
    response.cookies.set("shopify_state", state, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 60 * 10, 
    });

    return response;
  } catch (e) {
    console.error("Error in install route:", e);
    const errorMessage = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: "Internal server error", details: errorMessage }, { status: 500 });
  }
}

function isValidShopDomain(shop: string): boolean {
  return /^[a-zA-Z0-9][a-zA-Z0-9\-]*\.myshopify\.com$/.test(shop);
}
