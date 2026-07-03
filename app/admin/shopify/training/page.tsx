// app/admin/shopify/training/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Page,
  Layout,
  Card,
  TextField,
  Button,
  Banner,
  BlockStack,
  InlineStack,
  Text,
  Badge,
  DropZone,
  Spinner,
  List,
} from "@shopify/polaris";
import { useSessionToken } from "../lib/useSessionToken";

interface CrawledPage {
  id: string;
  page_url: string;
}

export default function TrainingPage() {
  const router = useRouter();
  const { fetchWithToken } = useSessionToken();
  const [botId, setBotId] = useState<string | null>(null);
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [crawledPages, setCrawledPages] = useState<CrawledPage[]>([]);
  const [url, setUrl] = useState("");
  const [crawling, setCrawling] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [banner, setBanner] = useState<{
    tone: "success" | "critical" | "info";
    message: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);

  const fetchBotData = useCallback(() => {
    fetchWithToken("/api/shopify/admin/bot")
      .then((r) => {
        if (r.status === 401) {
          setUnauthorized(true);
          return null;
        }
        return r.json();
      })
      .then((data) => {
        if (data) {
          if (data.bot) {
            setBotId(data.bot.id);
            setPublicKey(data.bot.public_key);
          }
          setCrawledPages(data.crawled_pages || []);
        }
      })
      .catch((e) => console.error("Error loading training details:", e))
      .finally(() => setLoading(false));
  }, [fetchWithToken]);

  useEffect(() => {
    fetchBotData();
  }, [fetchBotData]);

  async function handleCrawl() {
    if (!url || !publicKey) return;
    setCrawling(true);
    setBanner(null);

    try {
      const res = await fetchWithToken("/api/shopify/admin/ingest-url", {
        method: "POST",
        body: JSON.stringify({ url }),
      });

      const data = await res.json();
      if (res.ok) {
        setBanner({
          tone: "success",
          message: data.alreadyCrawled 
            ? "This URL was already crawled." 
            : `Crawled website successfully (indexed ${data.chunksIngested} content chunks).`,
        });
        setUrl("");
        fetchBotData();
      } else {
        setBanner({ tone: "critical", message: data.error || "Crawl failed. Check the URL and try again." });
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : String(e);
      setBanner({ tone: "critical", message: `Crawling failed: ${errorMessage}` });
    } finally {
      setCrawling(false);
    }
  }

  const handleDropZoneDrop = useCallback(
    (_dropFiles: File[], acceptedFiles: File[], _rejectedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        setFile(acceptedFiles[0]);
      }
    },
    []
  );

  async function handlePdfUpload() {
    if (!file || !publicKey) return;
    setUploading(true);
    setBanner(null);

    const formData = new FormData();
    formData.append("file", file); // Must match backend expectation of 'file'
    formData.append("publicKey", publicKey); // Must match backend expectation of 'publicKey'

    try {
      const res = await fetch("/api/ingest-pdf", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok && data.status === "ok") {
        setBanner({ tone: "success", message: `"${file.name}" uploaded and indexed successfully (${data.chunks} chunks).` });
        setFile(null);
      } else {
        setBanner({ tone: "critical", message: data.error || "PDF upload failed. Try again." });
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : String(e);
      setBanner({ tone: "critical", message: `Upload failed: ${errorMessage}` });
    } finally {
      setUploading(false);
    }
  }

  if (loading) {
    return (
      <Page>
        <InlineStack align="center">
          <div style={{ marginTop: "100px" }}>
            <Spinner size="large" />
          </div>
        </InlineStack>
      </Page>
    );
  }

  if (unauthorized) {
    return (
      <Page 
        title="Training data"
        backAction={{ content: "Dashboard", onAction: () => router.push("/admin/shopify") }}
      >
        <Layout>
          <Layout.Section>
            <Banner
              title="Shopify App Bridge Required"
              tone="warning"
            >
              <p>
                This training data manager can only be accessed within the Shopify Admin portal iframe. 
                Please open your Shopify store admin and navigate to <strong>Apps &rarr; Agentify</strong> to manage your chatbot.
              </p>
            </Banner>
          </Layout.Section>
        </Layout>
      </Page>
    );
  }

  const fileUploadMarkup = file ? (
    <BlockStack gap="200">
      <InlineStack align="space-between">
        <Text as="p" variant="bodyMd">
          {file.name}{" "}
          <Text as="span" variant="bodySm" tone="subdued">
            ({Math.round(file.size / 1024)} KB)
          </Text>
        </Text>
        <Button variant="plain" tone="critical" onClick={() => setFile(null)}>
          Remove
        </Button>
      </InlineStack>
      <Button 
        variant="primary" 
        onClick={handlePdfUpload} 
        loading={uploading}
      >
        Upload PDF
      </Button>
    </BlockStack>
  ) : (
    <DropZone accept="application/pdf" type="file" onDrop={handleDropZoneDrop}>
      <DropZone.FileUpload actionHint="Accepts .pdf files only" />
    </DropZone>
  );

  return (
    <Page
      title="Training data"
      backAction={{ content: "Dashboard", onAction: () => router.push("/admin/shopify") }}
    >
      <BlockStack gap="500">
        {banner && (
          <Banner tone={banner.tone} onDismiss={() => setBanner(null)}>
            {banner.message}
          </Banner>
        )}

        <Layout>
          {/* Crawl URL section */}
          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <Text variant="headingMd" as="h2">Crawl Website URL</Text>
                <InlineStack gap="300">
                  <div style={{ flex: 1 }}>
                    <TextField
                      label="Website URL"
                      labelHidden
                      placeholder="https://example.com/about"
                      value={url}
                      onChange={setUrl}
                      disabled={crawling}
                      autoComplete="off"
                    />
                  </div>
                  <Button 
                    variant="primary" 
                    onClick={handleCrawl} 
                    loading={crawling}
                    disabled={!url}
                  >
                    Crawl URL
                  </Button>
                </InlineStack>
                <Text as="p" tone="subdued" variant="bodySm">
                  Enter any webpage URL (such as FAQ page, policy pages) to extract and train your AI assistant on it.
                </Text>
              </BlockStack>
            </Card>
          </Layout.Section>

          {/* Upload PDF Section */}
          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <Text variant="headingMd" as="h2">Upload PDF Document</Text>
                {fileUploadMarkup}
                <Text as="p" tone="subdued" variant="bodySm">
                  Upload brochures, product manuals, or company guides in PDF format to train the chatbot.
                </Text>
              </BlockStack>
            </Card>
          </Layout.Section>

          {/* Crawled Pages Catalog */}
          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <InlineStack align="space-between">
                  <Text variant="headingMd" as="h2">Crawled Pages</Text>
                  <Badge tone={crawledPages.length > 0 ? "success" : "attention"}>
                    {`${crawledPages.length} active page(s)`}
                  </Badge>
                </InlineStack>
                {crawledPages.length === 0 ? (
                  <Text as="p" tone="subdued">No crawled pages yet. Use the tool above to add some website training data.</Text>
                ) : (
                  <List>
                    {crawledPages.map((page) => (
                      <List.Item key={page.id}>
                        <a href={page.page_url} target="_blank" rel="noopener noreferrer" style={{ color: "#008060", textDecoration: "none" }}>
                          {page.page_url}
                        </a>
                      </List.Item>
                    ))}
                  </List>
                )}
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}
