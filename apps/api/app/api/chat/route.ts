import { streamText } from "ai";
import { google } from "@ai-sdk/google";
import { buildSystemPrompt } from "../lib/agent";
import { retrieveWebsiteContext } from "../lib/rag";

export async function POST(req: Request) {
  const { message, botId } = await req.json();

  const websiteContext = await retrieveWebsiteContext(botId, message);

  const systemPrompt = buildSystemPrompt(
    {
      companyName: "Demo Company",
      companyDescription: "We provide SaaS tools for startups",
      tone: "friendly",
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
