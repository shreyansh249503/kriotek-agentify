import "../lib/promise-polyfill";
import * as Sentry from "@sentry/nextjs";
import { createEmbedding } from "../lib/embeddings";
import { getDb } from "../lib/db";
import { Bot, ShopifyStore } from "../lib/entities";
import { getUserFromRequest } from "../lib/auth";
import { verifySessionToken, getShopFromSession } from "../shopify/lib/verifySessionToken";
import { logger } from "../../../lib/logger";
import PDFParser from "pdf2json";

// Embedding up to MAX_CHUNKS chunks, 10 at a time, takes well under a minute; this leaves headroom.
export const maxDuration = 120;

/**
 * Vercel functions accept request bodies up to 4.5 MB, so larger uploads never reach this code.
 * 4 MB leaves room for the multipart form overhead.
 */
const MAX_PDF_BYTES = 4 * 1024 * 1024;
const CHUNK_SIZE = 800;
/** About 160,000 characters of text (roughly 55–80 pages). Longer PDFs are rejected, not cut short. */
const MAX_CHUNKS = 200;
/** Embedding requests sent to Gemini at the same time. */
const EMBEDDING_CONCURRENCY = 10;
const PARSE_TIMEOUT_MS = 30_000;
const INSERT_BATCH_SIZE = 50;

class PdfReadError extends Error {}

function error(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

function extractTextFromPdf(buffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    const parser = new PDFParser(null, true);
    const timer = setTimeout(() => reject(new PdfReadError("timed out")), PARSE_TIMEOUT_MS);

    parser.on("pdfParser_dataReady", () => {
      clearTimeout(timer);
      try {
        resolve(parser.getRawTextContent());
      } catch (err) {
        reject(new PdfReadError(err instanceof Error ? err.message : String(err)));
      }
    });

    parser.on("pdfParser_dataError", (err) => {
      clearTimeout(timer);
      let errMsg = "PDF parsing failed";
      if (err instanceof Error) {
        errMsg = err.message;
      } else {
        const parserErr = err.parserError;
        errMsg = parserErr instanceof Error ? parserErr.message : String(parserErr);
      }
      reject(new PdfReadError(errMsg));
    });

    try {
      parser.parseBuffer(buffer);
    } catch (err) {
      clearTimeout(timer);
      reject(new PdfReadError(err instanceof Error ? err.message : String(err)));
    }
  });
}

function splitIntoChunks(text: string): string[] {
  const chunks: string[] = [];
  for (let start = 0; start < text.length; start += CHUNK_SIZE) {
    chunks.push(text.slice(start, start + CHUNK_SIZE));
  }
  return chunks;
}

/** Embeds every chunk, at most EMBEDDING_CONCURRENCY at a time. Throws if any request fails. */
async function embedAll(chunks: string[]): Promise<number[][]> {
  const embeddings: number[][] = [];
  for (let i = 0; i < chunks.length; i += EMBEDDING_CONCURRENCY) {
    const batch = chunks.slice(i, i + EMBEDDING_CONCURRENCY);
    embeddings.push(...(await Promise.all(batch.map((chunk) => createEmbedding(chunk)))));
  }
  return embeddings;
}

async function isAuthorized(req: Request, publicKey: string): Promise<boolean> {
  const db = await getDb();

  const user = await getUserFromRequest(req);
  if (user) {
    const bot = await db.getRepository<Bot>("Bot").findOne({
      where: { public_key: publicKey, user_id: user.id },
    });
    if (bot) return true;
  }

  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) return false;
    const session = verifySessionToken(authHeader);
    const shop = getShopFromSession(session);
    if (!shop) return false;
    const store = await db.getRepository<ShopifyStore>("ShopifyStore").findOne({ where: { shop } });
    if (!store?.bot_id) return false;
    const bot = await db.getRepository<Bot>("Bot").findOne({
      where: { id: store.bot_id, public_key: publicKey },
    });
    return !!bot;
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  // Reject oversized uploads before reading the body, when the client says how big it is.
  const declaredLength = Number(req.headers?.get?.("content-length") ?? 0);
  if (declaredLength > MAX_PDF_BYTES + 64 * 1024) {
    return error(`PDF is too large. The limit is ${MAX_PDF_BYTES / 1024 / 1024} MB.`, 413);
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return error("Upload must be a form with a PDF file", 400);
  }
  const file = formData.get("file");
  const publicKey = formData.get("publicKey");

  if (!file || typeof file === "string" || typeof publicKey !== "string" || !publicKey) {
    return error("Missing file or publicKey", 400);
  }

  if (!(await isAuthorized(req, publicKey))) {
    return error("Unauthorized", 401);
  }

  if (typeof file.size === "number" && file.size > MAX_PDF_BYTES) {
    return error(`PDF is too large. The limit is ${MAX_PDF_BYTES / 1024 / 1024} MB.`, 413);
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  if (buffer.length > MAX_PDF_BYTES) {
    return error(`PDF is too large. The limit is ${MAX_PDF_BYTES / 1024 / 1024} MB.`, 413);
  }
  // Every PDF starts with "%PDF-"; checking the bytes works whatever the browser says the type is.
  if (buffer.subarray(0, 5).toString("latin1") !== "%PDF-") {
    return error("This file isn't a PDF", 400);
  }

  let text: string;
  try {
    text = await extractTextFromPdf(buffer);
  } catch (err) {
    logger.warn("[ingest-pdf] Could not read PDF", { publicKey, reason: err instanceof Error ? err.message : String(err) });
    return error("This PDF couldn't be read. It may be damaged or password-protected.", 400);
  }

  if (!text?.trim()) {
    return error("Could not extract text from PDF", 400);
  }

  const chunks = splitIntoChunks(text);
  if (chunks.length > MAX_CHUNKS) {
    return error(
      `This PDF has too much text (about ${Math.round(text.length / 1000)}k characters). ` +
        `The limit is about ${Math.round((MAX_CHUNKS * CHUNK_SIZE) / 1000)}k; split it into smaller files.`,
      400,
    );
  }

  let embeddings: number[][];
  try {
    embeddings = await embedAll(chunks);
  } catch (err) {
    logger.error("[ingest-pdf] Embedding failed", err, { publicKey, chunks: chunks.length });
    Sentry.captureException(err, { tags: { area: "ingest_pdf" }, extra: { publicKey } });
    return error("Couldn't process this PDF right now. Nothing was saved; please try again.", 502);
  }

  // All chunks and the training date are saved together, or not at all.
  try {
    const db = await getDb();
    await db.transaction(async (m) => {
      for (let i = 0; i < chunks.length; i += INSERT_BATCH_SIZE) {
        const values: string[] = [];
        const params: string[] = [];
        chunks.slice(i, i + INSERT_BATCH_SIZE).forEach((chunk, j) => {
          const n = params.length;
          values.push(`($${n + 1}, $${n + 2}, $${n + 3}::vector)`);
          params.push(publicKey, chunk, `[${embeddings[i + j].join(",")}]`);
        });
        await m.query(`INSERT INTO bot_documents (public_key, content, embedding) VALUES ${values.join(", ")}`, params);
      }
      await m.query(`UPDATE bots SET last_trained_at = NOW() WHERE public_key = $1`, [publicKey]);
    });
  } catch (err) {
    logger.error("[ingest-pdf] Saving chunks failed", err, { publicKey, chunks: chunks.length });
    Sentry.captureException(err, { tags: { area: "ingest_pdf" }, extra: { publicKey } });
    return error("Couldn't save this PDF. Nothing was saved; please try again.", 500);
  }

  return Response.json({ status: "ok", chunks: chunks.length });
}
