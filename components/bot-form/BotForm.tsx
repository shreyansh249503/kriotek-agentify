"use client";

import { useState } from "react";
import {
  Form,
  Field,
  Label,
  Input,
  TextArea,
  Button,
  FormSection,
  SectionHeader,
  SectionTitle,
  HelperText,
  ToggleContainer,
  ToggleSwitch,
  FormGrid,
  TopRow,
  FormContainer,
  SideContainer,
  UploadContainer,
  UploadButton,
  RemoveButton,
  LeftContainer,
  ContactGrid,
  CatalogHeaderWrapper,
  AddProductButton,
  CatalogProductCard,
  DeleteProductButton,
  ProductFieldsRow,
  ProductImageWrapper,
  ProductImageThumbnail,
  ProductFileInput,
  SmallLabel,
} from "./styled";
import { CreateBotInput } from "@/types/bot";
import { CustomSelect } from "../custom-select";
import { ColorPicker } from "../color-picker";
import { BotFormProps } from "./type";
import { BotPreview } from "../bot-preview";
import { EmbedSuccess } from "../embed-success";

export const BotForm = ({
  initialData,
  onSubmit,
  submitLabel,
  loading = false,
}: BotFormProps) => {
  const defaultValues: CreateBotInput = {
    name: "",
    description: "",
    tone: "friendly",
    primaryColor: "#4f46e5",
    contactEnabled: false,
    contactEmail: "",
    contactPrompt: "Would you like us to contact you for more details?",
    contactEmailMessage:
      "Thanks for reaching out! Our team will contact you shortly.",
    logoUrl: "",
    ecommerceEnabled: false,
    ecommercePrompt: "",
    ecommerceProducts: [],
  };

  const [form, setForm] = useState<CreateBotInput>(
    initialData
      ? {
        name: initialData.name ?? "",
        description: initialData.description ?? "",
        tone: initialData.tone ?? "friendly",
        primaryColor: initialData.primary_color ?? "#4f46e5",
        contactEnabled: initialData.contact_enabled ?? false,
        contactEmail: initialData.contact_email ?? "",
        contactPrompt:
          initialData.contact_prompt ?? defaultValues.contactPrompt,
        contactEmailMessage:
          initialData.contact_email_message ??
          defaultValues.contactEmailMessage,
        logoUrl: initialData.logo_url ?? "",
        ecommerceEnabled: initialData.ecommerce_enabled ?? false,
        ecommercePrompt: initialData.ecommerce_prompt ?? "",
        ecommerceProducts: initialData.ecommerce_products ?? [],
      }
      : defaultValues,
  );

  const [prevId, setPrevId] = useState(initialData?.id);
  if (initialData?.id !== prevId) {
    setPrevId(initialData?.id);
    if (initialData) {
      setForm({
        name: initialData.name ?? "",
        description: initialData.description ?? "",
        tone: (initialData.tone as CreateBotInput["tone"]) ?? "friendly",
        primaryColor: initialData.primary_color ?? "#4f46e5",
        contactEnabled: initialData.contact_enabled ?? false,
        contactEmail: initialData.contact_email ?? "",
        contactPrompt:
          initialData.contact_prompt ??
          "Would you like us to contact you for more details?",
        contactEmailMessage:
          initialData.contact_email_message ??
          "Thanks for reaching out! Our team will contact you shortly.",
        logoUrl: initialData.logo_url ?? "",
        ecommerceEnabled: initialData.ecommerce_enabled ?? false,
        ecommercePrompt: initialData.ecommerce_prompt ?? "",
        ecommerceProducts: initialData.ecommerce_products ?? [],
      });
    } else {
      setForm(defaultValues);
    }
  }

  function update<K extends keyof CreateBotInput>(
    key: K,
    value: CreateBotInput[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  const [uploading, setUploading] = useState(false);

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
      alert("File is too large. Max size is 1MB.");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.url) {
        update("logoUrl", data.url);
      } else {
        alert(data.error || "Upload failed");
      }
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await onSubmit(form);
  }

  return (
    <Form onSubmit={handleSubmit}>
      <FormContainer>
        <LeftContainer>
          <FormGrid>
            <TopRow>
              <FormSection>
                <SectionHeader>
                  <SectionTitle>Basic Information</SectionTitle>
                </SectionHeader>

                <Field>
                  <Label>Bot Name</Label>
                  <Input
                    value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                    required
                    placeholder="e.g. Support Assistant"
                  />
                  <HelperText>Give your bot a recognizable name.</HelperText>
                </Field>

                <Field>
                  <Label>Description</Label>
                  <TextArea
                    value={form.description}
                    onChange={(e) => update("description", e.target.value)}
                    placeholder="Describe what this bot does..."
                  />
                  <HelperText>
                    {form.description?.length || 0} characters used
                  </HelperText>
                </Field>

                <Field>
                  <Label>Tone</Label>
                  <CustomSelect
                    value={form.tone || "friendly"}
                    onChange={(value) => update("tone", value)}
                    options={[
                      { value: "friendly", label: "Friendly & Casual" },
                      { value: "professional", label: "Professional & Formal" },
                    ]}
                  />
                </Field>
              </FormSection>

              <FormSection>
                <SectionHeader>
                  <SectionTitle>Appearance</SectionTitle>
                </SectionHeader>

                <Field>
                  <ColorPicker
                    value={form.primaryColor || "#4f46e5"}
                    onChange={(hex) => update("primaryColor", hex)}
                  />
                  <HelperText>
                    This color will be used for buttons and accents.
                  </HelperText>
                </Field>

                <Field style={{ marginTop: "20px" }}>
                  <Label>Bot Avatar</Label>
                  <UploadContainer>
                    {form.logoUrl ? (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                        }}
                      >
                        <img
                          src={form.logoUrl}
                          alt="Bot Avatar"
                          style={{
                            width: "58px",
                            height: "58px",
                            borderRadius: "50%",
                            objectFit: "cover",
                            border: "1px solid #ddd",
                          }}
                        />
                        <RemoveButton
                          type="button"
                          onClick={() => update("logoUrl", "")}
                        >
                          Remove
                        </RemoveButton>
                      </div>
                    ) : (
                      <UploadButton>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          disabled={uploading}
                        />
                        {uploading ? (
                          "Uploading..."
                        ) : (
                          <>
                            <svg
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                              <polyline points="17 8 12 3 7 8" />
                              <line x1="12" y1="3" x2="12" y2="15" />
                            </svg>
                            Upload Image
                          </>
                        )}
                      </UploadButton>
                    )}
                  </UploadContainer>
                  <HelperText>
                    Recommended: Square image, max 1MB.
                  </HelperText>
                </Field>
              </FormSection>
            </TopRow>

            <FormSection>
              <SectionHeader>
                <SectionTitle>Contact Settings</SectionTitle>
              </SectionHeader>

              <Field>
                <ToggleContainer>
                  <ToggleSwitch
                    checked={form.contactEnabled || false}
                    onClick={() =>
                      update("contactEnabled", !form.contactEnabled)
                    }
                  />
                  <span style={{ fontWeight: 600 }}>
                    Enable Lead Collection
                  </span>
                </ToggleContainer>
                <HelperText>
                  Allow the bot to collect user contact information.
                </HelperText>
              </Field>

              {form.contactEnabled && (
                <ContactGrid>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <Field>
                      <Label>Notification Email</Label>
                      <Input
                        disabled={!form.contactEnabled}
                        placeholder="email@example.com"
                        value={form.contactEmail}
                        onChange={(e) => update("contactEmail", e.target.value)}
                        type="email"
                      />
                      <HelperText>
                        Where should we send collected leads?
                      </HelperText>
                    </Field>
                  </div>

                  <Field>
                    <Label>Contact Prompt</Label>
                    <TextArea
                      disabled={!form.contactEnabled}
                      placeholder="Would you like us to contact you?"
                      value={form.contactPrompt}
                      onChange={(e) => update("contactPrompt", e.target.value)}
                      rows={2}
                      style={{ minHeight: "80px" }}
                    />
                    <HelperText>
                      The message shown to users to ask for their email.
                    </HelperText>
                  </Field>

                  <Field>
                    <Label>Confirmation Message</Label>
                    <TextArea
                      disabled={!form.contactEnabled}
                      placeholder="Thanks for reaching out! Our team will contact you shortly."
                      value={form.contactEmailMessage}
                      onChange={(e) =>
                        update("contactEmailMessage", e.target.value)
                      }
                      rows={2}
                      style={{ minHeight: "80px" }}
                    />
                    <HelperText>
                      Sent to the user after they provide their email.
                    </HelperText>
                  </Field>
                </ContactGrid>
              )}
            </FormSection>

            <FormSection>
              <SectionHeader>
                <SectionTitle>E-Commerce / Sales Settings</SectionTitle>
              </SectionHeader>

              <Field>
                <ToggleContainer>
                  <ToggleSwitch
                    checked={form.ecommerceEnabled || false}
                    onClick={() =>
                      update("ecommerceEnabled", !form.ecommerceEnabled)
                    }
                  />
                  <span style={{ fontWeight: 600 }}>Enable E-Commerce Mode</span>
                </ToggleContainer>
                <HelperText>
                  Allow the bot to pitch products and share checkout links based on the conversation.
                </HelperText>
              </Field>

              {form.ecommerceEnabled && (
                <ContactGrid>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <Field>
                      <CatalogHeaderWrapper>
                        <Label>Products Catalog</Label>
                        <AddProductButton 
                          type="button" 
                          onClick={() => update("ecommerceProducts", [...(form.ecommerceProducts || []), { name: '', price: '', image: '', url: '' }])} 
                          disabled={!form.ecommerceEnabled} 
                        >
                          + Add Product
                        </AddProductButton>
                      </CatalogHeaderWrapper>
                      
                      {(form.ecommerceProducts || []).map((product, idx) => (
                        <CatalogProductCard key={idx}>
                          <DeleteProductButton 
                            type="button" 
                            onClick={() => update("ecommerceProducts", form.ecommerceProducts!.filter((_, i) => i !== idx))} 
                          >
                            ✕
                          </DeleteProductButton>
                          
                          <ProductFieldsRow>
                            <Field>
                              <SmallLabel>Product Name</SmallLabel>
                              <Input 
                                disabled={!form.ecommerceEnabled} 
                                value={product.name} 
                                onChange={(e) => {
                                  const newProducts = [...form.ecommerceProducts!];
                                  newProducts[idx].name = e.target.value;
                                  update("ecommerceProducts", newProducts);
                                }} 
                                placeholder="e.g. Myaxyl Balm" 
                              />
                            </Field>
                            <Field>
                              <SmallLabel>Price</SmallLabel>
                              <Input 
                                disabled={!form.ecommerceEnabled} 
                                value={product.price} 
                                onChange={(e) => {
                                  const newProducts = [...form.ecommerceProducts!];
                                  newProducts[idx].price = e.target.value;
                                  update("ecommerceProducts", newProducts);
                                }} 
                                placeholder="e.g. 60.00 INR" 
                              />
                            </Field>
                          </ProductFieldsRow>
                          
                          <ProductFieldsRow>
                            <Field>
                              <SmallLabel>Product Link</SmallLabel>
                              <Input 
                                disabled={!form.ecommerceEnabled} 
                                value={product.url} 
                                onChange={(e) => {
                                  const newProducts = [...form.ecommerceProducts!];
                                  newProducts[idx].url = e.target.value;
                                  update("ecommerceProducts", newProducts);
                                }} 
                                placeholder="https://example.com/product" 
                              />
                            </Field>
                            <Field>
                              <SmallLabel>Product Image</SmallLabel>
                              <ProductImageWrapper>
                                {product.image && (
                                  <ProductImageThumbnail src={product.image} alt="" />
                                )}
                                <ProductFileInput 
                                  type="file" 
                                  accept="image/*" 
                                  disabled={!form.ecommerceEnabled || uploading} 
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    if (file.size > 1024 * 1024) { alert("File is too large. Max size is 1MB."); return; }
                                    
                                    const formData = new FormData();
                                    formData.append("file", file);
                                    
                                    try {
                                      setUploading(true);
                                      const res = await fetch("/api/upload", { method: "POST", body: formData });
                                      const data = await res.json();
                                      if (data.url) {
                                        const newProducts = [...form.ecommerceProducts!];
                                        newProducts[idx].image = data.url;
                                        update("ecommerceProducts", newProducts);
                                      } else {
                                        alert(data.error || "Upload failed");
                                      }
                                    } catch {
                                      alert("Upload failed");
                                    } finally {
                                      setUploading(false);
                                    }
                                  }} 
                                />
                              </ProductImageWrapper>
                            </Field>
                          </ProductFieldsRow>
                        </CatalogProductCard>
                      ))}
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
                        These instructions will be given to the bot along with the product catalog.
                      </HelperText>
                    </Field>
                  </div>
                </ContactGrid>
              )}
            </FormSection>
          </FormGrid>

          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : submitLabel}
          </Button>
        </LeftContainer>
        <SideContainer>
          <BotPreview
            name={form.name || ""}
            color={form.primaryColor || "#4f46e5"}
            tone={form.tone || "friendly"}
            contactEnabled={form.contactEnabled || false}
            contactPrompt={form.contactPrompt || ""}
            logoUrl={form.logoUrl}
          />
          {initialData?.id && (
            <EmbedSuccess publicKey={initialData?.public_key || ""} />
          )}
        </SideContainer>
      </FormContainer>
    </Form>
  );
};
