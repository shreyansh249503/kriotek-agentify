import { getDb } from "../lib/db";
import { SavedAvatar } from "../lib/entities";
import { getUserFromRequest } from "../lib/auth";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,DELETE,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

export async function GET(req: Request) {
  const user = await getUserFromRequest(req);
  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
  }

  const db = await getDb();
  const avatars = await db
    .getRepository(SavedAvatar)
    .find({ where: { user_id: user.id }, order: { created_at: "DESC" } });

  return new Response(JSON.stringify(avatars), { headers: corsHeaders });
}

export async function POST(req: Request) {
  const user = await getUserFromRequest(req);
  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
  }

  const { name, avatar_prompt, image_data } = await req.json();
  if (!image_data) {
    return new Response(JSON.stringify({ error: "image_data is required" }), { status: 400, headers: corsHeaders });
  }

  const db = await getDb();
  const repo = db.getRepository(SavedAvatar);
  const saved = repo.create({ user_id: user.id, name, avatar_prompt, image_data });
  const result = await repo.save(saved);

  return new Response(JSON.stringify(result), { status: 201, headers: corsHeaders });
}
