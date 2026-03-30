import AuthGuard from "@/components/AuthGuard";
import { Adminheader, Sidebar } from "./components";
import { DashboardContainer, MainArea, ContentWrapper } from "./layout.styled";
import { SidebarProvider } from "@/context/SidebarContext";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
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
  );
}
