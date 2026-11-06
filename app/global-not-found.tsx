import type { Metadata } from "next";
import Link from "next/link";

// Served for URLs that match no route. The app has two root layouts (app/(main) and
// app/(shopify)), so this page renders on its own and brings its own minimal styles.
export const metadata: Metadata = {
  title: "Page not found | Agentify",
  robots: { index: false },
};

export default function GlobalNotFound() {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
          background: "#ffffff",
          color: "#111827",
          textAlign: "center",
          padding: "16px",
        }}
      >
        <main>
          <p style={{ fontSize: 14, fontWeight: 600, color: "#4f46e5", margin: 0 }}>404</p>
          <h1 style={{ fontSize: 28, margin: "8px 0 12px" }}>Page not found</h1>
          <p style={{ color: "#6b7280", margin: "0 0 24px" }}>
            The page you&apos;re looking for doesn&apos;t exist or has moved.
          </p>
          <Link href="/" style={{ color: "#4f46e5", fontWeight: 600, textDecoration: "none" }}>
            Go to the homepage
          </Link>
        </main>
      </body>
    </html>
  );
}
