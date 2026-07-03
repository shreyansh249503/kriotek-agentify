// app/admin/shopify/bot/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Page,
  Layout,
  Card,
  FormLayout,
  TextField,
  Select,
  Checkbox,
  Banner,
  BlockStack,
  Spinner,
  InlineStack,
  Text,
} from "@shopify/polaris";
import { useSessionToken } from "../lib/useSessionToken";

interface BotConfig {
  id: string;
  name: string;
  description: string;
  tone: string;
  primary_color: string;
  contact_enabled: boolean;
  contact_email: string;
  contact_prompt: string;
  ecommerce_enabled: boolean;
  ecommerce_prompt: string;
}

const TONE_OPTIONS = [
  { label: "Friendly", value: "friendly" },
  { label: "Professional", value: "professional" },
  { label: "Casual", value: "casual" },
  { label: "Formal", value: "formal" },
];

export default function BotConfigPage() {
  const router = useRouter();
  const { fetchWithToken } = useSessionToken();
  const [config, setConfig] = useState<BotConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);
  const [saving, setSaving] = useState(false);
  const [banner, setBanner] = useState<{
    tone: "success" | "critical";
    message: string;
  } | null>(null);

  useEffect(() => {
    fetchWithToken("/api/shopify/admin/bot")
      .then((r) => {
        if (r.status === 401) {
          setUnauthorized(true);
          return null;
        }
        return r.json();
      })
      .then((data) => {
        if (data && data.bot) {
          setConfig(data.bot);
        }
      })
      .catch((e) => console.error("Error loading bot config:", e))
      .finally(() => setLoading(false));
  }, [fetchWithToken]);

  function update<K extends keyof BotConfig>(field: K, value: BotConfig[K]) {
    setConfig((prev) => prev ? { ...prev, [field]: value } : prev);
  }

  async function handleSave() {
    if (!config) return;
    setSaving(true);
    setBanner(null);

    try {
      const res = await fetchWithToken("/api/shopify/admin/bot", {
        method: "PATCH",
        body: JSON.stringify(config),
      });

      if (res.ok) {
        setBanner({ tone: "success", message: "Bot configuration saved successfully." });
      } else {
        setBanner({ tone: "critical", message: "Failed to save configuration. Try again." });
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      setBanner({ tone: "critical", message: `Save error: ${message}` });
    } finally {
      setSaving(false);
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
        title="Bot configuration"
        backAction={{ content: "Dashboard", onAction: () => router.push("/admin/shopify") }}
      >
        <Layout>
          <Layout.Section>
            <Banner
              title="Shopify App Bridge Required"
              tone="warning"
            >
              <p>
                This configuration editor can only be accessed within the Shopify Admin portal iframe. 
                Please open your Shopify store admin and navigate to <strong>Apps &rarr; Agentify</strong> to manage your chatbot.
              </p>
            </Banner>
          </Layout.Section>
        </Layout>
      </Page>
    );
  }

  if (!config) {
    return (
      <Page 
        title="Bot configuration"
        backAction={{ content: "Dashboard", onAction: () => router.push("/admin/shopify") }}
      >
        <Banner tone="warning" title="No bot found">
          <p>Go back to the dashboard to set up your bot first.</p>
        </Banner>
      </Page>
    );
  }

  return (
    <Page
      title="Bot configuration"
      backAction={{ content: "Dashboard", onAction: () => router.push("/admin/shopify") }}
      primaryAction={{
        content: "Save",
        onAction: handleSave,
        loading: saving,
      }}
    >
      <BlockStack gap="500">
        {banner && (
          <Banner tone={banner.tone} onDismiss={() => setBanner(null)}>
            {banner.message}
          </Banner>
        )}

        <Layout>
          {/* General settings */}
          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <Text variant="headingMd" as="h2">General</Text>
                <FormLayout>
                  <TextField
                    label="Bot name"
                    value={config.name}
                    onChange={(v) => update("name", v)}
                    autoComplete="off"
                  />
                  <TextField
                    label="Description"
                    value={config.description || ""}
                    onChange={(v) => update("description", v)}
                    multiline={3}
                    helpText="Tell the bot what your store sells and how it should help customers."
                    autoComplete="off"
                  />
                  <Select
                    label="Tone"
                    options={TONE_OPTIONS}
                    value={config.tone}
                    onChange={(v) => update("tone", v)}
                  />
                  <TextField
                    label="Brand color"
                    value={config.primary_color}
                    onChange={(v) => update("primary_color", v)}
                    helpText="Hex code e.g. #6C47FF"
                    autoComplete="off"
                    prefix="#"
                  />
                </FormLayout>
              </BlockStack>
            </Card>
          </Layout.Section>

          {/* Lead capture settings */}
          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <Text variant="headingMd" as="h2">Lead capture</Text>
                <FormLayout>
                  <Checkbox
                    label="Enable lead capture"
                    checked={config.contact_enabled}
                    onChange={(v) => update("contact_enabled", v)}
                  />
                  {config.contact_enabled && (
                    <>
                      <TextField
                        label="Notification email"
                        value={config.contact_email || ""}
                        onChange={(v) => update("contact_email", v)}
                        helpText="You'll receive an email when a lead is captured."
                        type="email"
                        autoComplete="email"
                      />
                      <TextField
                        label="Lead capture prompt"
                        value={config.contact_prompt || ""}
                        onChange={(v) => update("contact_prompt", v)}
                        helpText="What the bot says when asking for the customer's details."
                        multiline={2}
                        autoComplete="off"
                      />
                    </>
                  )}
                </FormLayout>
              </BlockStack>
            </Card>
          </Layout.Section>

          {/* E-commerce settings */}
          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <Text variant="headingMd" as="h2">E-commerce</Text>
                <FormLayout>
                  <Checkbox
                    label="Enable product recommendations"
                    checked={config.ecommerce_enabled}
                    onChange={(v) => update("ecommerce_enabled", v)}
                  />
                  {config.ecommerce_enabled && (
                    <TextField
                      label="Sales prompt"
                      value={config.ecommerce_prompt || ""}
                      onChange={(v) => update("ecommerce_prompt", v)}
                      helpText="Instructions for how the bot should recommend products."
                      multiline={3}
                      autoComplete="off"
                    />
                  )}
                </FormLayout>
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}
