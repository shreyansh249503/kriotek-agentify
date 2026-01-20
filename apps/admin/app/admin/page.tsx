import AuthGuard from "@/components/AuthGuard";
import AdminContent from "./AdminContent";


export default async function AdminPage() {

    return (
        <AuthGuard>
            <AdminContent />
        </AuthGuard>
    );
}
