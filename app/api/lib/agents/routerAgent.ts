import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";

export const UserIntentEnum = z.enum([
  "SALES",
  "ORDER_LOOKUP",
  "SUPPORT",
  "COMPLAINT",
  "GENERAL",
]);

export type UserIntent = z.infer<typeof UserIntentEnum>;

export const IntentClassificationSchema = z.object({
  primaryIntent: UserIntentEnum.describe(
    "The primary intent: SALES (shopping/catalog/buying/pricing), ORDER_LOOKUP (order status/tracking/shipping), SUPPORT (policies/FAQ/how-to/company info), COMPLAINT (frustration/dissatisfaction/request human), GENERAL (greetings/chit-chat/other)",
  ),
  confidence: z
    .number()
    .min(0)
    .max(1)
    .describe("Confidence score between 0 and 1"),
  reasoning: z
    .string()
    .describe("Brief explanation for why this intent was selected"),
  entities: z
    .object({
      orderNumber: z
        .string()
        .optional()
        .describe("Extracted order number if provided (e.g. #1024, 1042)"),
      productKeywords: z
        .array(z.string())
        .optional()
        .describe("Product types, categories, or specific items mentioned"),
    })
    .optional(),
});

export type IntentClassificationResult = z.infer<
  typeof IntentClassificationSchema
>;

export interface RouterContext {
  ecommerceEnabled?: boolean;
  shopifyConnected?: boolean;
  hasCatalog?: boolean;
}

type Message = { role: "user" | "assistant" | "system" | "data"; content: string };

function fastPathIntent(
  latestUserMsg: string,
  totalMessages: number,
  context: RouterContext,
): IntentClassificationResult | null {
  const clean = latestUserMsg.trim().toLowerCase();

  if (
    totalMessages <= 2 &&
    /^(hi|hello|hey|good morning|good afternoon|good evening|howdy|yo)[!.]?$/i.test(
      clean,
    )
  ) {
    return {
      primaryIntent: "GENERAL",
      confidence: 0.99,
      reasoning: "Standard initial greeting",
    };
  }

  if (
    /(talk to (a )?human|speak to (a )?(representative|human|agent|person)|customer service agent|human agent|escalate this|file a complaint|terrible service|worst experience|i want to sue|scam)/i.test(
      clean,
    )
  ) {
    return {
      primaryIntent: "COMPLAINT",
      confidence: 0.95,
      reasoning: "Explicit request for human agent or complaint trigger",
    };
  }

  const orderMatch = clean.match(/(?:order\s*#?|#)(\d{3,8})/i);
  if (
    context.shopifyConnected &&
    orderMatch &&
    /(track|where is|status|shipping|package|delivery)/i.test(clean)
  ) {
    return {
      primaryIntent: "ORDER_LOOKUP",
      confidence: 0.98,
      reasoning: "Explicit order number and tracking keyword found",
      entities: {
        orderNumber: orderMatch[1] ? `#${orderMatch[1]}` : undefined,
      },
    };
  }

  return null;
}

export async function classifyUserIntent(
  messages: Message[],
  context: RouterContext = {},
): Promise<IntentClassificationResult> {
  const userMessages = messages.filter((m) => m.role === "user");
  const latestUserMsg = userMessages[userMessages.length - 1]?.content || "";

  if (!latestUserMsg.trim()) {
    return {
      primaryIntent: "GENERAL",
      confidence: 1.0,
      reasoning: "Empty message",
    };
  }

  const fast = fastPathIntent(latestUserMsg, messages.length, context);
  if (fast) {
    console.log("[routerAgent] Fast-path classified:", fast.primaryIntent);
    return fast;
  }

  try {
    const recentMessages = messages.slice(-6);
    const conversationText = recentMessages
      .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
      .join("\n");

    const modelName = process.env.GEMINI_MODEL || "gemini-2.5-flash-lite";

    const systemPrompt = `You are a conversational intent classifier for an e-commerce & customer service assistant.
Classify the user's latest query in the context of the conversation into exactly one primary intent:

- SALES: Browsing products, seeking product recommendations/gifts, checking price/sizing/colors, purchasing, or asking what items are available.
  NOTE: If e-commerce is disabled (${context.ecommerceEnabled === false}), do not select SALES unless explicitly asking to buy.
- ORDER_LOOKUP: Asking for order status, shipment tracking, delivery timeline, or cancel/return an already placed order.
- SUPPORT: Asking about store policies (refunds, shipping policy, store hours, warranty), product care instructions, technical help, or general company information.
- COMPLAINT: Expressing anger/frustration, reporting defective/missing items, or demanding to speak to a human representative.
- GENERAL: Greetings, casual chit-chat, thanks, closures, or ambiguous messages.

Capabilities Context:
- E-commerce Catalog Active: ${Boolean(context.ecommerceEnabled && context.hasCatalog)}
- Shopify Store Connected: ${Boolean(context.shopifyConnected)}`;

    const { object } = await generateObject({
      model: google(modelName),
      schema: IntentClassificationSchema,
      system: systemPrompt,
      prompt: `Conversation history:\n${conversationText}\n\nClassify the intent of the last user message.`,
    });

    console.log(
      `[routerAgent] LLM classified: ${object.primaryIntent} (confidence: ${object.confidence}) - Reasoning: ${object.reasoning}`,
    );
    return object;
  } catch (err) {
    console.error("[routerAgent] Classification failed, applying fallback:", err);

    const lower = latestUserMsg.toLowerCase();
    const isSales =
      Boolean(context.ecommerceEnabled) &&
      /(buy|price|cost|how much|product|products|recommend|catalog|shop|hoodie|shirt|shoe|shoes|item|items)/i.test(
        lower,
      );


    const isOrder =
      Boolean(context.shopifyConnected) &&
      /(track|order|package|shipping status|delivery)/i.test(lower);

    return {
      primaryIntent: isSales
        ? "SALES"
        : isOrder
          ? "ORDER_LOOKUP"
          : "GENERAL",
      confidence: 0.5,
      reasoning: "Fallback heuristic after router error",
    };
  }
}
