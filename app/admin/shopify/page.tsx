"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Page,
  Layout,
  Card,
  Text,
  Button,
  Badge,
  BlockStack,
  InlineStack,
  Banner,
  Spinner,
} from "@shopify/polaris";
import { useSessionToken } from "./lib/useSessionToken";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

interface ShopifyProduct {
  shopify_id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  image_url: string | null;
  url: string;
  available: boolean;
}

interface DashboardData {
  bot: {
    id: string;
    name: string;
    ecommerce_enabled: boolean;
    ecommerce_products: ShopifyProduct[];
  } | null;
  stats: {
    total_conversations: number;
    total_leads: number;
    products_synced: number;
  };
  trend?: {
    month: string;
    conversations: number;
    leads: number;
  }[];
  shop: string;
}

export default function ShopifyDashboard() {
  const router = useRouter();
  const { fetchWithToken } = useSessionToken();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState("");

  useEffect(() => {
    fetchWithToken("/api/shopify/admin/dashboard")
      .then((r) => {
        if (r.status === 401) {
          setUnauthorized(true);
          return null;
        }
        return r.json();
      })
      .then((res) => {
        if (res) setData(res);
      })
      .catch((e) => {
        console.error("Dashboard error:", e);
      })
      .finally(() => setLoading(false));
  }, [fetchWithToken]);

  async function handleSync() {
    if (!data?.bot || !data?.shop) return;
    setSyncing(true);
    setSyncMessage("");

    try {
      const res = await fetchWithToken("/api/shopify/sync", {
        method: "POST",
        body: JSON.stringify({ shop: data.shop, bot_id: data.bot.id }),
      });

      const result = await res.json();
      if (res.ok) {
        setSyncMessage(`Synced ${result.synced} products successfully.`);
      } else {
        setSyncMessage(`Sync failed: ${result.error || "Unknown error"}`);
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : String(e);
      setSyncMessage(`Sync error: ${errorMessage}`);
    } finally {
      setSyncing(false);
      fetchWithToken("/api/shopify/admin/dashboard")
        .then((r) => r.json())
        .then(setData);
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
      <Page title="Agentify">
        <Layout>
          <Layout.Section>
            <Banner
              title="Shopify App Bridge Required"
              tone="warning"
            >
              <p>
                This dashboard can only be accessed within the Shopify Admin portal iframe. 
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
      title="Agentify Dashboard"
      subtitle="Your AI sales and support assistant"
      primaryAction={
        data?.bot
          ? { content: "Sync products", onAction: handleSync, loading: syncing }
          : undefined
      }
    >
      <BlockStack gap="500">

        {syncMessage && (
          <Banner 
            tone={syncMessage.includes("failed") || syncMessage.includes("error") ? "critical" : "success"} 
            onDismiss={() => setSyncMessage("")}
          >
            {syncMessage}
          </Banner>
        )}

        {!data?.bot && (
          <Banner tone="warning" title="No bot configured yet">
            <p>Set up your first bot to start capturing leads and recommending products.</p>
          </Banner>
        )}

        <Layout>
          <Layout.Section variant="oneThird">
            <Card>
              <BlockStack gap="200">
                <Text variant="headingMd" as="h2">Conversations</Text>
                <Text variant="heading2xl" as="p">
                  {data?.stats.total_conversations ?? 0}
                </Text>
              </BlockStack>
            </Card>
          </Layout.Section>

          <Layout.Section variant="oneThird">
            <Card>
              <BlockStack gap="200">
                <Text variant="headingMd" as="h2">Leads captured</Text>
                <Text variant="heading2xl" as="p">
                  {data?.stats.total_leads ?? 0}
                </Text>
              </BlockStack>
            </Card>
          </Layout.Section>

          <Layout.Section variant="oneThird">
            <Card>
              <BlockStack gap="200">
                <Text variant="headingMd" as="h2">Products synced</Text>
                <Text variant="heading2xl" as="p">
                  {data?.stats.products_synced ?? 0}
                </Text>
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>

        {data?.trend && data.trend.length > 0 && (
          <Layout>
            <Layout.Section>
              <Card>
                <BlockStack gap="400">
                  <Text variant="headingMd" as="h2">Performance trends</Text>
                  <div style={{ height: "300px", marginTop: "16px" }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={data.trend}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient id="colorConvos" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                        <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#6b7280" }} />
                        <YAxis tick={{ fontSize: 12, fill: "#6b7280" }} />
                        <Tooltip />
                        <Legend />
                        <Area
                          type="monotone"
                          dataKey="conversations"
                          name="Conversations"
                          stroke="#4f46e5"
                          fillOpacity={1}
                          fill="url(#colorConvos)"
                          strokeWidth={2}
                        />
                        <Area
                          type="monotone"
                          dataKey="leads"
                          name="Leads Captured"
                          stroke="#10b981"
                          fillOpacity={1}
                          fill="url(#colorLeads)"
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </BlockStack>
              </Card>
            </Layout.Section>
          </Layout>
        )}

        {data?.bot && (
          <Layout>
            <Layout.Section>
              <Card>
                <BlockStack gap="300">
                  <InlineStack align="space-between">
                    <Text variant="headingMd" as="h2">Bot configuration</Text>
                    <Badge tone="success">Active</Badge>
                  </InlineStack>
                  <Text as="p" variant="bodyMd">
                    <strong>Name:</strong> {data.bot.name}
                  </Text>
                  <Text as="p" variant="bodyMd">
                    <strong>E-commerce:</strong>{" "}
                    {data.bot.ecommerce_enabled ? "Enabled" : "Disabled"}
                  </Text>
                  <InlineStack gap="300">
                    <Button onClick={() => router.push("/admin/shopify/bot")}>Edit bot</Button>
                    <Button onClick={() => router.push("/admin/shopify/leads")}>View leads</Button>
                    <Button onClick={() => router.push("/admin/shopify/training")}>Training data</Button>
                  </InlineStack>
                </BlockStack>
              </Card>
            </Layout.Section>
          </Layout>
        )}

      </BlockStack>
    </Page>
  );
}
