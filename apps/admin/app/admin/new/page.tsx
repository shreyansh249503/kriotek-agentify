"use client";

import BotForm from "@/components/BotForm";
import { supabase } from "@/lib/supabase";
import { CreateBotInput } from "@/types/bot";

export default function NewBotPage() {
    async function createBot(data: CreateBotInput) {
        const session = await supabase.auth.getSession();

        await fetch("http://localhost:3000/api/bots", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${session.data.session?.access_token}`,
            },
            body: JSON.stringify(data),
        });

        window.location.href = "/admin";
    }

    return <BotForm submitLabel="Create Bot" onSubmit={createBot} />;
}
