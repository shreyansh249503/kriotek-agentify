"use client";

import { useState } from "react";
import { Form, Field, Label, Input, TextArea, Button } from "./Form";
import { Bot, CreateBotInput } from "@/types/bot";
import Link from "next/link";

interface BotFormProps {
    initialData?: Bot;
    onSubmit: (data: CreateBotInput) => Promise<void>;
    submitLabel: string;
}

export default function BotForm({
    initialData,
    onSubmit,
    submitLabel,
}: BotFormProps) {
    const [form, setForm] = useState<CreateBotInput>({
        name: initialData?.name ?? "",
        description: initialData?.description ?? "",
        tone: initialData?.tone ?? "friendly",
        primaryColor: initialData?.primary_color ?? "#4f46e5",
    });

    function update<K extends keyof CreateBotInput>(
        key: K,
        value: CreateBotInput[K]
    ) {
        setForm((prev) => ({ ...prev, [key]: value }));
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        await onSubmit(form);
    }

    return (
        <Form onSubmit={handleSubmit}>
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
                <Input
                    value={form.tone}
                    onChange={(e) => update("tone", e.target.value)}
                />
            </Field>

            <Field>
                <Label>Primary Color</Label>
                <Input
                    type="color"
                    value={form.primaryColor}
                    onChange={(e) => update("primaryColor", e.target.value)}
                />
            </Field>

            <Button type="submit">{submitLabel}</Button>

            <Link href={"/admin"}> Go to admin</Link>
        </Form>
    );
}
