import { getDb } from "./db";
import { createEmbedding } from "./embeddings";
import { BotDocument } from "./entities";

const QUERY_EMBEDDING_TIMEOUT_MS = 5000;

/**
 * Returns the most relevant knowledge-base chunks for the query, or "" when retrieval fails,
 * so an embedding or vector-search outage degrades the answer instead of failing the chat.
 */
export async function retrieveWebsiteContext(
  publicKey: string,
  query: string,
): Promise<string> {
  try {
    const embedding = await createEmbedding(query, { timeoutMs: QUERY_EMBEDDING_TIMEOUT_MS });
    const embeddingStr = `[${embedding.join(",")}]`;

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
    console.error("[rag] Context retrieval failed; answering without website context:", error);
    return "";
  }
}
