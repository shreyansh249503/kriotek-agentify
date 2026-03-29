import { getUserFromRequest } from "../lib/auth";
import { getDb } from "../lib/db";
import { Bot } from "../lib/entities";
import { ingestDocument } from "../lib/ingest";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
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

  const db = await getDb();
  const botExists = await db.getRepository(Bot).exists({
    where: { public_key: publicKey, user_id: user.id },
  });

  if (!botExists) {
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
