
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
  context: AgentContext
): string {
  return `
You are an AI assistant for ${config.companyName}.

Company description:
${config.companyDescription}

Tone:
${config.tone ?? "friendly"}

Rules:
- Answer ONLY using the provided website context
- If the answer is not in the context, say "I don't know"
- Be concise and helpful
- Guide users through the website

Website Context:
${context.websiteContext}
`;
}
