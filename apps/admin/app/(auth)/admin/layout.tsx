import AuthGuard from "@/components/AuthGuard";
import { Adminheader, Sidebar } from "./components";
import { DashboardContainer, MainArea, ContentWrapper } from "./layout.styled";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <DashboardContainer>
        <Sidebar />
        <MainArea>
          <Adminheader />
          <ContentWrapper>{children}</ContentWrapper>
        </MainArea>
      </DashboardContainer>
    </AuthGuard>
  );
}
