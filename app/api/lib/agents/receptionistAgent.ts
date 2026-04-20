import { streamText } from "ai";
import { google } from "@ai-sdk/google";
import { buildSystemPrompt, type ContactState } from "../agent";
import type { LeadDecision } from "./leadAgent";

type Message = { role: "user" | "assistant" | "system"; content: string };

interface ReceptionistOptions {
  messages: Message[];
  botConfig: any;
  leadDecision: LeadDecision | null; // null = contact collection disabled
  websiteContext: string;
}

export function runReceptionistAgent({
  messages,
  botConfig,
  leadDecision,
  websiteContext,
}: ReceptionistOptions) {
  // Build contact state to inject into the unified prompt
  // If leadDecision is null, contact collection is disabled for this bot
  const contactState: ContactState | undefined = leadDecision
    ? {
        collected: leadDecision.collectedInfo,
        missingFields: leadDecision.missingFields,
        isComplete: leadDecision.isComplete,
      }
    : undefined;

  const systemPrompt = buildSystemPrompt(
    {
      companyName: botConfig.name,
      companyDescription: botConfig.description,
      tone: botConfig.tone,
      supportedLanguages: botConfig.supported_languages,
      ecommerceEnabled: botConfig.ecommerce_enabled,
      ecommercePrompt: botConfig.ecommerce_prompt,
    },
    { websiteContext },
    contactState,
  );

  return streamText({
    model: google("gemini-2.5-flash"),
    system: systemPrompt,
    messages: messages.filter(
      (m) => m.role === "user" || m.role === "assistant",
    ),
  });
}
