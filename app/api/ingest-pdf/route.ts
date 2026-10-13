import "../lib/promise-polyfill";
import { createEmbedding } from "../lib/embeddings";
import { getDb } from "../lib/db";
import { Bot, BotDocument } from "../lib/entities";
import PDFParser from "pdf2json";
import { canManageBot, getRequestPrincipal } from "../lib/requestAuth";

function extractTextFromPdf(buffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    const parser = new PDFParser(null, true);

    parser.on("pdfParser_dataReady", () => {
      const text = parser.getRawTextContent();
      resolve(text);
    });

    parser.on("pdfParser_dataError", (err) => {
      let errMsg = "PDF parsing failed";
      if (err instanceof Error) {
        errMsg = err.message;
      } else {
        const parserErr = err.parserError;
        errMsg = parserErr instanceof Error ? parserErr.message : String(parserErr);
      }
      reject(new Error(errMsg));
    });

    parser.parseBuffer(buffer);
  });
}

const MAX_PDF_BYTES = 10 * 1024 * 1024;

export async function POST(req: Request) {
  const principal = await getRequestPrincipal(req);
  if (!principal) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File;
  const publicKey = formData.get("publicKey") as string;

  if (!file || !publicKey) {
    return Response.json({ error: "Missing file or publicKey" }, { status: 400 });
  }

  if (!(await canManageBot(principal, publicKey))) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  if (file.size > MAX_PDF_BYTES) {
    return Response.json({ error: "PDF too large. Max size is 10MB." }, { status: 413 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const text = await extractTextFromPdf(buffer);

  if (!text?.trim()) {
    return Response.json({ error: "Could not extract text from PDF" }, { status: 400 });
  }

  const chunks = text.match(/(.|[\r\n]){1,800}/g) || [];

  const db = await getDb();
  const repo = db.getRepository<BotDocument>("BotDocument");

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

  try {
    const botRepo = db.getRepository<Bot>("Bot");
    if (botRepo && typeof botRepo.findOne === "function") {
      const bot = await botRepo.findOne({ where: { public_key: publicKey } });
      if (bot) {
        bot.last_trained_at = new Date();
        await botRepo.save(bot);
      }
    }
  } catch {
    await db.query(`UPDATE bots SET last_trained_at = NOW() WHERE public_key = $1`, [publicKey]).catch(() => {});
  }

  return Response.json({ status: "ok", chunks: chunks.length });
}