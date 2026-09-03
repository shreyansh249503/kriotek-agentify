type Message = { role: "user" | "assistant" | "system"; content: string };
interface StreamError {
  statusCode?: number;
  lastError?: { statusCode?: number };
  message?: string;
}
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

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, x-forwarded-for, cf-connecting-ip, x-real-ip",
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

export async function POST(req: Request) {
  const { message, publicKey, conversationId } = await req.json();

  if (!publicKey || !message) {
    return new Response(
      JSON.stringify({ error: "publicKey and message are required" }),
      { status: 400, headers: corsHeaders },
    );
  }

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

  // 2. LLM Monthly Token Budget Guardrails
  const budgetResult = await checkBotBudget(bot.id, bot.monthly_token_budget);
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
    conversationId && uuidRegex.test(conversationId)
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
      messages: "[]",
    });
    await convoRepo.save(convo);
  }

  let history: Message[] = [];
  try {
    history = JSON.parse(convo.messages || "[]");
  } catch {
    history = [];
  }

  const fullConversation: Message[] = [
    ...history,
    { role: "user" as const, content: message },
  ];

  if (convo.state === "manual" || convo.state === "manual_takeover") {
    await convoRepo.update(convo.id, {
      message_count: convo.message_count + 1,
      messages: JSON.stringify(fullConversation),
    });
    return new Response("Message sent to customer support.", {
      headers: {
        ...corsHeaders,
        ...rateLimitResult.headers,
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
        : runLeadAgent(fullConversation, bot.contact_prompt, knownInfo),
      retrieveWebsiteContext(publicKey, message),
      classifyUserIntent(fullConversation, {
        ecommerceEnabled: Boolean(bot.ecommerce_enabled),
        shopifyConnected: true,
        hasCatalog: Boolean(bot.ecommerce_products?.length),
      }),
    ]);

  const isShopifyConnected = Boolean(shopifyStore);

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
      try {
        await convoRepo.update(convo.id, updates);
        console.log("[route] Partial save OK:", updates);
      } catch (err) {
        console.error("[route] Partial save FAILED:", err);
      }
    }
  }

  if (contactEnabled && leadDecision?.isComplete && !alreadyComplete) {
    const { name = "", email = "", phone = "" } = leadDecision.collectedInfo;

    console.log("[route] LEAD COMPLETE — firing pipeline:", {
      name,
      email,
      phone,
    });

    await convoRepo.update(convo.id, {
      state: "completed",
      name,
      email,
      phone,
    });

    const leadRepo = dbInstance.getRepository<Lead>("Lead");
    Promise.all([
      leadRepo.save(
        leadRepo.create({
          bot_id: bot.id,
          name,
          email,
          phone,
        }),
      ),
      email
        ? sendUserEmail({
            to: email,
            subject: `Thank you for contacting ${bot.name}`,
            body: "We'll contact you shortly.",
            html: generateUserConfirmationTemplate({
              userName: name,
              companyName: bot.name,
              companyDescription: bot.description,
              customMessage: bot.contact_email_message,
              userEmail: email,
              userPhone: phone,
            }),
          })
        : Promise.resolve(),
      bot.contact_email
        ? sendOwnerNotification({
            ownerEmail: bot.contact_email,
            botName: bot.name,
            leadData: { name, email, phone },
          })
        : Promise.resolve(),
    ]).catch((err) => console.error("[leads pipeline]", err));
  }

  await convoRepo.update(convo.id, {
    message_count: convo.message_count + 1,
    messages: JSON.stringify(fullConversation),
  });

  let result;
  try {
    const isSales =
      intentDecision.primaryIntent === "SALES" &&
      Boolean(bot.ecommerce_enabled) &&
      Boolean(bot.ecommerce_products?.length);

    console.log(
      `[route] Dispatching agent - Intent: ${intentDecision.primaryIntent} (confidence: ${intentDecision.confidence}, isSales: ${isSales})`,
    );

    if (isSales) {
      result = await runSalesAgent({
        messages: fullConversation,
        botConfig: bot,
        leadDecision,
        websiteContext,
        isShopifyConnected,
      });
    } else {
      result = runReceptionistAgent({
        messages: fullConversation,
        botConfig: bot,
        leadDecision,
        websiteContext,
        isShopifyConnected,
      });
    }

  } catch (err) {
    const error = err as StreamError;
    console.error("[route] Sync error starting agent:", error);
    const isQuota =
      error?.statusCode === 429 ||
      error?.lastError?.statusCode === 429 ||
      error?.message?.includes("quota");
    const msg = isQuota
      ? "Your free tier of the day is over. Please try again later."
      : "An error occurred.";
    return new Response(msg, {
      status: isQuota ? 429 : 500,
      headers: corsHeaders,
    });
  }

  const encoder = new TextEncoder();
  const customStream = new ReadableStream({
    async start(controller) {
      console.log("[route] customStream start() executing...");
      try {
        for await (const part of result.fullStream) {
          console.log("[route] fullStream part:", part.type);
          if (part.type === "text-delta") {
            console.log(
              "[route] enqueuing text-delta:",
              JSON.stringify(part.text),
            );
            controller.enqueue(encoder.encode(part.text));
          } else if (part.type === "tool-result") {
            const toolPart = part as unknown as {
              output?: Record<string, unknown>;
              result?: Record<string, unknown>;
            };
            const toolRes = toolPart.output || toolPart.result;
            if (toolRes && typeof toolRes.tagPayload === "string") {
              console.log(
                "[route] Injecting tool result tagPayload into stream:",
                toolRes.tagPayload.slice(0, 50),
              );
              controller.enqueue(encoder.encode(`\n\n${toolRes.tagPayload}`));
            }
          } else if (part.type === "error") {
            console.error("[route] fullStream error:", part.error);
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
        console.error("[route] Stream error exception:", error);
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
  saveAssistantMessage(streamForSaving, convo.id, bot.id, fullConversation).catch(
    console.error,
  );

  return new Response(streamForClient, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
      ...corsHeaders,
      ...rateLimitResult.headers,
    },
  });
}

async function saveAssistantMessage(
  stream: ReadableStream,
  conversationId: string,
  botId: string,
  existingHistory: Message[],
) {
  let fullText = "";
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    fullText += decoder.decode(value, { stream: true });
  }

  const updated = [
    ...existingHistory,
    { role: "assistant" as const, content: fullText },
  ];

  const promptText = existingHistory.map((m) => m.content).join(" ");
  const promptTokens = estimateTokens(promptText);
  const completionTokens = estimateTokens(fullText);

  const dbInstance = await getDb();
  const convoRepo = dbInstance.getRepository<Conversation>("Conversation");
  await convoRepo.update(conversationId, { messages: JSON.stringify(updated) });

  // Record token usage for cost guardrails
  await recordBotTokenUsage(botId, {
    promptTokens,
    completionTokens,
    totalTokens: promptTokens + completionTokens,
  });
}

