import ReactQueryProvider from "@/lib/react-query-provider";
import { StyledComponentsRegistry } from "@/styles/registry";

// Root layout for the marketing site and the dashboard. The embedded Shopify admin has its own
// root layout in app/(shopify) so that only it loads Shopify App Bridge.
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <body suppressHydrationWarning>
        <ReactQueryProvider>
          <StyledComponentsRegistry>{children}</StyledComponentsRegistry>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
