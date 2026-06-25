import React from "react";
import { CreateBotInput } from "@/types/bot";
import { CustomSelect } from "../custom-select";
import {
  FormSection,
  SectionHeader,
  SectionTitle,
  Field,
  Label,
  Input,
  TextArea,
  HelperText,
} from "./styled";

interface BasicInfoSectionProps {
  form: CreateBotInput;
  update: <K extends keyof CreateBotInput>(
    key: K,
    value: CreateBotInput[K]
  ) => void;
}

export const BasicInfoSection = ({ form, update }: BasicInfoSectionProps) => {
  return (
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
  );
};
