import { qdrant } from "./qdrant";
import { createEmbedding } from "./embeddings";

export async function retrieveWebsiteContext(
  botId: string,
  query: string
): Promise<string> {
  const embedding = await createEmbedding(query);

  try {
    // First, try without filter to see if that's the issue
    const result = await qdrant.search("website_docs", {
      vector: embedding,
      limit: 3,
      with_payload: true,
    });

    console.log("Search results:", result);

    if (!result || result.length === 0) {
      return "No relevant website information found.";
    }

    // Filter by botId in code instead
    const filtered = result.filter((p) => p.payload?.botId === botId);

    return filtered
      .map((p) => p.payload?.content)
      .filter(Boolean)
      .join("\n");
  } catch (error: any) {
    console.error("Qdrant search error:", error);
    console.error("Error details:", JSON.stringify(error.data, null, 2));
    throw error;
  }
}
