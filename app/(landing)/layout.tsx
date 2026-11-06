import { Footer, Header } from "@/components";
import Script from "next/script";

// The marketing site's own chat bot. Set per environment; the widget is left out when unset.
const widgetUrl = process.env.NEXT_PUBLIC_WIDGET_URL;
const landingBotKey = process.env.NEXT_PUBLIC_LANDING_BOT_KEY;

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      {children}
      <Footer />
      {widgetUrl && landingBotKey && (
        <Script bot-id={landingBotKey} src={`${widgetUrl}/widget.js`} />
      )}
    </>
  );
}
