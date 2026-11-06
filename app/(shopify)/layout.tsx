import ReactQueryProvider from "@/lib/react-query-provider";
import { StyledComponentsRegistry } from "@/styles/registry";

// Root layout for the embedded Shopify admin (/admin/shopify). App Bridge must load in <head>,
// before the page's own scripts, because every page asks it for a session token on mount.
// Only these pages load it; the rest of the site uses app/(main)/layout.tsx.
// Navigating between the two root layouts is a full page load, which is fine: the embedded
// admin runs inside Shopify's iframe and never links to the rest of the site.
export default function ShopifyRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="shopify-api-key" content={process.env.NEXT_PUBLIC_SHOPIFY_API_KEY} />
        <script src="https://cdn.shopify.com/shopifycloud/app-bridge.js" async={false}></script>
      </head>
      <body suppressHydrationWarning>
        <ReactQueryProvider>
          <StyledComponentsRegistry>{children}</StyledComponentsRegistry>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
