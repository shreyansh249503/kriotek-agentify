import { ingestDocument } from "../lib/ingest";

export async function POST(req: Request) {
  const { botKey, content } = await req.json();

  if (!botKey || !content) {
    return Response.json(
      { error: "botKey and content are required." },
      { status: 400 }
    );
  }

  await ingestDocument(botKey, content);

  return Response.json({
    status: "success",
    message: "Document ingested",
  });
}
