import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs/config";

const widgetCacheControl =
  process.env.NODE_ENV === "development"
    ? "no-store, max-age=0"
    : "public, max-age=300, stale-while-revalidate=86400";

const nextConfig: NextConfig = {
  compiler: {
    styledComponents: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "bhyrxyzokssibgeznojo.supabase.co",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "m.media-amazon.com",
      },
      {
        protocol: "https",
        hostname: "images-na.ssl-images-amazon.com",
      },
      {
        protocol: "https",
        hostname: "cdn.shopify.com",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
    ],
  },
  allowedDevOrigins: process.env.NODE_ENV === "development" ? ["drew-thirteen-heroism.ngrok-free.dev"] : [],
  async headers() {
    const publicCorsHeaders = [
      { key: "Access-Control-Allow-Origin", value: "*" },
      { key: "Access-Control-Allow-Methods", value: "GET, POST, OPTIONS" },
      {
        key: "Access-Control-Allow-Headers",
        value: "Content-Type, Authorization, ngrok-skip-browser-warning",
      },
    ];

    const securityHeaders = [
      { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
    ];

    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      {
        // Clickjacking protection for every page except the embedded Shopify admin,
        // whose frame-ancestors (Shopify admin + the shop) is set per request in proxy.ts.
        source: "/((?!admin/shopify|api/).*)",
        headers: [{ key: "Content-Security-Policy", value: "frame-ancestors 'self';" }],
      },
      {
        source: "/api/public/:path*",
        headers: publicCorsHeaders,
      },
      {
        source: "/api/chat",
        headers: publicCorsHeaders,
      },
      {
        source: "/api/chat/:path*",
        headers: publicCorsHeaders,
      },
      {
        source: "/api/shopify/orders/lookup",
        headers: publicCorsHeaders,
      },
      {
        // Loaded on every page view of every merchant store. Merchants embed this fixed URL, so the
        // cache is short: browsers reuse it for 5 minutes, then refresh in the background, and a
        // fix reaches every store within minutes. Not cached in development so edits show up.
        source: "/widget.js",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Cache-Control", value: widgetCacheControl },
        ],
      },
      {
        // The widget's default bot icon. Replace the file under a new name rather than editing it.
        source: "/bot-icon.webp",
        headers: [{ key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" }],
      },
    ];
  },
};

// Source maps upload only when SENTRY_AUTH_TOKEN (plus SENTRY_ORG / SENTRY_PROJECT) is set.
export default withSentryConfig(nextConfig, {
  silent: !process.env.CI,
  sourcemaps: { disable: !process.env.SENTRY_AUTH_TOKEN },
});
