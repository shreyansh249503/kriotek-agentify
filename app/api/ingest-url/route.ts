import { getUserFromRequest } from "../lib/auth";
import { chunkText } from "../lib/chunker";
import { crawlWebsite } from "../lib/crawler";
import { getDb } from "../lib/db";
import { Bot, CrawledPage } from "../lib/entities";
import { ingestDocument } from "../lib/ingest";
import { setupCollection } from "../lib/vector-db-setup";
import { canIngestPage } from "../lib/subscription";

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

  const db = await getDb();
  const botExists = await db.getRepository(Bot).exists({
    where: { public_key: publicKey, user_id: user.id },
  });

  if (!botExists) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const allowed = await canIngestPage(user.id);
  if (!allowed) {
    return Response.json(
      { error: "Knowledge base page limit reached. Upgrade your plan to ingest more pages." },
      { status: 403 },
    );
  }

  // 🔹 NEW: check if root URL already crawled
  const existing = await db.getRepository(CrawledPage).exists({
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

  const text = await crawlWebsite(url, publicKey);

  if (!text || text.length < 200) {
    return Response.json(
      { error: "No readable content found on this page" },
      { status: 400 },
    );
  }

  const chunks = chunkText(text);

  console.log("CHUNKS COUNT:", chunks.length);

  for (const chunk of chunks) {
    await ingestDocument(publicKey, chunk);
  }

  return Response.json({
    success: true,
    chunksIngested: chunks.length,
  });
}
