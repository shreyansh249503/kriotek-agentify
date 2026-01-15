import { qdrant } from "./qdrant";

export async function setupCollection() {
  await qdrant.createCollection("website_docs", {
    vectors: {
      size: 768,
      distance: "Cosine",
    },
  });
}
