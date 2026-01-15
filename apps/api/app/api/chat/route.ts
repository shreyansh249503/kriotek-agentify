import { streamText } from "ai";
import { google } from "@ai-sdk/google";
import { buildSystemPrompt } from "../lib/agent";
import { retrieveWebsiteContext } from "../lib/rag";
import { getBotByPublicKey } from "../lib/bot";

export async function POST(req: Request) {
  const { message, botKey } = await req.json();

  if (!botKey || !message) {
    return Response.json(
      { error: "botKey and message are required" },
      { status: 400 }
    );
  }

  const bot = await getBotByPublicKey(botKey);

  const websiteContext = await retrieveWebsiteContext(botKey, message);

  const systemPrompt = buildSystemPrompt(
    {
      companyName: bot.name,
      companyDescription: bot.description,
      tone: bot.tone,
    },
    {
      websiteContext,
    }
  );

  const result = await streamText({
    model: google("gemini-2.5-flash"),
    system: systemPrompt,
    prompt: message,
  });

  return result.toTextStreamResponse();
}
