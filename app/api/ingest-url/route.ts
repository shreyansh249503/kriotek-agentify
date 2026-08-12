import { getUserFromRequest } from "../lib/auth";
import { chunkText } from "../lib/chunker";
import { crawlWebsite } from "../lib/crawler";
import { getDb } from "../lib/db";
import { Bot, CrawledPage } from "../lib/entities";
import { ingestDocument } from "../lib/ingest";
import { setupCollection } from "../lib/vector-db-setup";

export async function POST(req: Request) {
  await setupCollection();

  const user = await getUserFromRequest(req);

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { publicKey, url, extractProducts } = await req.json();

  if (!publicKey || !url) {
    return Response.json(
      { error: "publicKey and url required" },
      { status: 400 },
    );
  }

  const db = await getDb();
  const bot = await db.getRepository<Bot>("Bot").findOne({
    where: { public_key: publicKey, user_id: user.id },
  });

  if (!bot) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const existing = await db.getRepository<CrawledPage>("CrawledPage").exists({
    where: { bot_public_key: publicKey, page_url: url },
  });

  if (existing) {
    return Response.json(
      {
        alreadyCrawled: true,
        message: "This URL has already been crawled",
      },
      { status: 200 },
    );
  }

  const { collectedText, products } = await crawlWebsite(
    url,
    publicKey,
    40,
    !!extractProducts,
  );

  if (!collectedText || collectedText.length < 200) {
    return Response.json(
      { error: "No readable content found on this page" },
      { status: 400 },
    );
  }

  let productsExtractedCount = 0;
  if (extractProducts && products && products.length > 0) {
    const existingProducts = bot.ecommerce_products || [];
    const mergedProducts = [...existingProducts];
    for (const newProduct of products) {
      const isDup = mergedProducts.some(
        (p) =>
          (p.url && p.url === newProduct.url) ||
          p.name.toLowerCase() === newProduct.name.toLowerCase(),
      );
      if (!isDup) {
        mergedProducts.push(newProduct);
        productsExtractedCount++;
      }
    }
    bot.ecommerce_products = mergedProducts;
    bot.ecommerce_enabled = true;
    await db.getRepository("Bot").save(bot);
  }

  const chunks = chunkText(collectedText);

  console.log("CHUNKS COUNT:", chunks.length);

  const batchSize = 10;
  for (let i = 0; i < chunks.length; i += batchSize) {
    const batch = chunks.slice(i, i + batchSize);
    await Promise.all(batch.map((chunk) => ingestDocument(publicKey, chunk)));
  }

  return Response.json({
    success: true,
    chunksIngested: chunks.length,
    productsExtractedCount,
  });
}
