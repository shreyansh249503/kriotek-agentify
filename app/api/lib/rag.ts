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

    const resultEmbedding = await db.getRepository<BotDocument>("BotDocument")
      .createQueryBuilder("doc")
      .select(["doc.content"])
      .where("doc.public_key = :publicKey", { publicKey })
      .orderBy("doc.embedding <=> :embedding", "ASC")
      .setParameter("embedding", embeddingStr)
      .limit(3)
      .getMany();

    return resultEmbedding
      .map((p) => p.content)
      .filter(Boolean)
      .join("\n");
  } catch (error: unknown) {
    console.error("Vector search error:", error);
    throw error;
  }
}
