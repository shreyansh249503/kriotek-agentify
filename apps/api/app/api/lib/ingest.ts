import { qdrant } from "./qdrant";
import { createEmbedding } from "./embeddings";

export async function ingestDocument(publicKey: string, content: string) {
  const embedding = await createEmbedding(content);

  await qdrant.upsert("website_docs", {
    points: [
      {
        id: crypto.randomUUID(),
        vector: embedding,
        payload: {
          public_key: publicKey,
          content,
        },
      },
    ],
  });
}
