"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import EmbedSuccess from "@/components/EmbedSuccess";
import {
  NewBotContainer,
  NewBotTitle,
  NewBotWrapper,
  TabContainer,
  TabButton,
  FormSection,
  TextArea,
  Input,
  SubmitButton,
  LoadingText,
  ErrorText,
  SuccessContainer,
  ChunksText,
} from "./styled";

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
    <NewBotContainer>
      <NewBotWrapper>
        <NewBotTitle>Ingest Knowledge</NewBotTitle>
        {!success && (
          <TabContainer>
            <TabButton
              isActive={mode === "text"}
              onClick={() => setMode("text")}
            >
              Text Ingest
            </TabButton>
            <TabButton isActive={mode === "url"} onClick={() => setMode("url")}>
              URL Ingest
            </TabButton>
          </TabContainer>
        )}

        {!success && mode === "text" && (
          <FormSection>
            <TextArea
              rows={12}
              placeholder="Paste website content, FAQs, documentation, or any text you want your bot to learn from..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            <SubmitButton onClick={ingest} disabled={loading}>
              {loading ? "Ingesting..." : " Ingest Text"}
            </SubmitButton>
          </FormSection>
        )}

        {!success && mode === "url" && (
          <FormSection>
            <Input
              type="text"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <SubmitButton onClick={ingest} disabled={loading}>
              {loading ? "Crawling..." : " Ingest URL"}
            </SubmitButton>
          </FormSection>
        )}

        {loading && <LoadingText> Processing your content...</LoadingText>}

        {error && <ErrorText>{error}</ErrorText>}

        {success && (
          <SuccessContainer>
            {chunks !== null && (
              <ChunksText>
                Successfully ingested <b>{chunks}</b> chunks from website
              </ChunksText>
            )}

            <EmbedSuccess publicKey={publicKey} />
          </SuccessContainer>
        )}
      </NewBotWrapper>
    </NewBotContainer>
  );
}
