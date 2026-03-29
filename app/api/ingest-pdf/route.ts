import { createEmbedding } from "@/app/api/lib/embeddings";
import { PDFParse } from "pdf-parse";
import { getDb } from "@/app/api/lib/db";
import { BotDocument } from "@/app/api/lib/entities";

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("file") as File;
  const publicKey = formData.get("publicKey") as string;

  if (!file || !publicKey) {
    return Response.json(
      { error: "Missing file or publicKey" },
      { status: 400 },
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const data = await new PDFParse({ data: buffer }).getText();

  const text = data.text;

  const chunks = text.match(/(.|[\r\n]){1,800}/g) || [];

  const db = await getDb();
  const repo = db.getRepository(BotDocument);

  for (const chunk of chunks) {
    const embedding = await createEmbedding(chunk);
    const embeddingStr = `[${embedding.join(",")}]`;

    const doc = repo.create({
      content: chunk,
      public_key: publicKey,
      embedding: embeddingStr,
    });
    await repo.save(doc);
  }

  return Response.json({
    status: "ok",
    chunks: chunks.length,
  });
}
