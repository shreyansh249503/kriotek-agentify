import { getUserFromRequest } from "../lib/auth";
import { chunkText } from "../lib/chunker";
import { crawlWebsite } from "../lib/crawler";
import { db } from "../lib/db";
import { ingestDocument } from "../lib/ingest";
import { setupCollection } from "../lib/qdrant-setup";

export async function POST(req: Request) {
  await setupCollection();

  const user = await getUserFromRequest(req);
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { publicKey, url } = await req.json();
  if (!publicKey || !url) {
    return Response.json(
      { error: "publicKey and url required" },
      { status: 400 },
    );
  }

  // Ownership check
  const bot = await db.query(
    "SELECT id FROM bots WHERE public_key = $1 AND user_id = $2",
    [publicKey, user.id],
  );

  if (bot.rowCount === 0) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  // Crawl website
  const text = await crawlWebsite(url);
  console.log("CRAWLED TEXT LENGTH:", text.length);

  if (!text || text.length < 200) {
    return Response.json(
      { error: "No readable content found on this page" },
      { status: 400 },
    );
  }

  // Chunk content
  const chunks = chunkText(text);
  console.log("CHUNKS COUNT:", chunks.length);

  // Ingest chunks
  for (const chunk of chunks) {
    await ingestDocument(publicKey, chunk);
  }

  return Response.json({
    success: true,
    chunksIngested: chunks.length,
  });
}
