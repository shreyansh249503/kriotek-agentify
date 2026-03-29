import { streamText } from "ai";
import { google } from "@ai-sdk/google";
import { getBotByPublicKey } from "../lib/bot";
import { retrieveWebsiteContext } from "../lib/rag";
import { buildSystemPrompt } from "../lib/agent";
import { sendOwnerNotification, sendUserEmail } from "../lib/sendEmail";
import { getDb } from "../lib/db";
import { Conversation, Lead } from "../lib/entities";
import { generateUserConfirmationTemplate } from "../lib/emailTemplates";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const YES_WORDS = ["yes", "sure", "yeah", "yep"];
const NO_WORDS = ["no", "nope", "not now"];
const ACK_WORDS = ["ok", "okay", "thanks", "thank you"];
const EXIT_WORDS = ["skip", "cancel", "no thanks"];
const CONTACT_TRIGGER_AFTER = 3;

function isValidEmail(text: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text);
}

function isValidPhone(text: string) {
  return /^[0-9+\-\s()]{7,15}$/.test(text);
}

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
  const lower = message.toLowerCase();
  const finalConversationId = conversationId || crypto.randomUUID();

  const db = await getDb();
  const convoRepo = db.getRepository(Conversation);

  let convo = await convoRepo.findOne({
    where: { id: finalConversationId, bot_id: bot.id }
  });

  if (!convo) {
    convo = convoRepo.create({
      id: finalConversationId,
      bot_id: bot.id,
      state: "idle",
      message_count: 0,
      messages: "[]"
    });
    await convoRepo.save(convo);
  }

  convo.message_count++;
  await convoRepo.update(convo.id, { message_count: convo.message_count });

  const CONTACT_STATES = ["awaiting_name", "awaiting_email", "awaiting_phone"];
  const inContactFlow = CONTACT_STATES.includes(convo.state);

  if (
    bot.contact_enabled &&
    inContactFlow &&
    EXIT_WORDS.some((w) => lower.includes(w))
  ) {
    await convoRepo.update(convo.id, { state: 'idle', declined: true });

    return new Response("No worries 🙂 How else can I help you?", {
      headers: corsHeaders,
    });
  }

  if (bot.contact_enabled) {
    if (
      convo.state === "idle" &&
      convo.prompted &&
      YES_WORDS.some((w) => lower.includes(w))
    ) {
      await convoRepo.update(convo.id, { state: 'awaiting_name' });
      return new Response("Great! What's your name?", { headers: corsHeaders });
    }

    if (
      convo.state === "idle" &&
      convo.prompted &&
      NO_WORDS.some((w) => lower.includes(w))
    ) {
      await convoRepo.update(convo.id, { declined: true });
      return new Response(
        "No problem 🙂 Let me know if you need anything else.",
        { headers: corsHeaders },
      );
    }

    if (convo.state === "awaiting_name") {
      convo.name = message;
      convo.state = 'awaiting_email';
      await convoRepo.update(convo.id, { name: message, state: 'awaiting_email' });
      return new Response("What's your email?", { headers: corsHeaders });
    }

    if (convo.state === "awaiting_email") {
      if (!isValidEmail(message)) {
        const clarification = await streamText({
          model: google("gemini-2.5-flash-lite"),
          system: `
Explain briefly why email is needed.
Be friendly and reassuring.
Keep it short.
`,
          prompt: message,
        });

        let reply = "";
        for await (const chunk of clarification.textStream) {
          reply += chunk;
        }

        reply += "\n\nWhenever you're ready, please share your email 🙂";
        return new Response(reply, { headers: corsHeaders });
      }

      convo.email = message;
      convo.state = 'awaiting_phone';
      await convoRepo.update(convo.id, { email: message, state: 'awaiting_phone' });

      return new Response("Your contact number?", {
        headers: corsHeaders,
      });
    }

    if (convo.state === "awaiting_phone") {
      if (!isValidPhone(message)) {
        return new Response(
          "Please share a valid contact number so our team can reach you 🙂",
          { headers: corsHeaders },
        );
      }

      await convoRepo.update(convo.id, { phone: message, state: 'completed' });

      const leadRepo = db.getRepository(Lead);
      const newLead = leadRepo.create({
        bot_id: bot.id,
        name: convo.name,
        email: convo.email,
        phone: message
      });
      await leadRepo.save(newLead);

      const html = generateUserConfirmationTemplate({
        userName: convo.name,
        companyName: bot.name,
        companyDescription: bot.description,
        customMessage: bot.contact_email_message,
        userEmail: convo.email,
        userPhone: message,
      });

      await sendUserEmail({
        to: convo.email,
        subject: `Thank you for contacting ${bot.name}`,
        body: "We'll contact you shortly.",
        html,
      });

      if (bot.contact_email) {
        await sendOwnerNotification({
          ownerEmail: bot.contact_email,
          botName: bot.name,
          leadData: {
            name: convo.name,
            email: convo.email,
            phone: message,
          },
        });
      }

      await convoRepo.update(convo.id, { state: 'idle', prompted: true });

      return new Response("Thanks! Our team will contact you shortly.", {
        headers: corsHeaders,
      });
    }
  }

  let conversationHistory = [];

  try {
    conversationHistory = JSON.parse(convo.messages || "[]");
  } catch {
    conversationHistory = [];
  }

  conversationHistory.push({
    role: "user",
    content: message,
  });

  const websiteContext = await retrieveWebsiteContext(publicKey, message);

  const systemPrompt = buildSystemPrompt(
    {
      companyName: bot.name,
      companyDescription: bot.description,
      tone: bot.tone as "friendly" | "professional",
    },
    { websiteContext },
  );

  const result = await streamText({
    model: google("gemini-2.5-flash-lite"),
    system: systemPrompt,
    prompt: conversationHistory,
  });

  let aiText = "";
  for await (const chunk of result.textStream) {
    aiText += chunk;
  }

  if (
    bot.contact_enabled &&
    convo.state === "idle" &&
    convo.message_count >= CONTACT_TRIGGER_AFTER &&
    convo.message_count % 3 === 0 &&
    !convo.declined &&
    bot.contact_prompt &&
    !ACK_WORDS.includes(lower)
  ) {
    await convoRepo.update(convo.id, { prompted: true });

    aiText += `\n\n${bot.contact_prompt}`;
  }

  conversationHistory.push({
    role: "assistant",
    content: aiText,
  });

  await convoRepo.update(convo.id, { messages: JSON.stringify(conversationHistory) });

  return new Response(aiText, {
    headers: {
      ...corsHeaders,
      "Content-Type": "text/plain",
    },
  });
}
