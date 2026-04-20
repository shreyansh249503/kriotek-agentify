type Message = { role: "user" | "assistant" | "system"; content: string };
import { getBotByPublicKey } from "../lib/bot";
import { retrieveWebsiteContext } from "../lib/rag";
import { sendOwnerNotification, sendUserEmail } from "../lib/sendEmail";
import { getDb } from "../lib/db";
import { Conversation, Lead } from "../lib/entities";
import { generateUserConfirmationTemplate } from "../lib/emailTemplates";
import { runLeadAgent } from "../lib/agents/leadAgent";
import { runReceptionistAgent } from "../lib/agents/receptionistAgent";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
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

  const bot = await getBotByPublicKey(publicKey);
  const finalConversationId = conversationId || crypto.randomUUID();

  const dbInstance = await getDb();
  const convoRepo = dbInstance.getRepository(Conversation);

  // ── 1. Load or create conversation ─────────────────────────────────────────
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

  const alreadyComplete = convo.state === "completed";

  // ── 2. Run Lead Agent + RAG in parallel ────────────────────────────────────
  const contactEnabled = bot.contact_enabled !== false;

  const knownInfo = {
    name: convo.name ?? undefined,
    email: convo.email ?? undefined,
    phone: convo.phone ?? undefined,
  };

  const [leadDecision, websiteContext] = await Promise.all([
    !contactEnabled || alreadyComplete
      ? Promise.resolve(
          alreadyComplete
            ? {
                collectedInfo: knownInfo,
                missingFields: [] as ("name" | "email" | "phone")[],
                isComplete: true,
              }
            : null,
        )
      : runLeadAgent(fullConversation, bot.contact_prompt, knownInfo),
    retrieveWebsiteContext(publicKey, message),
  ]);

  // ── 3. Persist partial contact info as it is collected ─────────────────────
  if (
    contactEnabled &&
    !alreadyComplete &&
    leadDecision &&
    !leadDecision.isComplete
  ) {
    const partial = leadDecision.collectedInfo;
    const updates: Partial<Conversation> = {};

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

  // ── 4. Fire leads pipeline when collection completes ───────────────────────
  if (contactEnabled && leadDecision?.isComplete && !alreadyComplete) {
    const { name = "", email = "", phone = "" } = leadDecision.collectedInfo;

    console.log("[route] LEAD COMPLETE — firing pipeline:", {
      name,
      email,
      phone,
    });

    // Mark conversation complete
    await convoRepo.update(convo.id, {
      state: "completed",
      name,
      email,
      phone,
    });

    const leadRepo = dbInstance.getRepository(Lead);
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

  // ── 5. Save user message to conversation history ───────────────────────────
  await convoRepo.update(convo.id, {
    message_count: convo.message_count + 1,
    messages: JSON.stringify(fullConversation),
  });

  // ── 6. Stream receptionist response ────────────────────────────────────────
  let result;
  try {
    result = runReceptionistAgent({
      messages: fullConversation,
      botConfig: bot,
      leadDecision,
      websiteContext,
    });
  } catch (err: any) {
    console.error("[route] Sync error starting agent:", err);
    const isQuota =
      err?.statusCode === 429 ||
      err?.lastError?.statusCode === 429 ||
      err?.message?.includes("quota");
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
      try {
        for await (const part of result.fullStream) {
          if (part.type === "text-delta") {
            controller.enqueue(encoder.encode(part.text));
          } else if (part.type === "error") {
            console.error("[route] fullStream error:", part.error);
            const err: any = part.error;
            const isQuota =
              err?.statusCode === 429 ||
              err?.lastError?.statusCode === 429 ||
              err?.message?.toLowerCase().includes("quota") ||
              String(err).includes("429") ||
              String(err).includes("quota");

            if (isQuota) {
              controller.enqueue(
                encoder.encode(
                  "\n\n*Your free tier of the day is over. Please try again later.*",
                ),
              );
            } else {
              controller.enqueue(
                encoder.encode(
                  "\n\n*Sorry, an error occurred while generating the response.*",
                ),
              );
            }
          }
        }
      } catch (err: any) {
        console.error("[route] Stream error exception:", err);
        const isQuota =
          err?.statusCode === 429 ||
          err?.lastError?.statusCode === 429 ||
          err?.message?.toLowerCase().includes("quota") ||
          String(err).includes("429");

        if (isQuota) {
          controller.enqueue(
            encoder.encode(
              "\n\n*Your free tier of the day is over. Please try again later.*",
            ),
          );
        } else {
          controller.enqueue(
            encoder.encode(
              "\n\n*Sorry, an error occurred while generating the response.*",
            ),
          );
        }
      } finally {
        controller.close();
      }
    },
  });

  const [streamForClient, streamForSaving] = customStream.tee();
  saveAssistantMessage(streamForSaving, convo.id, fullConversation).catch(
    console.error,
  );

  return new Response(streamForClient, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
      ...corsHeaders,
    },
  });
}

async function saveAssistantMessage(
  stream: ReadableStream,
  conversationId: string,
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

  const dbInstance = await getDb();
  const convoRepo = dbInstance.getRepository(Conversation);
  await convoRepo.update(conversationId, { messages: JSON.stringify(updated) });
}
