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
    <EmbedSuccessContainer>
      <EmbedSuccessTitle>Your chatbot is ready!</EmbedSuccessTitle>

      <InnerEmbedSuccessContainer>
        <TabButton
          active={activeTab === "html"}
          onClick={() => setActiveTab("html")}
        >
          <CodeIcon size={18} /> HTML
        </TabButton>
        <TabButton
          active={activeTab === "nextjs"}
          onClick={() => setActiveTab("nextjs")}
        >
          <FileJsIcon size={18} /> Next.js
        </TabButton>
      </InnerEmbedSuccessContainer>

      <Description>
        {activeTab === "html"
          ? "Copy and paste this script into your website's <body>."
          : "Use this component in your Next.js application."}
      </Description>

      <CodeContainer>
        <CodeHeader>
          <CodeFileName>
            {activeTab === "html" ? "index.html" : "Layout.tsx"}
          </CodeFileName>
          <CodeCopyButton copied={copied} onClick={copy}>
            {copied ? (
              "Copied!"
            ) : (
              <>
                <CopyIcon size={16} /> Copy
              </>
            )}
          </CodeCopyButton>
        </CodeHeader>
        <CodePre>{script}</CodePre>
      </CodeContainer>

      <CodePublicKeyContainer>
        Bot Public Key: <CodePublicKey>{publicKey}</CodePublicKey>
      </CodePublicKeyContainer>
    </EmbedSuccessContainer>
  );
};
