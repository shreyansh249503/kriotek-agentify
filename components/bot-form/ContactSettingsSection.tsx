import React from "react";
import { CreateBotInput } from "@/types/bot";
import {
  FormSection,
  SectionHeader,
  SectionTitle,
  Field,
  ToggleContainer,
  ToggleSwitch,
  ContactGrid,
  GridFullWidth,
  Label,
  Input,
  TextArea,
  HelperText,
} from "./styled";

interface ContactSettingsSectionProps {
  form: CreateBotInput;
  update: <K extends keyof CreateBotInput>(
    key: K,
    value: CreateBotInput[K]
  ) => void;
}

export const ContactSettingsSection = ({
  form,
  update,
}: ContactSettingsSectionProps) => {
  return (
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
        <ContactGrid>
          <GridFullWidth>
            <Field>
              <Label>Notification Email</Label>
              <Input
                disabled={!form.contactEnabled}
                placeholder="email@example.com"
                value={form.contactEmail || ""}
                onChange={(e) => update("contactEmail", e.target.value)}
                type="email"
              />
              <HelperText>Where should we send collected leads?</HelperText>
            </Field>
          </GridFullWidth>

          <Field>
            <Label>Contact Prompt</Label>
            <TextArea
              disabled={!form.contactEnabled}
              placeholder="Would you like us to contact you?"
              value={form.contactPrompt || ""}
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
              value={form.contactEmailMessage || ""}
              onChange={(e) => update("contactEmailMessage", e.target.value)}
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
  );
};
