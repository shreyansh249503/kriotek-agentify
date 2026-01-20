import LogoutButton from "@/components/LogoutButton";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <header style={{ padding: 16, borderBottom: "1px solid #ddd" }}>
                <span style={{ marginRight: 16 }}>AI Bot Admin</span>
                <LogoutButton />
            </header>

            <main style={{ padding: 24 }}>
                {children}
            </main>
        </>
    );
}
