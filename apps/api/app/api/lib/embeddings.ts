import { embed } from "ai";
import { google } from "@ai-sdk/google";

export async function createEmbedding(text: string): Promise<number[]> {
  const { embedding } = await embed({
    model: google.embedding("text-embedding-004"),
    value: text,
  });

  return embedding;
}
