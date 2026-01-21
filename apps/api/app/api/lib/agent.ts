export type AgentConfig = {
  companyName: string;
  companyDescription: string;
  tone?: "friendly" | "professional";
};

export type AgentContext = {
  websiteContext: string;
};

export function buildSystemPrompt(
  config: AgentConfig,
  context: AgentContext,
): string {
  return `
You are an AI assistant for ${config.companyName}.

Company description:
${config.companyDescription}

Tone:
${config.tone ?? "friendly"}

Guidelines:
- Use the website context as your PRIMARY source of truth
- Do NOT copy sentences verbatim unless necessary
- Rephrase and explain in your own words
- Add helpful clarification to answer the user's question clearly
- Stay strictly within the meaning of the provided context
- If the context does not contain enough information, say "I don’t have enough information to answer that"
- Be concise, helpful, and user-friendly
- Do not invent features, pricing, or policies

Website Context:
${context.websiteContext}
`;
}
