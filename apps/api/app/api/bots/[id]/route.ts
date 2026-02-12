import { db } from "../../lib/db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const result = await db.query("SELECT * FROM bots WHERE id = $1", [id]);

  if (!result.rows[0]) {
    return Response.json({ error: "Bot not found" }, { status: 404 });
  }

  return Response.json(result.rows[0]);
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await req.json();

  const {
    name,
    description,
    tone,
    primaryColor,
    contactEnabled,
    contactPrompt,
    contactEmailMessage,
  } = body;

  await db.query(
    `
    UPDATE bots
    SET
      name = $1,
      description = $2,
      tone = $3,
      primary_color = $4,
      contact_enabled = $5,
      contact_prompt = $6,
      contact_email_message = $7
    WHERE id = $8
    `,
    [
      name,
      description,
      tone,
      primaryColor,
      contactEnabled,
      contactPrompt,
      contactEmailMessage,
      id,
    ],
  );

  return Response.json({ status: "ok" });
}
