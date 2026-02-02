"use client";

import { useState } from "react";
import { Form, Field, Label, Input, TextArea, Button } from "./styled";
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
  const [form, setForm] = useState<CreateBotInput>({
    name: initialData?.name ?? "",
    description: initialData?.description ?? "",
    tone: initialData?.tone ?? "friendly",
    primaryColor: initialData?.primary_color ?? "#4f46e5",
  });

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
      <h2
        style={{
          marginBottom: "10px",
          fontSize: "24px",
          fontWeight: "700",
          color: "#1f2937",
        }}
      >
        {title}
      </h2>
      <Field>
        <Label>Bot Name</Label>
        <Input
          value={form.name}
          onChange={(e) => update("name", e.target.value)}
          required
        />
      </Field>

      <Field>
        <Label>Description</Label>
        <TextArea
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
        />
      </Field>

      <Field>
        <Label>Tone</Label>
        <CustomSelect
          value={form.tone || "friendly"}
          onChange={(value) => update("tone", value)}
          options={[
            { value: "friendly", label: "Friendly" },
            { value: "professional", label: "Professional" },
          ]}
        />
      </Field>

      <Field>
        <Label>Primary Color</Label>
        <ColorPicker
          value={form.primaryColor}
          onChange={(hex) => update("primaryColor", hex)}
        />
      </Field>

      <Button type="submit">{submitLabel}</Button>
    </Form>
  );
};
