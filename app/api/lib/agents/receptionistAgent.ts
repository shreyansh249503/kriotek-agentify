import { streamText, tool } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";
import { buildSystemPrompt, type ContactState } from "../agent";
import type { LeadDecision } from "./leadAgent";
import type { Bot } from "../entities";
import { runOrderLookupTool } from "@/lib/shopify/orderLookup";

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
        lookup_shopify_order: tool({
          description:
            "Look up a Shopify order's status and delivery timeline. Requires the order number AND the email address or phone number used on the order. If the customer hasn't given an email or phone yet, ask for it before calling this tool.",
          inputSchema: z.object({
            order_number: z.string().describe("The Shopify order number, e.g. #1042 or 1042"),
            email: z.string().optional().describe("Email address used on the order"),
            phone: z.string().optional().describe("Phone number used on the order"),
          }),
          execute: async (args) => runOrderLookupTool(botConfig.id, args),
        }),
      }
    : undefined;

  const modelName = process.env.GEMINI_MODEL || "gemini-2.5-flash-lite";

  return streamText({
    model: google(modelName),
    system: systemPrompt,
    messages: messages.filter(
      (m) => m.role === "user" || m.role === "assistant",
    ),
    ...(tools ? { tools, stopWhen: ({ steps }) => steps.length >= 5 } : {}),
  });
}
