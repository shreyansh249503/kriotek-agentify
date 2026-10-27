import type { NextConfig } from "next";

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
        value: "Content-Type, Authorization, ngrok-skip-browser-warning, x-forwarded-for, cf-connecting-ip, x-real-ip",
      },
    ];

    return [
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
        source: "/widget.js",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          {
            key: "Cache-Control",
            value:
              "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
