"use client";

import { generateEmbedScript } from "@/lib/embed";

export default function EmbedSuccess({ publicKey }: { publicKey: string }) {
    const script = generateEmbedScript(publicKey);

    function copy() {
        navigator.clipboard.writeText(script);
        alert("Embed script copied!");
    }

    return (
        <div
            style={{
                marginTop: 32,
                padding: 20,
                border: "1px solid #ddd",
                borderRadius: 8,
                background: "#fafafa",
            }}
        >
            <h3> Your chatbot is ready!</h3>

            <p>
                Copy and paste this script into your website.
            </p>

            <pre
                style={{
                    background: "#111",
                    color: "#0f0",
                    padding: 12,
                    borderRadius: 6,
                    overflowX: "auto",
                }}
            >
                {script}
            </pre>

            <button onClick={copy} style={{ marginTop: 12 }}>
                Copy Script
            </button>

            <p style={{ marginTop: 12, fontSize: 14, color: "#555" }}>
                Bot Public Key: <code>{publicKey}</code>
            </p>
        </div>
    );
}
