"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
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
  FileUploadZone,
  ProgressWrapper,
  CircularProgressBox,
  SvgCircle,
  ProgressCircleBg,
  ProgressCircleFill,
  PercentageText,
  StatusLabel,
  ProgressSubText,
} from "./styled";
import { CloudArrowUpIcon } from "@phosphor-icons/react";
import { EmbedSuccess } from "@/components";
import { useBreadcrumb } from "@/context/BreadcrumbContext";
import { motion, AnimatePresence } from "framer-motion";

type Mode = "text" | "url" | "pdf";

export default function IngestPage() {
  const { publicKey } = useParams<{ publicKey: string }>();
  const { setBreadcrumbMeta } = useBreadcrumb();
  const [mode, setMode] = useState<Mode>("text");
  const [content, setContent] = useState("");
  const [url, setUrl] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [chunks, setChunks] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");

  async function ingest() {
    setLoading(true);
    setError(null);
    setProgress(0);
    setStatus("Initializing...");

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return prev;
        const remaining = 95 - prev;
        const jump = Math.max(1, Math.floor(remaining / 10)); // Slows down as it gets closer
        return prev + jump;
      });
    }, 800);

    try {
      const session = await supabase.auth.getSession();

      if (mode === "text") {
        setStatus("Processing content...");
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ingest`, {
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
        setProgress(100);
        setStatus("Finalized!");
        setSuccess(true);
      }

      if (mode === "url") {
        setStatus("Crawling website...");
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/ingest-url`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.data.session?.access_token}`,
            },
            body: JSON.stringify({
              publicKey,
              url,
            }),
          },
        );

        const data = await res.json();

        if (data.alreadyCrawled) {
          setError("⚠ This URL was already crawled earlier.");
          setLoading(false);
          clearInterval(progressInterval);
          return;
        }

        if (!res.ok) {
          throw new Error(data.error || "URL ingest failed");
        }

        setStatus("Saving knowledge...");
        setProgress(100);
        setChunks(data.chunksIngested);
        setSuccess(true);
      }
      if (mode === "pdf") {
        if (!pdfFile) throw new Error("Please select a PDF");
        setStatus("Uploading PDF...");

        const form = new FormData();
        form.append("file", pdfFile);
        form.append("publicKey", publicKey);

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/ingest-pdf`,
          {
            method: "POST",
            body: form,
          },
        );

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "PDF ingest failed");

        setStatus("Extracting data...");
        setProgress(100);
        setChunks(data.chunks);
        setSuccess(true);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Something went wrong");
      }
    } finally {
      clearInterval(progressInterval);
      setLoading(false);
    }
  }

  const getEngagementMessage = (pct: number) => {
    if (pct === 0) return "Waking up the engine...";
    if (pct < 15) return "Starting the ingestion process...";
    if (pct < 35) return "Scanning and analyzing content...";
    if (pct < 55) return "Stay with us, we're halfway there!";
    if (pct < 75) return "Processing knowledge chunks...";
    if (pct < 90) return "Almost done, finalizing everything...";
    if (pct < 100) return "Wrapping up for a perfect finish...";
    return "Success! Knowledge ingested successfully.";
  };
  useEffect(() => {
    const fetchBotName = async () => {
      const { data } = await supabase
        .from("bots")
        .select("name")
        .eq("public_key", publicKey)
        .single();

      if (data?.name) {
        setBreadcrumbMeta({
          customLabels: { [publicKey]: data.name },
          nonLinkable: [publicKey],
        });
      }
    };

    fetchBotName();
  }, [publicKey]);

  return (
    <NewBotContainer>
      <NewBotWrapper>
        <NewBotTitle>Ingest Knowledge</NewBotTitle>
        {!success && (
          <TabContainer>
            <TabButton
              $isActive={mode === "text"}
              onClick={() => setMode("text")}
            >
              Text Ingest
            </TabButton>
            <TabButton
              $isActive={mode === "url"}
              onClick={() => setMode("url")}
            >
              URL Ingest
            </TabButton>
            <TabButton
              $isActive={mode === "pdf"}
              onClick={() => setMode("pdf")}
            >
              PDF
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

        {!success && mode === "pdf" && (
          <FormSection>
            <FileUploadZone>
              <CloudArrowUpIcon size={32} color="#A8E10C" />
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                style={{ display: "none" }}
              />
              {pdfFile ? (
                <strong>{pdfFile.name}</strong>
              ) : (
                <>
                  <strong>Choose a PDF file</strong>
                  <span>or drag and drop here</span>
                </>
              )}
            </FileUploadZone>
            <SubmitButton onClick={ingest} disabled={loading || !pdfFile}>
              {loading ? "Uploading..." : "Ingest PDF"}
            </SubmitButton>
          </FormSection>
        )}

        {loading && (
          <ProgressWrapper>
            <CircularProgressBox>
              <SvgCircle>
                <ProgressCircleBg cx="60" cy="60" r="54" />
                <ProgressCircleFill cx="60" cy="60" r="54" $percent={progress} />
              </SvgCircle>
              <PercentageText>
                {progress}
                <span>%</span>
              </PercentageText>
            </CircularProgressBox>

            <AnimatePresence mode="wait">
              <motion.div
                key={getEngagementMessage(progress)}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
              >
                <StatusLabel>{getEngagementMessage(progress)}</StatusLabel>
              </motion.div>
            </AnimatePresence>

            <ProgressSubText>
              Please wait, we are building your bot&apos;s brain...
            </ProgressSubText>
          </ProgressWrapper>
        )}

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
