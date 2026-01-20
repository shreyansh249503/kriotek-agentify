import { db } from "../../lib/db";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const result = await db.query("SELECT * FROM bots WHERE id = $1", [
    params.id,
  ]);

  if (!result.rows[0]) {
    return Response.json({ error: "Bot not found" }, { status: 404 });
  }

  return Response.json(result.rows[0]);
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } },
) {
  const body = await req.json();

  const { name, description, tone, primaryColor } = body;

  await db.query(
    `
    UPDATE bots
    SET
      name = $1,
      description = $2,
      tone = $3,
      primary_color = $4
    WHERE id = $5
    `,
    [name, description, tone, primaryColor, params.id],
  );

  return Response.json({ status: "ok" });
}
