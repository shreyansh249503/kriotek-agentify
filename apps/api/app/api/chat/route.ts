import { streamText } from "ai";
import { google } from "@ai-sdk/google";
import { getBotByPublicKey } from "../lib/bot";
import { retrieveWebsiteContext } from "../lib/rag";
import { buildSystemPrompt } from "../lib/agent";
import { sendOwnerNotification, sendUserEmail } from "../lib/sendEmail";
import { db } from "../lib/db";
import { generateUserConfirmationTemplate } from "../lib/emailTemplates";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const YES_WORDS = ["yes", "sure", "yeah", "yep"];
const NO_WORDS = ["no", "nope", "not now"];
const ACK_WORDS = ["ok", "okay", "thanks", "thank you"];
const CONTACT_TRIGGER_AFTER = 3;

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function POST(req: Request) {
  const { message, publicKey, conversationId } = await req.json();

  if (!publicKey || !message) {
    return new Response(
      JSON.stringify({ error: "publicKey and message are required" }),
      {
        status: 400,
        headers: corsHeaders,
      },
    );
  }

  const bot = await getBotByPublicKey(publicKey);

  const finalConversationId = conversationId || crypto.randomUUID();

  let convo = (
    await db.query(`SELECT * FROM conversations WHERE id=$1`, [
      finalConversationId,
    ])
  ).rows[0];

  if (!convo) {
    convo = (
      await db.query(
        `INSERT INTO conversations (id, bot_id)
         VALUES ($1,$2) RETURNING *`,
        [finalConversationId, bot.id],
      )
    ).rows[0];
  }

  await db.query(
    `UPDATE conversations SET message_count = message_count + 1 WHERE id=$1`,
    [convo.id],
  );
  convo.message_count++;

  const lower = message.toLowerCase();

  if (!bot.contact_enabled) {
    convo.declined = true;
  }

  if (
    bot.contact_enabled &&
    convo.state === "idle" &&
    convo.prompted &&
    YES_WORDS.some((w) => lower.includes(w))
  ) {
    await db.query(
      `UPDATE conversations SET state='awaiting_name' WHERE id=$1`,
      [convo.id],
    );
    return new Response("Great! What's your name?", { headers: corsHeaders });
  }

  if (
    bot.contact_enabled &&
    convo.state === "idle" &&
    convo.prompted &&
    NO_WORDS.some((w) => lower.includes(w))
  ) {
    await db.query(`UPDATE conversations SET declined=true WHERE id=$1`, [
      convo.id,
    ]);
    return new Response(
      "No problem 🙂 Let me know if you need anything else.",
      { headers: corsHeaders },
    );
  }

  if (convo.state === "awaiting_name") {
    await db.query(
      `UPDATE conversations SET name=$1, state='awaiting_email' WHERE id=$2`,
      [message, convo.id],
    );
    return new Response("What's your email?", { headers: corsHeaders });
  }

  if (convo.state === "awaiting_email") {
    await db.query(
      `UPDATE conversations SET email=$1, state='awaiting_phone' WHERE id=$2`,
      [message, convo.id],
    );
    return new Response("Your contact number?", { headers: corsHeaders });
  }

  if (convo.state === "awaiting_phone") {
    await db.query(
      `UPDATE conversations SET phone=$1, state='completed' WHERE id=$2`,
      [message, convo.id],
    );

    await db.query(
      `INSERT INTO leads (bot_id, name, email, phone)
       VALUES ($1,$2,$3,$4)`,
      [bot.id, convo.name, convo.email, message],
    );

    const userEmailHtml = generateUserConfirmationTemplate({
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
      body: `Hi ${convo.name}, thank you for reaching out! Our team will contact you shortly.`,
      html: userEmailHtml,
    });

    if (bot.owner_email) {
      await sendOwnerNotification({
        ownerEmail: bot.owner_email,
        botName: bot.name,
        leadData: {
          name: convo.name,
          email: convo.email,
          phone: message,
        },
      });
    }

    return new Response("Thanks! Our team will contact you shortly.", {
      headers: corsHeaders,
    });
  }

  let conversationHistory = convo.messages || [];

  conversationHistory.push({
    role: "user",
    content: message,
  });

  const websiteContext = await retrieveWebsiteContext(publicKey, message);

  const systemPrompt = buildSystemPrompt(
    {
      companyName: bot.name,
      companyDescription: bot.description,
      tone: bot.tone,
    },
    {
      websiteContext,
    },
  );

  const result = await streamText({
    // model: google("gemini-3-flash-preview"),
    model: google("gemini-2.5-flash"),
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
    await db.query(`UPDATE conversations SET prompted=true WHERE id=$1`, [
      convo.id,
    ]);

    aiText += `\n\n${bot.contact_prompt}`;
  }

  conversationHistory.push({
    role: "assistant",
    content: aiText,
  });

  await db.query(`UPDATE conversations SET messages = $1 WHERE id = $2`, [
    JSON.stringify(conversationHistory),
    convo.id,
  ]);

  return new Response(aiText, {
    headers: {
      ...corsHeaders,
      "Content-Type": "text/plain",
    },
  });
}
