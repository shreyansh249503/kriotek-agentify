import { streamText } from "ai";
import { google } from "@ai-sdk/google";
import { buildSystemPrompt } from "../lib/agent";

export async function POST(req: Request) {
  const { message } = await req.json();

  const systemPrompt = buildSystemPrompt(
    {
      companyName: "Demo Company",
      companyDescription: "We provide SaaS tools for startups",
      tone: "friendly",
    },
    {
      websiteContext: `
Pricing starts at $29/month.
We offer customer support 24/7.
Free trial available for 7 days.
      `,
    }
  );

  const result = await streamText({
    model: google("gemini-2.5-flash"),
    system: systemPrompt,
    prompt: message,
  });

  return result.toTextStreamResponse();
}
