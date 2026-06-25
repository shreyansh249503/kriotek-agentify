import React, { useState } from "react";
import { CreateBotInput, Product } from "@/types/bot";
import { supabase } from "@/lib/supabase";
import { ProductCard } from "./ProductCard";
import {
  FormSection,
  SectionHeader,
  SectionTitle,
  Field,
  ToggleContainer,
  ToggleSwitch,
  HelperText,
  ContactGrid,
  GridFullWidth,
  AutoExtractContainer,
  AutoExtractTitleRow,
  AutoExtractIcon,
  AutoExtractTitle,
  AutoExtractDescription,
  AutoExtractInputRow,
  CrawlInput,
  CrawlButton,
  CrawlStatusMessage,
  CatalogHeaderWrapper,
  Label,
  AddProductButton,
  CatalogProductCardContainer,
  TextArea,
} from "./styled";

interface EcommerceSettingsSectionProps {
  form: CreateBotInput;
  update: <K extends keyof CreateBotInput>(
    key: K,
    value: CreateBotInput[K],
  ) => void;
  publicKey?: string;
}

export const EcommerceSettingsSection = ({
  form,
  update,
  publicKey,
}: EcommerceSettingsSectionProps) => {
  const [crawlUrl, setCrawlUrl] = useState("");
  const [crawlingProducts, setCrawlingProducts] = useState(false);
  const [crawlStatus, setCrawlStatus] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  async function handleCrawlProducts() {
    if (!crawlUrl.trim()) return;

    setCrawlingProducts(true);
    setCrawlStatus("Crawling and extracting products...");

    try {
      const session = await supabase.auth.getSession();
      const accessToken = session.data.session?.access_token;

      const res = await fetch("/api/extract-products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          url: crawlUrl.trim(),
          publicKey: publicKey,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to extract products");
      }

      const extracted = data.products || [];
      if (extracted.length === 0) {
        setCrawlStatus("No products found on this page or category.");
        return;
      }

      const currentProducts = form.ecommerceProducts || [];
      const merged = [...currentProducts];
      let addedCount = 0;

      for (const prod of extracted) {
        const isDup = merged.some(
          (p) =>
            (p.url && p.url === prod.url) ||
            p.name.toLowerCase() === prod.name.toLowerCase(),
        );
        if (!isDup) {
          merged.push(prod);
          addedCount++;
        }
      }

      update("ecommerceProducts", merged);
      setCrawlStatus(
        `Success! Extracted and added ${addedCount} new products to catalog.`,
      );
      setCrawlUrl("");
    } catch (err: unknown) {
      console.error(err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to extract products";
      setCrawlStatus(`Error: ${errorMessage}`);
    } finally {
      setCrawlingProducts(false);
    }
  }

  const hasEmptyProduct = (form.ecommerceProducts || []).some(
    (p) => !p.name?.trim() || !p.price?.trim() || !p.url?.trim()
  );

  const isAddDisabled =
    !form.ecommerceEnabled || editingIndex !== null || hasEmptyProduct;

  const handleAddProduct = () => {
    if (isAddDisabled) return;
    const newProducts = [
      ...(form.ecommerceProducts || []),
      { name: "", price: "", image: "", url: "" },
    ];
    update("ecommerceProducts", newProducts);
    setEditingIndex(newProducts.length - 1);
  };

  const changeEditingIndex = (newIndex: number | null) => {
    const cleaned = (form.ecommerceProducts || []).filter(
      (p, i) =>
        i === newIndex ||
        (p.name?.trim() && p.price?.trim() && p.url?.trim())
    );

    update("ecommerceProducts", cleaned);

    if (newIndex === null) {
      setEditingIndex(null);
    } else {
      const targetProduct = (form.ecommerceProducts || [])[newIndex];
      const actualIndex = cleaned.indexOf(targetProduct);
      setEditingIndex(actualIndex !== -1 ? actualIndex : null);
    }
  };

  const handleUpdateProduct = (idx: number, updatedProduct: Product) => {
    const newProducts = [...(form.ecommerceProducts || [])];
    newProducts[idx] = updatedProduct;
    update("ecommerceProducts", newProducts);
  };

  const handleDeleteProduct = (idx: number) => {
    const filtered = (form.ecommerceProducts || []).filter((_, i) => i !== idx);
    update("ecommerceProducts", filtered);
    if (editingIndex === idx) {
      setEditingIndex(null);
    }
  };

  return (
    <FormSection>
      <SectionHeader>
        <SectionTitle>E-Commerce / Sales Settings</SectionTitle>
      </SectionHeader>

      <Field>
        <ToggleContainer>
          <ToggleSwitch
            checked={form.ecommerceEnabled || false}
            onClick={() => update("ecommerceEnabled", !form.ecommerceEnabled)}
          />
          <span style={{ fontWeight: 600 }}>Enable E-Commerce Mode</span>
        </ToggleContainer>
        <HelperText>
          Allow the bot to pitch products and share checkout links based on the
          conversation.
        </HelperText>
      </Field>

      {form.ecommerceEnabled && (
        <ContactGrid>
          <GridFullWidth>
            <Field>
              <AutoExtractContainer>
                <AutoExtractTitleRow>
                  <AutoExtractIcon
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </AutoExtractIcon>
                  <AutoExtractTitle>
                    Auto-Extract Products from Website URL
                  </AutoExtractTitle>
                </AutoExtractTitleRow>
                <AutoExtractDescription>
                  Provide a product detail page or shop page URL to
                  automatically crawl, extract product details (names, prices,
                  images, links) using metadata and AI, and populate the list
                  below.
                </AutoExtractDescription>
                <AutoExtractInputRow>
                  <CrawlInput
                    type="text"
                    placeholder="https://example.com/shop"
                    value={crawlUrl}
                    onChange={(e) => setCrawlUrl(e.target.value)}
                    disabled={crawlingProducts}
                  />
                  <CrawlButton
                    type="button"
                    onClick={handleCrawlProducts}
                    disabled={crawlingProducts || !crawlUrl.trim()}
                  >
                    {crawlingProducts ? "Extracting..." : "Extract Products"}
                  </CrawlButton>
                </AutoExtractInputRow>
                {crawlStatus && (
                  <CrawlStatusMessage
                    $isError={crawlStatus.startsWith("Error")}
                  >
                    {crawlStatus}
                  </CrawlStatusMessage>
                )}
              </AutoExtractContainer>

              <CatalogHeaderWrapper>
                <Label>Products Catalog</Label>
                <AddProductButton
                  type="button"
                  onClick={handleAddProduct}
                  disabled={isAddDisabled}
                >
                  + Add Product
                </AddProductButton>
              </CatalogHeaderWrapper>
              <CatalogProductCardContainer>
                {(form.ecommerceProducts || []).map((product, idx) => (
                  <ProductCard
                    key={idx}
                    product={product}
                    idx={idx}
                    isEditing={editingIndex === idx}
                    onSave={() => changeEditingIndex(null)}
                    onEdit={() => changeEditingIndex(idx)}
                    onDelete={() => handleDeleteProduct(idx)}
                    onUpdateProduct={(updated) =>
                      handleUpdateProduct(idx, updated)
                    }
                    ecommerceEnabled={!!form.ecommerceEnabled}
                  />
                ))}
              </CatalogProductCardContainer>
            </Field>

            <Field>
              <Label>Sales Instructions</Label>
              <TextArea
                disabled={!form.ecommerceEnabled}
                placeholder="Provide details about any specific convincing strategies the bot should use (e.g., 'Mention we have free shipping on orders over $50')."
                value={form.ecommercePrompt || ""}
                onChange={(e) => update("ecommercePrompt", e.target.value)}
                rows={4}
              />
              <HelperText>
                These instructions will be given to the bot along with the
                product catalog.
              </HelperText>
            </Field>
          </GridFullWidth>
        </ContactGrid>
      )}
    </FormSection>
  );
};
