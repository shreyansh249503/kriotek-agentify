import { getDb } from "./db";
import { createEmbedding } from "./embeddings";
import { BotDocument } from "./entities";

export async function ingestDocument(publicKey: string, content: string) {
  const embedding = await createEmbedding(content);
  const embeddingStr = `[${embedding.join(",")}]`;

  const db = await getDb();
  
  const repo = db.getRepository(BotDocument);
  const doc = repo.create({
    public_key: publicKey,
    content: content,
    embedding: embeddingStr
  });

  await repo.save(doc);
}
