"use client";

import AuthGuard from "@/components/AuthGuard";
import { Adminheader, Sidebar } from "./components";
import { DashboardContainer, MainArea, ContentWrapper } from "./layout.styled";
import { SidebarProvider } from "@/context/SidebarContext";
import { BreadcrumbProvider } from "@/context/BreadcrumbContext";
import { usePathname } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAgentCreation = pathname?.startsWith("/admin/agent-creation");
  const isShopify = pathname?.startsWith("/admin/shopify");

  if (isShopify) {
    return <>{children}</>;
  }

  if (isAgentCreation) {
    return (
      <BreadcrumbProvider>
        <AuthGuard>{children}</AuthGuard>
      </BreadcrumbProvider>
    );
  }

  return (
    <BreadcrumbProvider>
      <AuthGuard>
        <SidebarProvider>
          <DashboardContainer>
            <Sidebar />
            <MainArea>
              <Adminheader />
              <ContentWrapper>{children}</ContentWrapper>
            </MainArea>
          </DashboardContainer>
        </SidebarProvider>
      </AuthGuard>
    </BreadcrumbProvider>
  );
}
