
import { ingestDocument } from "../lib/ingest";

export async function POST() {
  await ingestDocument(
    "demo-agentify",
    "Pricing starts at $29/month with a 7-day free trial."
  );

  return Response.json({
    status: "success",
    message: "Document ingested",
  });
}
