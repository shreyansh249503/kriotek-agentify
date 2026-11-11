import { getUserFromRequest } from "../lib/auth";
import { chunkText } from "../lib/chunker";
import { crawlWebsite } from "../lib/crawler";
import { getDb } from "../lib/db";
import { appendCrawledProducts } from "../lib/botProducts";
import { Bot, CrawledPage } from "../lib/entities";
import { ingestDocument } from "../lib/ingest";
import { setupCollection } from "../lib/vector-db-setup";
import { logger } from "../../../lib/logger";

export async function POST(req: Request) {
  const user = await getUserFromRequest(req);

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  await setupCollection();

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

  // The crawl can take minutes. Products are merged into the bot's current list under the bot
  // row lock rather than saving the bot loaded above, which would overwrite any settings or
  // products changed in the meantime.
  let productsExtractedCount = 0;
  if (extractProducts && products && products.length > 0) {
    const result = await appendCrawledProducts(bot.id, products);
    if (!result) {
      return Response.json({ error: "This bot was deleted while the page was being crawled" }, { status: 404 });
    }
    productsExtractedCount = result.added;
  }

  const chunks = chunkText(collectedText);

  logger.info("[ingest-url] Chunks split count", { chunksCount: chunks.length });

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
