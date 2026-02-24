import { db } from "@/app/api/lib/db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ publicKey: string }> },
) {
  const { publicKey } = await params;
  const result = await db.query(
    `
    SELECT
      name,
      primary_color
    FROM bots
    WHERE public_key = $1
    `,
    [publicKey],
  );

  if (!result.rows[0]) {
    return Response.json({ error: "Bot not found" }, { status: 404 });
  }

  return Response.json(result.rows[0], {
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
  });
}
