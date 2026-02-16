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
} from "./styled";
import { Bot, CreateBotInput, UpdateBotInput } from "@/types/bot";
import { CustomSelect } from "../custom-select";
import { ColorPicker } from "../color-picker";

interface BotFormProps {
  initialData?: Bot;
  onSubmit: (data: CreateBotInput | UpdateBotInput) => Promise<void>;
  submitLabel: string;
  title: string;
}

export const BotForm = ({
  initialData,
  onSubmit,
  submitLabel,
  title,
}: BotFormProps) => {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<CreateBotInput>({
    name: initialData?.name ?? "",
    description: initialData?.description ?? "",
    tone: initialData?.tone ?? "friendly",
    primaryColor: initialData?.primary_color ?? "#4f46e5",
    contactEnabled: initialData?.contact_enabled ?? false,
    contactEmail: initialData?.contact_email ?? "",
    contactPrompt:
      initialData?.contact_prompt ??
      "Would you like us to contact you for more details?",
    contactEmailMessage:
      initialData?.contact_email_message ??
      "Thanks for reaching out! Our team will contact you shortly.",
  });

  function update<K extends keyof CreateBotInput>(
    key: K,
    value: CreateBotInput[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(form);
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Form onSubmit={handleSubmit}>
      <BotFormTitle>{title}</BotFormTitle>

      <FormSection>
        <SectionHeader>
          <SectionTitle>🤖 Basic Information</SectionTitle>
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
          <SectionTitle>🎨 Appearance</SectionTitle>
        </SectionHeader>

        <Field>
          <Label>Primary Color</Label>
          <ColorPicker
            value={form.primaryColor || "#4f46e5"}
            onChange={(hex) => update("primaryColor", hex)}
          />
          <HelperText>
            This color will be used for buttons and accents.
          </HelperText>
        </Field>
      </FormSection>

      <FormSection>
        <SectionHeader>
          <SectionTitle>📬 Contact Settings</SectionTitle>
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
              display: "flex",
              flexDirection: "column",
              gap: "20px",
              marginTop: "10px",
            }}
          >
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
                onChange={(e) => update("contactEmailMessage", e.target.value)}
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

      <Button type="submit" disabled={loading}>
        {loading ? "Saving..." : submitLabel}
      </Button>
    </Form>
  );
};
