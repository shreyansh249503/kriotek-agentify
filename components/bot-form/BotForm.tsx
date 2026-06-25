"use client";

import { useState } from "react";
import { CreateBotInput } from "@/types/bot";
import { BotFormProps } from "./type";
import { BotPreview } from "../bot-preview";
import { EmbedSuccess } from "../embed-success";
import { BasicInfoSection } from "./BasicInfoSection";
import { AppearanceSection } from "./AppearanceSection";
import { ContactSettingsSection } from "./ContactSettingsSection";
import { EcommerceSettingsSection } from "./EcommerceSettingsSection";
import {
  Form,
  Button,
  FormGrid,
  TopRow,
  FormContainer,
  SideContainer,
  LeftContainer,
} from "./styled";

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
      : defaultValues
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
    value: CreateBotInput[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const cleanProducts = (form.ecommerceProducts || []).filter(
      (p) => p.name?.trim() && p.price?.trim() && p.url?.trim()
    );
    await onSubmit({
      ...form,
      ecommerceProducts: cleanProducts,
    });
  }

  return (
    <Form onSubmit={handleSubmit}>
      <FormContainer>
        <LeftContainer>
          <FormGrid>
            <TopRow>
              <BasicInfoSection form={form} update={update} />
              <AppearanceSection form={form} update={update} />
            </TopRow>

            <ContactSettingsSection form={form} update={update} />

            <EcommerceSettingsSection
              form={form}
              update={update}
              publicKey={initialData?.public_key}
            />
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
