"use client";

import { generateEmbedScript } from "@/lib/embed";
import { CopyIcon } from "@phosphor-icons/react";
import { useState } from "react";

export default function EmbedSuccess({ publicKey }: { publicKey: string }) {
  const script = generateEmbedScript(publicKey);
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(script);
    setCopied(true);

    setTimeout(() => setCopied(false), 2000);
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

      <p>Copy and paste this script into your website.</p>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#111",
        }}
      >
      </div>
      <pre
        style={{
          position: "relative",
          textAlign: "left",
          background: "#111",
          color: "#0f0",
          padding: 12,
          borderRadius: 6,
          overflowX: "auto",
        }}
      >
        {script}
        <span
          onClick={copy}
          style={{
            position: "absolute",
              top: 10,
            right: 10,
            width: "fit-content",
            color: "white",
            cursor: "pointer",
            fontSize: "12px",
          }}
        >
          {copied ? "Copied" : <CopyIcon size={16} weight="duotone" />}
        </span>
      </pre>

      <p style={{ marginTop: 12, fontSize: 14, color: "#555" }}>
        Bot Public Key: <code>{publicKey}</code>
      </p>
    </div>
  );
}
