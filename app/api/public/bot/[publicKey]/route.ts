import { getDb } from "@/app/api/lib/db";
import { Bot } from "@/app/api/lib/entities";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ publicKey: string }> },
) {
  const { publicKey } = await params;
  const db = await getDb();
  const bot = await db.getRepository(Bot).findOne({
    where: { public_key: publicKey },
    select: ["name", "primary_color", "logo_url"],
  }).catch((err) => {
    console.log("Error", err);
    return null;
  });

  if (!bot) {
    return Response.json({ error: "Bot not found" }, { status: 404 });
  }

  return Response.json(bot, {
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
  });
}
