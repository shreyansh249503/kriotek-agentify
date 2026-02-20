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
  BotFormTitle,
  FormGrid,
  TopRow,
} from "./styled";
import { CreateBotInput } from "@/types/bot";
import { CustomSelect } from "../custom-select";
import { ColorPicker } from "../color-picker";
import { BotFormProps } from "./type";

export const BotForm = ({
  initialData,
  onSubmit,
  submitLabel,
  title,
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
  };

  const [form, setForm] = useState<CreateBotInput>(() => {
    if (initialData) {
      return {
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
      };
    }
    return defaultValues;
  });

  // Sync internal state with initialData if it changes identity (robust sync)
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await onSubmit(form);
  }

  return (
    <Form onSubmit={handleSubmit}>
      <BotFormTitle>{title}</BotFormTitle>

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
                  { value: "empathetic", label: "Empathetic & Supportive" },
                  { value: "concise", label: "Concise & Direct" },
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
                onClick={() => update("contactEnabled", !form.contactEnabled)}
              />
              <span style={{ fontWeight: 600 }}>Enable Lead Collection</span>
            </ToggleContainer>
            <HelperText>
              Allow the bot to collect user contact information.
            </HelperText>
          </Field>

          {form.contactEnabled && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "24px",
                marginTop: "10px",
              }}
            >
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
                  <HelperText>Where should we send collected leads?</HelperText>
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
            </div>
          )}
        </FormSection>
      </FormGrid>

      <Button type="submit" disabled={loading}>
        {loading ? "Saving..." : submitLabel}
      </Button>
    </Form>
  );
};
