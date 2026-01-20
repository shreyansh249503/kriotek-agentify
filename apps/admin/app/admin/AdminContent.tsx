"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Bot } from "@/types/bot";
import Link from "next/link";

export default function AdminContent() {
    const [bots, setBots] = useState<Bot[]>([]);

    useEffect(() => {
        async function loadBots() {
            const session = await supabase.auth.getSession();

            const res = await fetch("http://localhost:3000/api/bots", {
                headers: {
                    Authorization: `Bearer ${session.data.session?.access_token}`,
                },
            });

            const data = await res.json();
            setBots(data);
        }

        loadBots();
    }, []);

    return (
        <div>
            <h2>Your Bots</h2>
            <Link href={"/admin/new"}>Add new bot</Link>
            {bots.map((bot) => (
                <div key={bot.id}>
                    <strong>{bot.name}</strong>

                    <a
                        href={`/admin/bots/${bot.public_key}/ingest`}
                        style={{ marginLeft: 12 }}
                    >
                        Ingest
                    </a>
                </div>
            ))}
        </div>
    );
}
