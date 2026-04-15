import "../lib/promise-polyfill";
import { createEmbedding } from "../lib/embeddings";
import { getDb } from "../lib/db";
import { BotDocument } from "../lib/entities";
import PDFParser from "pdf2json";

function extractTextFromPdf(buffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    const parser = new PDFParser(null, true);

    parser.on("pdfParser_dataReady", () => {
      const text = (parser as any).getRawTextContent();
      resolve(text);
    });

    parser.on("pdfParser_dataError", (err: any) => {
      reject(new Error(err?.parserError || "PDF parsing failed"));
    });

    parser.parseBuffer(buffer);
  });
}

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("file") as File;
  const publicKey = formData.get("publicKey") as string;

  if (!file || !publicKey) {
    return Response.json({ error: "Missing file or publicKey" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const text = await extractTextFromPdf(buffer);

  if (!text?.trim()) {
    return Response.json({ error: "Could not extract text from PDF" }, { status: 400 });
  }

  const chunks = text.match(/(.|[\r\n]){1,800}/g) || [];

  const db = await getDb();
  const repo = db.getRepository(BotDocument);

  await Promise.all(
    chunks.map(async (chunk) => {
      const embedding = await createEmbedding(chunk);
      const embeddingStr = `[${embedding.join(",")}]`;
      const doc = repo.create({
        content: chunk,
        public_key: publicKey,
        embedding: embeddingStr,
      });
      await repo.save(doc);
    })
  );

  return Response.json({ status: "ok", chunks: chunks.length });
}