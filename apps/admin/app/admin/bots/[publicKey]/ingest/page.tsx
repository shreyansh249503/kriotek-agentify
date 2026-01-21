"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import EmbedSuccess from "@/components/EmbedSuccess";

export default function IngestPage() {
    const { publicKey } = useParams<{ publicKey: string }>();
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    async function ingest() {
        setLoading(true);

        const session = await supabase.auth.getSession();

        await fetch("http://localhost:3000/api/ingest", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${session.data.session?.access_token}`,
            },
            body: JSON.stringify({
                publicKey,
                content,
            }),
        });

        setLoading(false);

        setSuccess(true);
    }

    return (
        <div style={{ maxWidth: 800 }}>
            <h2>Ingest Knowledge</h2>

            {!success && (
                <>
                    <textarea
                        rows={12}
                        placeholder="Paste website content, FAQs, docs..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        style={{ width: "100%", marginBottom: 16 }}
                    />

                    <button onClick={ingest} disabled={loading}>
                        {loading ? "Ingesting..." : "Ingest"}
                    </button>
                </>
            )}

            {success && (
                <EmbedSuccess publicKey={publicKey} />
            )}
        </div>
    );
}
