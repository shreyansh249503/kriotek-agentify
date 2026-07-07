import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";
import { registerWebhooks } from "../lib/registerWebhooks";

const {
  SHOPIFY_API_KEY,
  SHOPIFY_API_SECRET,
  NEXT_PUBLIC_SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
} = process.env;

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  const shop = searchParams.get("shop");
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const hmac = searchParams.get("hmac");

  if (!shop || !code) {
    return NextResponse.json({ error: "Missing shop or code parameters" }, { status: 400 });
  }

  const cookieState = req.cookies.get("shopify_state")?.value;
  if (!state || state !== cookieState) {
    if (process.env.NODE_ENV !== "development") {
      return NextResponse.json({ error: "State mismatch" }, { status: 403 });
    } else {
      console.warn("State mismatch detected but bypassed in development mode.");
    }
  }

  if (!isValidHmac(searchParams, hmac!)) {
    return NextResponse.json({ error: "Invalid HMAC" }, { status: 403 });
  }

  const tokenRes = await fetch(`https://${shop}/admin/oauth/access_token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: SHOPIFY_API_KEY,
      client_secret: SHOPIFY_API_SECRET,
      code,
    }),
  });

  if (!tokenRes.ok) {
    return NextResponse.json(
      { error: "Token exchange failed" },
      { status: 500 },
    );
  }

  const { access_token, scope } = await tokenRes.json();

  const supabase = createClient(
    NEXT_PUBLIC_SUPABASE_URL!,
    SUPABASE_SERVICE_ROLE_KEY!,
  );

  const { error } = await supabase
    .from("shopify_stores")
    .upsert({ shop, access_token, scopes: scope }, { onConflict: "shop" });

  if (error) {
    console.error("Supabase upsert error:", error);
    return NextResponse.json({ error: "DB save failed" }, { status: 500 });
  }

  await registerWebhooks(shop, access_token);

  const redirectUrl = `https://${shop}/admin/apps/${SHOPIFY_API_KEY}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="shopify-api-key" content="${SHOPIFY_API_KEY}" />
        <script src="https://cdn.shopify.com/shopifycloud/app-bridge.js"></script>
        <script>
          const redirectUrl = "${redirectUrl}";
          try {
            if (window.top !== window.self) {
              window.top.location.href = redirectUrl;
            } else {
              window.location.href = redirectUrl;
            }
          } catch (e) {
            console.error("Frame breakout failed, attempting fallback:", e);
            try {
              window.parent.postMessage(JSON.stringify({
                message: "Shopify.API.remoteRedirect",
                data: { location: redirectUrl }
              }), "*");
            } catch (postError) {
              console.error("postMessage failed:", postError);
            }
            window.open(redirectUrl, "_top");
          }
        </script>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; background-color: #f6f6f7; color: #202223;">
        <div style="text-align: center; padding: 24px; background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.15);">
          <p style="font-size: 16px; margin-bottom: 12px;">Redirecting you to Shopify Admin...</p>
          <a href="${redirectUrl}" target="_top" style="display: inline-block; font-size: 14px; color: #008060; text-decoration: none; font-weight: 500; border: 1px solid #babfc3; padding: 8px 16px; border-radius: 4px; background: white; cursor: pointer;">
            Click here if you are not redirected automatically
          </a>
        </div>
      </body>
    </html>
  `;

  const response = new NextResponse(html, {
    headers: { "Content-Type": "text/html" },
  });

  response.cookies.delete("shopify_state");

  return response;
}

function isValidHmac(params: URLSearchParams, hmac: string): boolean {
  const message = Array.from(params.entries())
    .filter(([key]) => key !== "hmac")
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, val]) => `${key}=${val}`)
    .join("&");

  const digest = crypto
    .createHmac("sha256", SHOPIFY_API_SECRET!)
    .update(message)
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(digest, "hex"),
    Buffer.from(hmac, "hex"),
  );
}
