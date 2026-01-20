import { nanoid } from "nanoid";
import { db } from "../lib/db";
import { getUserFromRequest } from "../lib/auth";

const corsHeaders = {
  "Access-Control-Allow-Origin": "http://localhost:3001",
  "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function GET(req: Request) {
  const user = await getUserFromRequest(req);
  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: corsHeaders,
    });
  }

  const result = await db.query("SELECT * FROM bots WHERE user_id = $1", [
    user.id,
  ]);

  return new Response(JSON.stringify(result.rows), {
    headers: corsHeaders,
  });
}

export async function POST(req: Request) {
  const user = await getUserFromRequest(req);
  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: corsHeaders,
    });
  }

  const body = await req.json();
  const {
    name,
    description,
    tone = "friendly",
    primaryColor = "#000000",
  } = body;

  const publicKey = nanoid(16);

  const result = await db.query(
    `
    INSERT INTO bots (public_key, name, description, tone, primary_color, user_id)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
    `,
    [publicKey, name, description, tone, primaryColor, user.id],
  );

  return new Response(JSON.stringify(result.rows[0]), {
    headers: corsHeaders,
  });
}