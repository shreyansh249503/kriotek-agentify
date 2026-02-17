import AuthGuard from "@/components/AuthGuard";
import { Adminheader } from "./components";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <Adminheader />
      <main>{children}</main>
    </AuthGuard>
  );
}
