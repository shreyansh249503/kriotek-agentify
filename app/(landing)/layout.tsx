import { Footer, Header } from "@/components";
import Script from "next/script";

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
      <Script bot-id="eksw_5e3mIIIX6St" src="http://localhost:3000/widget.js" />
    </>
  );
}
