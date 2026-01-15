
import { nanoid } from "nanoid";
import { db } from "../lib/db";

export async function POST(req: Request) {
  const body = await req.json();

  const {
    name,
    description,
    tone = "friendly",
    primaryColor = "#000000",
  } = body;

  if (!name) {
    return Response.json({ error: "Bot name is required" }, { status: 400 });
  }

  const publicKey = nanoid(16);

  const result = await db.query(
    `
    INSERT INTO bots (public_key, name, description, tone, primary_color)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
    `,
    [publicKey, name, description, tone, primaryColor]
  );

  return Response.json(result.rows[0]);
}
