type Message = { role: "user" | "assistant" | "system"; content: string };
interface StreamError {
  statusCode?: number;
  lastError?: { statusCode?: number };
  message?: string;
}
import { z } from "zod";
import * as Sentry from "@sentry/nextjs";
import type { LanguageModelUsage } from "ai";
import { getBotByPublicKey } from "../lib/bot";
import { retrieveWebsiteContext } from "../lib/rag";
import { sendOwnerNotification, sendUserEmail } from "../lib/sendEmail";
import { getDb } from "../lib/db";
import { Conversation, Lead, ShopifyStore } from "../lib/entities";
import { generateUserConfirmationTemplate } from "../lib/emailTemplates";
import {
  runLeadAgent,
  runReceptionistAgent,
  runSalesAgent,
  classifyUserIntent,
} from "../lib/agents";
import { checkRateLimit } from "../lib/rateLimit";
import { verifyOrigin } from "../lib/originGuard";
import { checkBotBudget, estimateTokens, recordBotTokenUsage } from "../lib/tokenBudget";
import { createChatTrace, TraceHandle } from "../lib/langfuse";
import { getModelName } from "../lib/model";
import { UsageAccumulator } from "../lib/usage";
import { appendMessages, parseMessages } from "../lib/conversations";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, x-forwarded-for, cf-connecting-ip, x-real-ip",
  "Access-Control-Expose-Headers": "x-trace-id",
};

export const MAX_MESSAGE_LENGTH = 2000;
/** Only the most recent messages go to the model; the full history stays in the database. */
export const MAX_HISTORY_MESSAGES = 20;
/**
 * Used only when the provider reports no usage. A system prompt with no catalog is about
 * 5,700 characters, roughly 1,400 tokens.
 */
export const ESTIMATED_SYSTEM_PROMPT_TOKENS = 1500;

const REQUIRED_FIELDS_ERROR = "publicKey and message are required";

const ChatRequestSchema = z.object({
  message: z
    .string({ error: REQUIRED_FIELDS_ERROR })
    .trim()
    .min(1, { error: REQUIRED_FIELDS_ERROR })
    .max(MAX_MESSAGE_LENGTH, { error: `message must be at most ${MAX_MESSAGE_LENGTH} characters` }),
  publicKey: z
    .string({ error: REQUIRED_FIELDS_ERROR })
    .min(1, { error: REQUIRED_FIELDS_ERROR })
    .max(128, { error: "publicKey is invalid" }),
  conversationId: z.unknown().optional(),
});

function jsonError(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

/** Keeps the last MAX_HISTORY_MESSAGES, starting at a user turn. */
export function trimHistoryForModel(messages: Message[]): Message[] {
  const recent = messages.slice(-MAX_HISTORY_MESSAGES);
  const firstUserIndex = recent.findIndex((m) => m.role === "user");
  return firstUserIndex > 0 ? recent.slice(firstUserIndex) : recent;
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = ChatRequestSchema.safeParse(body ?? {});
  if (!parsed.success) {
    return jsonError(400, { error: parsed.error.issues[0]?.message ?? REQUIRED_FIELDS_ERROR });
  }
  const { message, publicKey, conversationId } = parsed.data;

  // 1. Dual-Tier Rate Limiting (IP & Bot Level)
  const rateLimitResult = await checkRateLimit(req, publicKey);
  if (!rateLimitResult.success) {
    return new Response(
      JSON.stringify({
        error: "Rate limit exceeded. Please wait a moment before sending more messages.",
        reason: rateLimitResult.reason,
        retryAfter: rateLimitResult.retryAfter,
      }),
      {
        status: 429,
        headers: {
          ...corsHeaders,
          ...rateLimitResult.headers,
          "Content-Type": "application/json",
        },
      },
    );
  }

  const bot = await getBotByPublicKey(publicKey);
  if (!bot) {
    return jsonError(404, { error: "Bot not found" });
  }

  // 2. LLM Monthly Token Budget Guardrails
  const budgetResult = await checkBotBudget(bot.id, bot.monthly_token_budget);
  if (budgetResult.reason === "check_failed") {
    return jsonError(503, {
      error: "The assistant is temporarily unavailable. Please try again shortly.",
      reason: "budget_check_failed",
    });
  }
  if (!budgetResult.allowed) {
    return new Response(
      JSON.stringify({
        error: "This store's AI Assistant monthly quota has been reached. Please contact store support directly.",
        reason: "budget_exceeded",
      }),
      {
        status: 429,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  }

  const dbInstance = await getDb();
  const shopifyStore = await dbInstance
    .getRepository<ShopifyStore>("ShopifyStore")
    .findOne({ where: { bot_id: bot.id } });

  // 3. Merchant Domain & Origin Verification
  const originResult = verifyOrigin(req, bot, shopifyStore);
  if (!originResult.allowed) {
    return new Response(
      JSON.stringify({
        error: "Forbidden: Request origin is not authorized for this assistant.",
        reason: originResult.reason,
      }),
      {
        status: 403,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  }

  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  const finalConversationId =
    typeof conversationId === "string" && uuidRegex.test(conversationId)
      ? conversationId
      : crypto.randomUUID();

  const convoRepo = dbInstance.getRepository<Conversation>("Conversation");

  let convo = await convoRepo.findOne({
    where: { id: finalConversationId, bot_id: bot.id },
  });

  if (!convo) {
    convo = convoRepo.create({
      id: finalConversationId,
      bot_id: bot.id,
      state: "idle",
      message_count: 0,
      messages: [],
    });
    await convoRepo.save(convo);
  }

  // Initialize Langfuse Observability Trace
  const trace = createChatTrace({
    botId: bot.id,
    botName: bot.name,
    storeId: shopifyStore?.id,
    storeDomain: shopifyStore?.shop,
    conversationId: convo.id,
    userMessage: message,
  });

  const userMessage: Message = { role: "user", content: message };
  const fullConversation: Message[] = [...parseMessages(convo.messages), userMessage];

  if (convo.state === "manual" || convo.state === "manual_takeover") {
    await appendMessages(convo.id, [userMessage]);
    return new Response("Message sent to customer support.", {
      headers: {
        ...corsHeaders,
        ...rateLimitResult.headers,
        "x-trace-id": trace.traceId,
      },
    });
  }

  const alreadyComplete = convo.state === "completed";

  const contactEnabled = bot.contact_enabled !== false;

  const knownInfo = {
    name: convo.name ?? undefined,
    email: convo.email ?? undefined,
    phone: convo.phone ?? undefined,
  };

  const isShopifyConnected = Boolean(shopifyStore);
  const modelConversation = trimHistoryForModel(fullConversation);
  const helperUsage = new UsageAccumulator();

  const [leadDecision, websiteContext, intentDecision] =
    await Promise.all([
      !contactEnabled || alreadyComplete
        ? Promise.resolve(
            alreadyComplete
              ? {
                  collectedInfo: knownInfo,
                  missingFields: [] as ("name" | "email")[],
                  isComplete: true,
                }
              : null,
          )
        : runLeadAgent(modelConversation, bot.contact_prompt, knownInfo, helperUsage),
      retrieveWebsiteContext(publicKey, message),
      classifyUserIntent(modelConversation, {
        ecommerceEnabled: Boolean(bot.ecommerce_enabled),
        shopifyConnected: isShopifyConnected,
        hasCatalog: Boolean(bot.ecommerce_products?.length),
      }, helperUsage),
    ]);

  trace.recordSpan("intent_classification", { message }, intentDecision);
  trace.recordSpan("rag_retrieval", { message }, { hasContext: Boolean(websiteContext) });

  if (
    contactEnabled &&
    !alreadyComplete &&
    leadDecision &&
    !leadDecision.isComplete
  ) {
    const partial = leadDecision.collectedInfo;
    const updates: { name?: string; email?: string; phone?: string } = {};

    if (partial.name) updates.name = partial.name;
    if (partial.email) updates.email = partial.email;
    if (partial.phone) updates.phone = partial.phone;

    if (Object.keys(updates).length > 0) {
      await convoRepo.update(convo.id, updates);
    }
  }

  if (
    contactEnabled &&
    !alreadyComplete &&
    leadDecision &&
    leadDecision.isComplete
  ) {
    const { name, email, phone } = leadDecision.collectedInfo;

    await convoRepo.update(convo.id, {
      state: "completed",
      name: name ?? undefined,
      email: email ?? undefined,
      phone: phone ?? undefined,
    });

    const leadRepo = dbInstance.getRepository<Lead>("Lead");
    const lead = leadRepo.create({
      bot_id: bot.id,
      name: name || undefined,
      email: email || undefined,
      phone: phone || undefined,
    });
    await leadRepo.save(lead);

    trace.recordSpan("lead_captured", { name, email, phone });

    Promise.all([
      email
        ? sendUserEmail({
            to: email,
            subject: `Thank you for contacting ${bot.name}`,
            body: "We'll contact you shortly.",
            html: generateUserConfirmationTemplate({
              userName: name || "there",
              companyName: bot.name,
              companyDescription: bot.description || "",
              customMessage: bot.contact_email_message || undefined,
              userEmail: email,
              userPhone: phone || "",
            }),
          })
        : Promise.resolve(),
      bot.contact_email
        ? sendOwnerNotification({
            ownerEmail: bot.contact_email,
            botName: bot.name,
            leadData: { name: name ?? "", email: email ?? "", phone: phone ?? "" },
          })
        : Promise.resolve(),
    ]).catch((err) => console.error("[leads pipeline]", err));
  }

  await appendMessages(convo.id, [userMessage]);

  let result;
  try {
    const isSales =
      intentDecision.primaryIntent === "SALES" &&
      Boolean(bot.ecommerce_enabled) &&
      Boolean(bot.ecommerce_products?.length);

    if (isSales) {
      result = await runSalesAgent({
        messages: modelConversation,
        botConfig: bot,
        leadDecision,
        websiteContext,
        isShopifyConnected,
        usage: helperUsage,
      });
    } else {
      result = runReceptionistAgent({
        messages: modelConversation,
        botConfig: bot,
        leadDecision,
        websiteContext,
        isShopifyConnected,
      });
    }

  } catch (err) {
    // The helper calls already ran, so their tokens still count against the budget.
    recordBotTokenUsage(bot.id, { ...helperUsage, messageCount: 0 }).catch(console.error);

    console.error("[chat] Reply agent failed:", err);
    Sentry.captureException(err, { tags: { area: "chat_agent" }, extra: { botId: bot.id } });

    const error = err as StreamError;
    const isQuota =
      error?.statusCode === 429 ||
      error?.lastError?.statusCode === 429 ||
      error?.message?.includes("quota");
    const msg = isQuota
      ? "Your free tier of the day is over. Please try again later."
      : "An error occurred.";
    return new Response(msg, {
      status: isQuota ? 429 : 500,
      headers: {
        ...corsHeaders,
        "x-trace-id": trace.traceId,
      },
    });
  }

  const encoder = new TextEncoder();
  const customStream = new ReadableStream({
    async start(controller) {
      try {
        for await (const part of result.fullStream) {
          if (part.type === "text-delta") {
            controller.enqueue(encoder.encode(part.text));
          } else if (part.type === "tool-result") {
            const toolPart = part as unknown as {
              output?: Record<string, unknown>;
              result?: Record<string, unknown>;
            };
            const toolRes = toolPart.output || toolPart.result;
            if (toolRes && typeof toolRes.tagPayload === "string") {
              controller.enqueue(encoder.encode(`\n\n${toolRes.tagPayload}`));
            }
          } else if (part.type === "error") {
            const err = part.error as StreamError;
            const isQuota =
              err?.statusCode === 429 ||
              err?.lastError?.statusCode === 429 ||
              err?.message?.toLowerCase().includes("quota") ||
              String(err).includes("429") ||
              String(err).includes("quota");

            if (isQuota) {
              controller.enqueue(
                encoder.encode(
                  "Your daily AI query quota has been reached. Please try again shortly.",
                ),
              );
            } else {
              controller.enqueue(
                encoder.encode(
                  "Sorry, an error occurred while generating the response.",
                ),
              );
            }
          }
        }
      } catch (err) {
        const error = err as StreamError;
        const isQuota =
          error?.statusCode === 429 ||
          error?.lastError?.statusCode === 429 ||
          error?.message?.toLowerCase().includes("quota") ||
          String(error).includes("429");

        if (isQuota) {
          controller.enqueue(
            encoder.encode(
              "Your daily AI query quota has been reached. Please try again shortly.",
            ),
          );
        } else {
          controller.enqueue(
            encoder.encode(
              "Sorry, an error occurred while generating the response.",
            ),
          );
        }
      } finally {
        controller.close();
      }
    },
  });

  const [streamForClient, streamForSaving] = customStream.tee();
  saveAssistantMessage(streamForSaving, {
    conversationId: convo.id,
    botId: bot.id,
    modelConversation,
    websiteContext,
    totalUsage: result?.totalUsage,
    helperUsage,
    trace,
  }).catch(console.error);

  return new Response(streamForClient, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
      ...corsHeaders,
      ...rateLimitResult.headers,
      "x-trace-id": trace.traceId,
    },
  });
}

interface SaveAssistantMessageOptions {
  conversationId: string;
  botId: string;
  /** The trimmed history the model actually saw, for the estimated fallback. */
  modelConversation: Message[];
  websiteContext: string;
  /** Usage of the main reply, summed over all tool steps. */
  totalUsage?: PromiseLike<LanguageModelUsage>;
  /** Usage of the lead, intent and requirement calls made before the reply. */
  helperUsage: UsageAccumulator;
  trace?: TraceHandle;
}

async function saveAssistantMessage(
  stream: ReadableStream,
  {
    conversationId,
    botId,
    modelConversation,
    websiteContext,
    totalUsage,
    helperUsage,
    trace,
  }: SaveAssistantMessageOptions,
) {
  let fullText = "";
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    fullText += decoder.decode(value, { stream: true });
  }

  const replyUsage = new UsageAccumulator();
  const reported = await Promise.resolve(totalUsage)
    .then((usage) => replyUsage.add(usage))
    .catch(() => false);
  if (!reported) {
    console.warn("[chat] Model reported no token usage; recording an estimate instead.");
    const promptText = [websiteContext, ...modelConversation.map((m) => m.content)].join(" ");
    replyUsage.add({
      inputTokens: ESTIMATED_SYSTEM_PROMPT_TOKENS + estimateTokens(promptText),
      outputTokens: estimateTokens(fullText),
    });
  }

  // Appended even if an agent took over mid-stream: the customer already saw this reply.
  // Only user turns count towards message_count here, as before.
  await appendMessages(conversationId, [{ role: "assistant", content: fullText }], { incrementCount: 0 });

  // Record token usage for cost guardrails
  await recordBotTokenUsage(botId, {
    inputTokens: replyUsage.inputTokens + helperUsage.inputTokens,
    outputTokens: replyUsage.outputTokens + helperUsage.outputTokens,
    totalTokens: replyUsage.totalTokens + helperUsage.totalTokens,
    messageCount: 1,
  });

  // Record generation telemetry to Langfuse (the main reply only)
  if (trace) {
    trace.recordGeneration({
      name: "chat_agent_generation",
      model: getModelName(),
      input: modelConversation,
      output: fullText,
      usage: {
        promptTokens: replyUsage.inputTokens,
        completionTokens: replyUsage.outputTokens,
        totalTokens: replyUsage.totalTokens,
      },
      metadata: { usageEstimated: !reported },
    });
  }
}
