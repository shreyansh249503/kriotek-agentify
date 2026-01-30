"use client";

import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { LogoutBtn } from "./styled";

export const LogoutButton = () => {
    const router = useRouter();

    async function logout() {
        await supabase.auth.signOut();
        router.replace("/login");
    }

    return (
        <LogoutBtn onClick={logout}>
            Logout
        </LogoutBtn>
    );
}
