"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  NewBotContainer,
  NewBotWrapper,
  TextArea,
  Input,
  SubmitButton,
  FileUploadZone,
  ProgressWrapper,
  CircularProgressBox,
  SvgCircle,
  ProgressCircleBg,
  ProgressCircleFill,
  PercentageText,
  StatusLabel,
  ProgressSubText,
  SourceSection,
  SectionHeader,
  SectionTitle,
  SectionDesc,
  ResultSummary,
  ResultItem,
  UrlSectionWrapper,
  ResultSectionWrapper,
  SourceSectionWrapper,
} from "./styled";
import {
  CloudArrowUpIcon,
  GlobeIcon,
  TextAaIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@phosphor-icons/react";
import { EmbedSuccess } from "@/components";
import { useBreadcrumb } from "@/context/BreadcrumbContext";
import { motion, AnimatePresence } from "framer-motion";
import { COLOR } from "@/styles";
import { Snackbar, Alert } from "@mui/material";

export default function IngestPage() {
  const { publicKey } = useParams<{ publicKey: string }>();
  const { setBreadcrumbMeta } = useBreadcrumb();
  const [content, setContent] = useState("");
  const [url, setUrl] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [results, setResults] = useState<{
    text?: { success: boolean; chunks?: number; error?: string };
    url?: { success: boolean; chunks?: number; error?: string };
    pdf?: { success: boolean; chunks?: number; error?: string };
  }>({});

  async function ingest() {
    if (!content && !url && !pdfFile) {
      setError("Please provide at least one source (Text, URL, or PDF)");
      return;
    }

    setLoading(true);
    setError(null);
    setProgress(0);
    setResults({});
    setStatus("Initializing engine...");

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return prev;
        const remaining = 95 - prev;
        const jump = Math.max(1, Math.floor(remaining / 10));
        return prev + jump;
      });
    }, 800);

    try {
      const session = await supabase.auth.getSession();
      const accessToken = session.data.session?.access_token;
      const tasks: Promise<void>[] = [];

      // 1. Text Ingest
      if (content.trim()) {
        tasks.push(
          (async () => {
            try {
              const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/ingest`,
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                  },
                  body: JSON.stringify({ publicKey, content }),
                },
              );
              if (!res.ok) throw new Error("Text ingest failed");
              setResults((prev) => ({
                ...prev,
                text: { success: true },
              }));
            } catch (err: any) {
              setResults((prev) => ({
                ...prev,
                text: { success: false, error: err.message },
              }));
            }
          })(),
        );
      }

      // 2. URL Ingest
      if (url.trim()) {
        tasks.push(
          (async () => {
            try {
              const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/ingest-url`,
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                  },
                  body: JSON.stringify({ publicKey, url }),
                },
              );
              const data = await res.json();
              if (data.alreadyCrawled) throw new Error("Already crawled");
              if (!res.ok) throw new Error(data.error || "URL ingest failed");
              setResults((prev) => ({
                ...prev,
                url: { success: true, chunks: data.chunksIngested },
              }));
            } catch (err: any) {
              setResults((prev) => ({
                ...prev,
                url: { success: false, error: err.message },
              }));
            }
          })(),
        );
      }

      // 3. PDF Ingest
      if (pdfFile) {
        tasks.push(
          (async () => {
            try {
              const form = new FormData();
              form.append("file", pdfFile);
              form.append("publicKey", publicKey);

              const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/ingest-pdf`,
                { method: "POST", body: form },
              );
              const data = await res.json();
              if (!res.ok) throw new Error(data.error || "PDF ingest failed");
              setResults((prev) => ({
                ...prev,
                pdf: { success: true, chunks: data.chunks },
              }));
            } catch (err: any) {
              setResults((prev) => ({
                ...prev,
                pdf: { success: false, error: err.message },
              }));
            }
          })(),
        );
      }

      await Promise.all(tasks);
      clearInterval(progressInterval);
      setProgress(100);
      await new Promise((resolve) => setTimeout(resolve, 800));
      setSuccess(true);
      setLoading(false);

    } catch (err: unknown) {
      clearInterval(progressInterval);
      setLoading(false);
      if (err instanceof Error) setError(err.message);
      else setError("Something went wrong");
    }
  }

  const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === "clickaway") {
      return;
    }
    setError(null);
  };

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
        {!success && !loading && (
          <>
          <SourceSectionWrapper>
              {/* TEXT SECTION */}
              <SourceSection>
                <SectionHeader>
                  <TextAaIcon size={24} color={COLOR.PRIMARY} weight="fill" />
                  <SectionTitle>Ingest Raw Text</SectionTitle>
                </SectionHeader>
                <SectionDesc>
                  Paste text, FAQs, or any documentation you want your bot to
                  learn from.
                </SectionDesc>
                <TextArea
                  rows={8}
                  placeholder="Types or paste content here..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
              </SourceSection>

              {/* PDF SECTION */}
              <SourceSection>
                <SectionHeader>
                  <CloudArrowUpIcon
                    size={24}
                    color={COLOR.PRIMARY}
                    weight="fill"
                  />
                  <SectionTitle>Ingest PDF Document</SectionTitle>
                </SectionHeader>
                <SectionDesc>
                  Upload a PDF file to extract knowledge from documents.
                </SectionDesc>
                <FileUploadZone>
                  <CloudArrowUpIcon size={32} color={COLOR.PRIMARY} />
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
              </SourceSection>
          </SourceSectionWrapper>

            {/* URL SECTION */}

            <UrlSectionWrapper>
              <SectionHeader>
                <GlobeIcon size={24} color={COLOR.PRIMARY} weight="fill" />
                <SectionTitle>Ingest Website URL</SectionTitle>
              </SectionHeader>
              <SectionDesc>
                Provide a website URL for the bot to crawl and learn from.
              </SectionDesc>
              <Input
                type="text"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </UrlSectionWrapper>



            <SubmitButton onClick={ingest} disabled={loading}>
              Ingest All Selected Sources
            </SubmitButton>
          </>
        )}

      <NewBotWrapper>
      {loading && (
          <SourceSection>
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
          </SourceSection>
      )}

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <Alert
          onClose={handleClose}
          severity="error"
          variant="filled"
            sx={{
              width: "100%",
              backgroundColor: "#FFF7C7",
              color: "#a0630e",
              border: "1px solid #a0630e",
              borderRadius: "8px",
              padding: "6px 16px",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              fontWeight: 500,
              fontSize:"16px"
            }}
        >
          {error}
        </Alert>
      </Snackbar>

      {success && (
        <NewBotWrapper>

          <ResultSectionWrapper>
            <ResultSummary>
              <SectionTitle style={{ marginBottom: 16 }}>
                Ingestion Results
              </SectionTitle>

              {results.text && (
                <ResultItem $success={results.text.success}>
                  {results.text.success ? (
                    <CheckCircleIcon size={20} color="#10b981" weight="fill" />
                  ) : (
                    <XCircleIcon size={20} color="#ef4444" weight="fill" />
                  )}
                  <span>
                    Text Ingest:{" "}
                    {results.text.success ? "Successfully learned" : "Failed"}
                  </span>
                </ResultItem>
              )}

              {results.url && (
                <ResultItem $success={results.url.success}>
                  {results.url.success ? (
                    <CheckCircleIcon size={20} color="#10b981" weight="fill" />
                  ) : (
                    <XCircleIcon size={20} color="#ef4444" weight="fill" />
                  )}
                  <span>
                    URL Crawl:{" "}
                    {results.url.success
                      ? `Learned from ${results.url.chunks} chunks`
                      : results.url.error}
                  </span>
                </ResultItem>
              )}

              {results.pdf && (
                <ResultItem $success={results.pdf.success}>
                  {results.pdf.success ? (
                    <CheckCircleIcon size={20} color="#10b981" weight="fill" />
                  ) : (
                    <XCircleIcon size={20} color="#ef4444" weight="fill" />
                  )}
                  <span>
                    PDF Upload:{" "}
                    {results.pdf.success
                      ? `Processed into ${results.pdf.chunks} chunks`
                      : results.pdf.error}
                  </span>
                </ResultItem>
              )}
            </ResultSummary>

            <EmbedSuccess publicKey={publicKey} />
          </ResultSectionWrapper>
        </NewBotWrapper>
      )}
      </NewBotWrapper>
    </NewBotContainer>
  );
}
