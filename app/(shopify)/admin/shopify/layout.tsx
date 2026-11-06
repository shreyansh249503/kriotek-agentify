"use client";

import { AppProvider } from "@shopify/polaris";
import "@shopify/polaris/build/esm/styles.css";
import en from "@shopify/polaris/locales/en.json";

interface Props {
  children: React.ReactNode;
}

export default function ShopifyAdminLayout({ children }: Props) {
  return (
    <AppProvider i18n={en}>
      {children}
    </AppProvider>
  );
}
