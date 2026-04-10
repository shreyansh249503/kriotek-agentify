import { nanoid } from "nanoid";
import { getDb } from "../lib/db";
import { Bot } from "../lib/entities";
import { getUserFromRequest } from "../lib/auth";
import { canCreateBot } from "../lib/subscription";

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

  const db = await getDb();
  const bots = await db.getRepository(Bot).find({ where: { user_id: user.id } });

  return new Response(JSON.stringify(bots), {
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

  const allowed = await canCreateBot(user.id);
  if (!allowed) {
    return new Response(
      JSON.stringify({ error: "Bot limit reached. Upgrade your plan to create more bots." }),
      { status: 403, headers: corsHeaders },
    );
  }

  const body = await req.json();
  const {
    name,
    description,
    tone = "friendly",
    primaryColor = "#000000",
    contactEnabled = false,
    contactEmail = "",
    contactPrompt = "Would you like us to contact you for more details?",
    contactEmailMessage = "Thanks for reaching out! Our team will contact you shortly.",
  } = body;

  const publicKey = nanoid(16);

  const db = await getDb();
  const botRepo = db.getRepository(Bot);
  
  const newBot = botRepo.create({
    public_key: publicKey,
    name,
    description,
    tone,
    primary_color: primaryColor,
    contact_enabled: contactEnabled,
    contact_email: contactEmail,
    contact_prompt: contactPrompt,
    contact_email_message: contactEmailMessage,
    user_id: user.id
  });

  const savedBot = await botRepo.save(newBot);

  return new Response(JSON.stringify(savedBot), {
    headers: corsHeaders,
  });
}