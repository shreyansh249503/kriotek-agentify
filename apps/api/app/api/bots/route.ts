import { nanoid } from "nanoid";
import { db } from "../lib/db";
import { getUserFromRequest } from "../lib/auth";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
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
    contactPrompt = "Would you like us to contact you for more details?",
    contactEmailMessage = "Thanks for reaching out! Our team will contact you shortly.",
  } = body;

  const publicKey = nanoid(16);

  const result = await db.query(
    `
    INSERT INTO bots (public_key, name, description, tone, primary_color, contact_prompt, contact_email_message, user_id)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *
    `,
    [publicKey, name, description, tone, primaryColor, contactPrompt, contactEmailMessage, user.id],
  );

  return new Response(JSON.stringify(result.rows[0]), {
    headers: corsHeaders,
  });
}