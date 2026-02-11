import { qdrant } from "./qdrant";
import { createEmbedding } from "./embeddings";

export async function retrieveWebsiteContext(
  publicKey: string,
  query: string,
): Promise<string> {
  const embedding = await createEmbedding(query);

  try {
    const result = await qdrant.search("website_docs", {
      vector: embedding,
      limit: 3,
      with_payload: true,
      filter: {
        must: [
          {
            key: "public_key",
            match: { value: publicKey },
          },
        ],
      },
    });

    if (!result || result.length === 0) {
      return "No relevant website information found.";
    }

    return result
      .map((p) => p.payload?.content)
      .filter(Boolean)
      .join("\n");
  } catch (error: any) {
    console.error("Qdrant search error:", error);
    console.error("Error details:", JSON.stringify(error.data, null, 2));
    throw error;
  }
}
