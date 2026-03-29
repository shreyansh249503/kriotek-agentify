import { getDb } from "./db";
import { createEmbedding } from "./embeddings";
import { BotDocument } from "./entities";

export async function retrieveWebsiteContext(
  publicKey: string,
  query: string,
): Promise<string> {
  const embedding = await createEmbedding(query);
  const embeddingStr = `[${embedding.join(",")}]`;

  try {
    const db = await getDb();

    const result = await db.getRepository(BotDocument)
      .createQueryBuilder("doc")
      .select(["doc.content"])
      .where("doc.public_key = :publicKey", { publicKey })
      .orderBy("doc.embedding <=> :embedding", "ASC")
      .setParameter("embedding", embeddingStr)
      .limit(3)
      .getMany();

    if (!result || result.length === 0) {
      return "No relevant website information found.";
    }

    return result
      .map((p: any) => p.content)
      .filter(Boolean)
      .join("\n");
  } catch (error: any) {
    console.error("Vector search error:", error);
    throw error;
  }
}
