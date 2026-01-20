import { getUserFromRequest } from "../lib/auth";
import { db } from "../lib/db";
import { ingestDocument } from "../lib/ingest";

const corsHeaders = {
  "Access-Control-Allow-Origin": "http://localhost:3001",
  "Access-Control-Allow-Methods": "POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

export async function POST(req: Request) {
  const user = await getUserFromRequest(req);
  if (!user) {
    return new Response("Unauthorized", { status: 401, headers: corsHeaders });
  }

  const { publicKey, content } = await req.json();

  if (!publicKey || !content) {
    return new Response("Missing botId or content", {
      status: 400,
      headers: corsHeaders,
    });
  }

const result = await db.query(
  "SELECT id FROM bots WHERE public_key = $1 AND user_id = $2",
  [publicKey, user.id],
);

  if (result.rowCount === 0) {
    return new Response("Forbidden", {
      status: 403,
      headers: corsHeaders,
    });
  }

  await ingestDocument(publicKey, content);

  return new Response(JSON.stringify({ status: "success" }), {
    headers: corsHeaders,
  });
}
