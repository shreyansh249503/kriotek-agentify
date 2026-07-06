"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Page,
  Layout,
  Card,
  DataTable,
  Spinner,
  InlineStack,
  Text,
  BlockStack,
  EmptyState,
  Banner,
} from "@shopify/polaris";
import { useSessionToken } from "../lib/useSessionToken";

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  created_at: string;
}

export default function LeadsPage() {
  const router = useRouter();
  const { fetchWithToken } = useSessionToken();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchWithToken("/api/shopify/admin/leads")
      .then((r) => {
        if (r.status === 401) {
          setUnauthorized(true);
          return null;
        }
        return r.json();
      })
      .then((data) => {
        if (data) setLeads(data.leads ?? []);
      })
      .catch((e) => console.error("Error loading leads:", e))
      .finally(() => setLoading(false));
  }, [fetchWithToken]);

  async function handleExport() {
    setExporting(true);

    // Build CSV from leads data
    const headers = ["Name", "Email", "Phone", "Date"];
    const rows = leads.map((l) => [
      l.name || "",
      l.email || "",
      l.phone || "",
      new Date(l.created_at).toLocaleDateString(),
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "agentify-leads.csv";
    a.click();
    URL.revokeObjectURL(url);
    setExporting(false);
  }

  const rows = leads.map((lead) => [
    lead.name || "—",
    lead.email || "—",
    lead.phone || "—",
    new Date(lead.created_at).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
  ]);

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
        title="Leads"
        backAction={{ content: "Dashboard", onAction: () => router.push("/admin/shopify") }}
      >
        <Layout>
          <Layout.Section>
            <Banner
              title="Shopify App Bridge Required"
              tone="warning"
            >
              <p>
                This leads viewer can only be accessed within the Shopify Admin portal iframe. 
                Please open your Shopify store admin and navigate to <strong>Apps &rarr; Agentify</strong> to manage your chatbot.
              </p>
            </Banner>
          </Layout.Section>
        </Layout>
      </Page>
    );
  }

  return (
    <Page
      title="Leads"
      backAction={{ content: "Dashboard", onAction: () => router.push("/admin/shopify") }}
      primaryAction={
        leads.length > 0
          ? { content: "Export CSV", onAction: handleExport, loading: exporting }
          : undefined
      }
    >
      <Layout>
        <Layout.Section>
          {leads.length === 0 ? (
            <Card>
              <EmptyState
                heading="No leads yet"
                image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
                action={{ content: "Configure Bot Settings", onAction: () => router.push("/admin/shopify/bot") }}
              >
                <p>
                  Leads will appear here once customers share their contact
                  details with your chatbot. Make sure Lead Capture is enabled.
                </p>
              </EmptyState>
            </Card>
          ) : (
            <Card>
              <BlockStack gap="400">
                <InlineStack align="space-between">
                  <Text variant="headingMd" as="h2">
                    {leads.length} lead{leads.length !== 1 ? "s" : ""} captured
                  </Text>
                </InlineStack>
                <DataTable
                  columnContentTypes={["text", "text", "text", "text"]}
                  headings={["Name", "Email", "Phone", "Date"]}
                  rows={rows}
                />
              </BlockStack>
            </Card>
          )}
        </Layout.Section>
      </Layout>
    </Page>
  );
}
