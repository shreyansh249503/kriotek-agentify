import { qdrant } from "@/app/api/lib/qdrant";
import { createEmbedding } from "@/app/api/lib/embeddings";
import { PDFParse } from "pdf-parse";

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

  for (const chunk of chunks) {
    const embedding = await createEmbedding(chunk);

    await qdrant.upsert("website_docs", {
      points: [
        {
          id: crypto.randomUUID(),
          vector: embedding,
          payload: {
            content: chunk,
            public_key: publicKey,
            source: "pdf",
          },
        },
      ],
    });
  }

  return Response.json({
    status: "ok",
    chunks: chunks.length,
  });
}
