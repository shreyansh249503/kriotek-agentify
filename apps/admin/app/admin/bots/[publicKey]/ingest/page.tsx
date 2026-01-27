"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import EmbedSuccess from "@/components/EmbedSuccess";

type Mode = "text" | "url";

export default function IngestPage() {
    const { publicKey } = useParams<{ publicKey: string }>();
    const [mode, setMode] = useState<Mode>("text");
    const [content, setContent] = useState("");
    const [url, setUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [chunks, setChunks] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);

    async function ingest() {
        setLoading(true);
        setError(null);

        try {
            const session = await supabase.auth.getSession();

            if (mode === "text") {
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

                setSuccess(true);
            }

            if (mode === "url") {
                const res = await fetch("http://localhost:3000/api/ingest-url", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${session.data.session?.access_token}`,
                    },
                    body: JSON.stringify({
                        publicKey,
                        url,
                    }),
                });

                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data.error || "URL ingest failed");
                }

                setChunks(data.chunksIngested);
                setSuccess(true);
            }
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("Something went wrong");
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <div style={{ maxWidth: 800 }}>
            <h2>Ingest Knowledge</h2>

            {/* MODE TOGGLE */}
            {!success && (
                <div style={{ marginBottom: 16 }}>
                    <button
                        onClick={() => setMode("text")}
                        style={{
                            marginRight: 8,
                            fontWeight: mode === "text" ? "bold" : "normal",
                        }}
                    >
                        Text Ingest
                    </button>

                    <button
                        onClick={() => setMode("url")}
                        style={{
                            fontWeight: mode === "url" ? "bold" : "normal",
                        }}
                    >
                        URL Ingest
                    </button>
                </div>
            )}

            {/* TEXT INGEST */}
            {!success && mode === "text" && (
                <>
                    <textarea
                        rows={12}
                        placeholder="Paste website content, FAQs, docs..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        style={{ width: "100%", marginBottom: 16 }}
                    />

                    <button onClick={ingest} disabled={loading}>
                        {loading ? "Ingesting..." : "Ingest Text"}
                    </button>
                </>
            )}

            {/* URL INGEST */}
            {!success && mode === "url" && (
                <>
                    <input
                        type="text"
                        placeholder="https://example.com"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        style={{ width: "100%", marginBottom: 16 }}
                    />

                    <button onClick={ingest} disabled={loading}>
                        {loading ? "Crawling..." : "Ingest URL"}
                    </button>
                </>
            )}

            {loading && <p>⏳ Processing…</p>}

            {error && <p style={{ color: "red" }}>{error}</p>}

            {/* SUCCESS */}
            {success && (
                <>
                    {chunks !== null && (
                        <p>Ingested <b>{chunks}</b> chunks from website</p>
                    )}

                    <EmbedSuccess publicKey={publicKey} />
                </>
            )}
        </div>
    );
}
