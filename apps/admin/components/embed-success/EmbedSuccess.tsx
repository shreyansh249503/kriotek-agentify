"use client";

import { generateEmbedScript, generateReactEmbedScript } from "@/lib/embed";
import { CopyIcon, FileJsIcon, CodeIcon } from "@phosphor-icons/react";
import { useState } from "react";
import {
  CodeContainer,
  CodeCopyButton,
  CodeFileName,
  CodeHeader,
  CodePre,
  CodePublicKey,
  CodePublicKeyContainer,
  Description,
  EmbedSuccessContainer,
  EmbedSuccessTitle,
  InnerEmbedSuccessContainer,
  TabButton,
} from "./styled";

export const EmbedSuccess = ({ publicKey }: { publicKey: string }) => {
  const [activeTab, setActiveTab] = useState<"html" | "nextjs">("html");
  const [copied, setCopied] = useState(false);

  const script =
    activeTab === "html"
      ? generateEmbedScript(publicKey)
      : generateReactEmbedScript(publicKey);

  function copy() {
    navigator.clipboard.writeText(script);
    setCopied(true);

    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <EmbedSuccessContainer
    // style={{
    //   marginTop: 32,
    //   padding: 20,
    //   border: "1px solid #ddd",
    //   borderRadius: 8,
    //   background: "#fafafa",
    // }}
    >
      <EmbedSuccessTitle
      // style={{ marginBottom: 16 }}
      >
        Your chatbot is ready!
      </EmbedSuccessTitle>

      <InnerEmbedSuccessContainer
      // style={{
      //   display: "flex",
      //   gap: 10,
      //   marginBottom: 12,
      //   borderBottom: "1px solid #ddd",
      //   paddingBottom: 8,
      // }}
      >
        <TabButton
          active={activeTab === "html"}
          onClick={() => setActiveTab("html")}
          // style={{
          //   background: activeTab === "html" ? "#111" : "transparent",
          //   color: activeTab === "html" ? "#fff" : "#555",
          //   border: "none",
          //   padding: "8px 16px",
          //   borderRadius: 6,
          //   cursor: "pointer",
          //   fontWeight: 500,
          //   display: "flex",
          //   alignItems: "center",
          //   gap: 6,
          //   transition: "all 0.2s",
          // }}
        >
          <CodeIcon size={18} /> HTML
        </TabButton>
        <TabButton
          active={activeTab === "nextjs"}
          onClick={() => setActiveTab("nextjs")}
          // style={{
          //   background: activeTab === "nextjs" ? "#111" : "transparent",
          //   color: activeTab === "nextjs" ? "#fff" : "#555",
          //   border: "none",
          //   padding: "8px 16px",
          //   borderRadius: 6,
          //   cursor: "pointer",
          //   fontWeight: 500,
          //   display: "flex",
          //   alignItems: "center",
          //   gap: 6,
          //   transition: "all 0.2s",
          // }}
        >
          <FileJsIcon size={18} /> Next.js
        </TabButton>
      </InnerEmbedSuccessContainer>

      <Description
      // style={{ marginBottom: 12, fontSize: 14, color: "#666" }}
      >
        {activeTab === "html"
          ? "Copy and paste this script into your website's <body>."
          : "Use this component in your Next.js application."}
      </Description>

      <CodeContainer
      // style={{
      //   position: "relative",
      //   background: "#111",
      //   borderRadius: 8,
      //   overflow: "hidden",
      // }}
      >
        <CodeHeader
        // style={{
        //   display: "flex",
        //   justifyContent: "space-between",
        //   alignItems: "center",
        //   padding: "8px 12px",
        //   background: "#222",
        //   borderBottom: "1px solid #333",
        // }}
        >
          <CodeFileName
          // style={{ fontSize: 12, color: "#888", fontFamily: "monospace" }}
          >
            {activeTab === "html" ? "index.html" : "Layout.tsx"}
          </CodeFileName>
          <CodeCopyButton
            copied={copied}
            onClick={copy}
            // style={{
            //   background: "transparent",
            //   border: "none",
            //   color: copied ? "#4caf50" : "#fff",
            //   cursor: "pointer",
            //   fontSize: "12px",
            //   display: "flex",
            //   alignItems: "center",
            //   gap: 6,
            // }}
          >
            {copied ? (
              "Copied!"
            ) : (
              <>
                <CopyIcon size={16} /> Copy
              </>
            )}
          </CodeCopyButton>
        </CodeHeader>
        <CodePre
        // style={{
        //   textAlign: "left",
        //   color: "#e6e6e6",
        //   padding: 16,
        //   margin: 0,
        //   overflowX: "auto",
        //   fontSize: 13,
        //   lineHeight: 1.5,
        //   fontFamily: "monospace",
        // }}
        >
          {script}
        </CodePre>
      </CodeContainer>

      <CodePublicKeyContainer
      // style={{ marginTop: 16, fontSize: 14, color: "#555" }}
      >
        Bot Public Key:{" "}
        <CodePublicKey
        // style={{ background: "#eee", padding: "2px 6px", borderRadius: 4 }}
        >
          {publicKey}
        </CodePublicKey>
      </CodePublicKeyContainer>
    </EmbedSuccessContainer>
  );
};
