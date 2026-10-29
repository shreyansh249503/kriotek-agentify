import { streamText } from "ai";
import { google } from "@ai-sdk/google";
import { buildSystemPrompt, type ContactState } from "../agent";
import type { LeadDecision } from "./leadAgent";
import type { Bot } from "../entities";
import { createOrderLookupTool } from "./orderLookupTool";

type Message = { role: "user" | "assistant" | "system"; content: string };

interface ReceptionistOptions {
  messages: Message[];
  botConfig: Bot & { supported_languages?: string[] };
  leadDecision: LeadDecision | null;
  websiteContext: string;
  isShopifyConnected?: boolean;
}

export function runReceptionistAgent({
  messages,
  botConfig,
  leadDecision,
  websiteContext,
  isShopifyConnected = false,
}: ReceptionistOptions) {
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
      companyDescription: botConfig.description || "",
      tone: botConfig.tone as "friendly" | "professional" | undefined,
      supportedLanguages: botConfig.supported_languages,
      ecommerceEnabled: botConfig.ecommerce_enabled,
      ecommercePrompt: botConfig.ecommerce_prompt,
      ecommerceProducts: botConfig.ecommerce_products,
      shopifyEnabled: isShopifyConnected,
    },
    { websiteContext },
    contactState,
  );

  const tools = isShopifyConnected
    ? {
        lookup_shopify_order: createOrderLookupTool(
          botConfig.id,
          (journey) =>
            `Write a warm, friendly 1-sentence status summary for order ${journey.orderNumber}. (e.g. "Your order ${journey.orderNumber} is currently ${journey.statusBadge.toLowerCase()} and being prepared for shipment!").`,
        ),
      }
    : undefined;

  const modelName = process.env.GEMINI_MODEL || "gemini-2.5-flash-lite";

  return streamText({
    model: google(modelName),
    system: systemPrompt,
    messages: messages.filter(
      (m) => m.role === "user" || m.role === "assistant",
    ),
    maxOutputTokens: 2048,
    ...(tools ? { tools, stopWhen: ({ steps }) => steps.length >= 5 } : {}),
  });
}

