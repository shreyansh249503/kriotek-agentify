import { streamText } from "ai";
import { google } from "@ai-sdk/google";
import { getBotByPublicKey } from "../lib/bot";
import { retrieveWebsiteContext } from "../lib/rag";
import { buildSystemPrompt } from "../lib/agent";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function POST(req: Request) {
  const { message, publicKey } = await req.json();

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
    model: google("gemini-2.5-flash-lite"),
    system: systemPrompt,
    prompt: message,
  });

  return result.toTextStreamResponse({
    headers: {
      ...corsHeaders,
      "X-Bot-Name": bot.name,
      "X-Bot-Color": bot.primary_color,
    },
  });
}
