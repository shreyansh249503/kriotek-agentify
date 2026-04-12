import { getDb } from "../../lib/db";
import { SavedAvatar } from "../../lib/entities";
import { getUserFromRequest } from "../../lib/auth";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "DELETE,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUserFromRequest(req);
  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
  }

  const { id } = await params;
  const db = await getDb();
  const repo = db.getRepository(SavedAvatar);
  const avatar = await repo.findOne({ where: { id, user_id: user.id } });

  if (!avatar) {
    return new Response(JSON.stringify({ error: "Not found" }), { status: 404, headers: corsHeaders });
  }

  await repo.remove(avatar);
  return new Response(null, { status: 204, headers: corsHeaders });
}
