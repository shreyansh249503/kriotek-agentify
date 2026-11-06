"use client";

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
  Button,
  DropZone,
  Thumbnail,
} from "@shopify/polaris";
import { BotPreview } from "@/components";
import { useBotConfig } from "./useBotConfig";
import { useLogoUpload } from "./useLogoUpload";

const TONE_OPTIONS = [
  { label: "Friendly", value: "friendly" },
  { label: "Professional", value: "professional" },
  { label: "Casual", value: "casual" },
  { label: "Formal", value: "formal" },
];

export default function BotConfigPage() {
  const router = useRouter();
  const {
    config,
    loading,
    unauthorized,
    saving,
    banner,
    setBanner,
    update,
    handleSave,
  } = useBotConfig();

  const { uploadingLogo, handleLogoUpload } = useLogoUpload({
    update,
    setBanner,
  });


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
          <Layout.Section>
            <BlockStack gap="500">
              <Card>
                <BlockStack gap="400">
                  <Text variant="headingMd" as="h2">General</Text>
                  <FormLayout>
                    {config.public_key && (
                      <TextField
                        label="Bot Public Key"
                        value={config.public_key}
                        readOnly
                        autoComplete="off"
                      />
                    )}
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
                    <div>
                      <Text as="p" variant="bodyMd">
                        Bot Avatar
                      </Text>
                      <div style={{ marginTop: "8px" }}>
                        {config.logo_url ? (
                          <InlineStack gap="400" align="start">
                            <Thumbnail
                              source={config.logo_url}
                              alt="Bot Avatar"
                              size="large"
                            />
                            <BlockStack gap="200">
                              <Text as="p" variant="bodySm" tone="subdued">
                                Recommended: Square image, max 1MB.
                              </Text>
                              <Button
                                tone="critical"
                                variant="plain"
                                onClick={() => update("logo_url", "")}
                              >
                                Remove Logo
                              </Button>
                            </BlockStack>
                          </InlineStack>
                        ) : (
                          <DropZone
                            accept="image/*"
                            type="file"
                            onDrop={handleLogoUpload}
                            disabled={uploadingLogo}
                          >
                            <DropZone.FileUpload actionTitle={uploadingLogo ? "Uploading logo..." : "Upload logo"} actionHint="Accepts .png, .jpg, .svg, .webp" />
                          </DropZone>
                        )}
                      </div>
                    </div>
                  </FormLayout>
                </BlockStack>
              </Card>

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
            </BlockStack>
          </Layout.Section>

          <Layout.Section variant="oneThird">
            <BotPreview  
              name={config.name}
              color={config.primary_color.startsWith("#") ? config.primary_color : `#${config.primary_color}`}
              tone={config.tone}
              contactEnabled={config.contact_enabled}
              contactPrompt={config.contact_prompt}
              logoUrl={config.logo_url || ""}
            />
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}
