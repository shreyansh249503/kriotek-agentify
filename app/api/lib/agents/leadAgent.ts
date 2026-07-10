import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";

const LeadExtractionSchema = z.object({
  name: z
    .string()
    .optional()
    .describe(
      "Full name of the user, only if clearly provided in response to being asked.",
    ),
  email: z
    .string()
    .optional()
    .describe("Email address exactly as typed. Must contain @ and a domain."),
});

export type LeadDecision = {
  collectedInfo: { name?: string; email?: string; phone?: string };
  missingFields: ("name" | "email")[];
  isComplete: boolean;
};

export interface KnownInfo {
  name?: string | null;
  email?: string | null;
  phone?: string | null;
}

type Message = {
  role: "user" | "assistant" | "system" | "data";
  content: string;
};

const emailValid = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

const NOT_A_NAME = new Set([
  "yes",
  "no",
  "ok",
  "okay",
  "sure",
  "nope",
  "yeah",
  "yep",
  "nah",
  "not",
  "now",
  "later",
  "never",
  "maybe",
  "perhaps",
  "possibly",
  "absolutely",
  "certainly",
  "exactly",
  "thanks",
  "thank",
  "hello",
  "hi",
  "hey",
  "bye",
  "goodbye",
  "please",
  "sorry",
  "fine",
  "great",
  "good",
  "nice",
  "cool",
  "perfect",
  "interesting",
  "awesome",
  "wonderful",
  "excellent",
  "amazing",
  "right",
  "correct",
  "wrong",
  "true",
  "false",
  "skip",
  "cancel",
  "stop",
  "done",
  "help",
  "more",
  "all",
  "website",
  "email",
  "phone",
  "number",
  "service",
  "services",
  "company",
  "business",
  "team",
  "product",
  "products",
  "price",
  "pricing",
  "cost",
  "contact",
  "info",
  "information",
  "details",
  "question",
  "answer",
  "support",
  "chat",
  "message",
  "app",
  "mobile",
  "web",
  "development",
  "design",
  "platform",
  "software",
  "tech",
  "technology",
  "digital",
  "project",
  "projects",
  "solution",
  "solutions",
  "client",
  "non",
  "oui",
  "merci",
  "bonjour",
  "salut",
  "bien",
  "voila",
  "alors",
  "si",
  "gracias",
  "hola",
  "vale",
  "claro",
  "bueno",
  "bien",
  "haan",
  "nahi",
  "theek",
  "shukriya",
  "namaste",
  "acha",
  "accha",
]);

const NAME_REQUEST_PATTERNS = [
  "what's your name",
  "whats your name",
  "your name",
  "who am i speaking",
  "may i know your name",
  "can i get your name",
  "could you share your name",
  "what do i call you",
  "what should i call you",
  "who do i have",
  "introduce yourself",
  "who is this",
  "what's your full name",
  "first name",
];

const SENTENCE_WORDS = [
  "the",
  "and",
  "or",
  "for",
  "with",
  "about",
  "your",
  "our",
  "em",
  "me",
  "us",
  "it",
  "my",
  "his",
  "her",
  "their",
  "this",
  "that",
  "how",
  "what",
  "when",
  "where",
  "why",
];

function isLikelyNotAName(value: string): boolean {
  if (!value) return true;
  const lower = value.trim().toLowerCase();
  const words = lower.split(/\s+/);

  if (NOT_A_NAME.has(lower)) return true;
  if (NOT_A_NAME.has(words[0])) return true;
  if (words.length > 1 && NOT_A_NAME.has(words[words.length - 1])) return true;
  if (/\d/.test(lower)) return true;
  if (lower.includes("@")) return true;
  if (lower.length < 2) return true;
  if (words.some((w) => SENTENCE_WORDS.includes(w))) return true;
  if (words.length > 4) return true;

  return false;
}

// Scan the FULL conversation history for any name request -> answer pair.
// This is immune to the race condition where the last assistant message
// isn't saved yet because saveAssistantMessage runs async after streaming.
function extractNameFromConversationHistory(
  conversation: Message[],
): string | undefined {
  const msgs = conversation.filter(
    (m) => m.role === "user" || m.role === "assistant",
  );

  for (let i = 0; i < msgs.length - 1; i++) {
    const msg = msgs[i];
    if (msg.role !== "assistant") continue;

    const lower = msg.content.toLowerCase();
    const botAskedForName = NAME_REQUEST_PATTERNS.some((p) =>
      lower.includes(p),
    );
    if (!botAskedForName) continue;

    const next = msgs[i + 1];
    if (!next || next.role !== "user") continue;

    const candidate = next.content.trim();

    if (isLikelyNotAName(candidate)) continue;

    if (candidate.split(/\s+/).length > 5) continue;

    if (/[^a-zA-Z\s\-'.]/.test(candidate)) continue;

    return candidate;
  }

  return undefined;
}

export async function runLeadAgent(
  conversation: Message[],
  _botContactPrompt?: string | null,
  knownInfo?: KnownInfo,
): Promise<LeadDecision> {
  const dbName = (knownInfo?.name || "").trim();
  const dbEmail = (knownInfo?.email || "").trim();

  console.log("[leadAgent] knownInfo from DB:", { dbName, dbEmail });

  const userText = conversation
    .filter((m) => m.role === "user")
    .map((m) => m.content)
    .join(" ")
    .toLowerCase();

  let finalName = dbName;

  if (!finalName) {
    const historyName = extractNameFromConversationHistory(conversation);
    if (historyName) {
      console.log("[leadAgent] Name found via history scan:", historyName);
      finalName = historyName;
    }
  }

  let extractedEmail: string | undefined;

  const needsEmail = !emailValid(dbEmail);

  if (needsEmail) {
    const alreadyHave = [
      finalName ? `name: "${finalName}" (confirmed)` : "",
      emailValid(dbEmail) ? `email: "${dbEmail}" (confirmed)` : "",
    ]
      .filter(Boolean)
      .join("\n");

    try {
      const conversationText = conversation
        .filter((m) => m.role === "user" || m.role === "assistant")
        .map((m) => `${m.role === "user" ? "USER" : "ASSISTANT"}: ${m.content}`)
        .join("\n\n");

      const { object } = await generateObject({
        model: google("gemini-2.5-flash-lite"),
        schema: LeadExtractionSchema,
        prompt: `Extract contact details the USER explicitly typed in this conversation.

STRICT RULES:
- ONLY extract values the user actually typed. Never invent.
- Do not use placeholder values.
- Leave undefined if not clearly provided.

${alreadyHave ? `ALREADY CONFIRMED (skip these):\n${alreadyHave}\n` : ""}

EMAIL: Extract only valid email — something@domain.tld
NAME: Only extract if you see a see a clear name. When uncertain → undefined.

Default to undefined. False positives cause real harm.

Conversation History:
${conversationText}

Please extract the name and email fields according to the rules above.`,
      });

      extractedEmail = object.email;

      if (!finalName && object.name && !isLikelyNotAName(object.name)) {
        const nameLower = object.name.trim().toLowerCase();
        if (userText.includes(nameLower)) {
          finalName = object.name.trim();
          console.log("[leadAgent] Name found via model:", finalName);
        }
      }
    } catch (err) {
      console.error("[leadAgent] generateObject error (skipping extraction):", err);
    }
  }

  function verifyInUserText(val?: string): string {
    if (!val) return "";
    const clean = val.trim().toLowerCase();
    return userText.includes(clean) ? val.trim() : "";
  }

  const rawEmail = extractedEmail?.trim() || "";
  const finalEmail = emailValid(dbEmail)
    ? dbEmail
    : emailValid(rawEmail) && verifyInUserText(rawEmail)
      ? rawEmail
      : "";

  const missingFields: ("name" | "email")[] = [];
  if (!finalName) missingFields.push("name");
  if (!emailValid(finalEmail)) missingFields.push("email");

  const result: LeadDecision = {
    collectedInfo: {
      name: finalName || undefined,
      email: emailValid(finalEmail) ? finalEmail : undefined,
    },
    missingFields,
    isComplete: missingFields.length === 0,
  };

  console.log("[leadAgent] result:", JSON.stringify(result));
  return result;
}
