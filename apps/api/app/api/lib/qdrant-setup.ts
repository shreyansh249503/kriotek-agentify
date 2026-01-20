import { qdrant } from "./qdrant";

export async function setupCollection() {
  const collectionName = "website_docs";

  const collections = await qdrant.getCollections();
  const exists = collections.collections.some((c) => c.name === collectionName);

  if (!exists) {
    console.log("Creating Qdrant collection:", collectionName);

    await qdrant.createCollection(collectionName, {
      vectors: {
        size: 768,
        distance: "Cosine",
      },
    });
  }

  try {
    await qdrant.createPayloadIndex(collectionName, {
      field_name: "public_key",
      field_schema: "keyword",
    });
  } catch (e) {}

  console.log("Qdrant collection ready");
}
