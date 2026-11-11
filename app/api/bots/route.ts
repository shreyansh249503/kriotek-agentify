import { nanoid } from "nanoid";
import { getDb } from "../lib/db";
import { Bot } from "../lib/entities";
import { getUserFromRequest } from "../lib/auth";
import { CreateBotSchema, describeIssues, readJson } from "../lib/botInput";
import type { Product } from "@/types/bot";

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
  let bots: Bot[] = [];
  try {
    const rawRows = await db.query(
      `SELECT * FROM bots WHERE user_id = $1 ORDER BY created_at DESC NULLS LAST`,
      [user.id]
    );
    if (Array.isArray(rawRows)) {
      bots = rawRows;
    } else {
      bots = await db.getRepository<Bot>("Bot").find({ where: { user_id: user.id } });
    }
  } catch {
    bots = await db.getRepository<Bot>("Bot").find({ where: { user_id: user.id } });
  }

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

  const body = await readJson(req);
  if (body === null) {
    return new Response(JSON.stringify({ error: "Request body must be JSON" }), {
      status: 400,
      headers: corsHeaders,
    });
  }
  const parsed = CreateBotSchema.safeParse(body);
  if (!parsed.success) {
    return new Response(
      JSON.stringify({ error: "Some bot settings are invalid", details: describeIssues(parsed.error) }),
      { status: 400, headers: corsHeaders },
    );
  }
  const {
    name,
    description,
    tone,
    primaryColor,
    contactEnabled,
    contactEmail,
    contactPrompt,
    contactEmailMessage,
    logoUrl,
    ecommerceEnabled,
    ecommercePrompt,
    ecommerceProducts,
    companyName,
    lastTrainedAt,
  } = parsed.data;

  const publicKey = nanoid(16);

  const db = await getDb();
  const botRepo = db.getRepository<Bot>("Bot");
  
  const newBot = botRepo.create({
    public_key: publicKey,
    name,
    description: description ?? undefined,
    tone,
    primary_color: primaryColor,
    contact_enabled: contactEnabled,
    contact_email: contactEmail ?? undefined,
    contact_prompt: contactPrompt ?? undefined,
    contact_email_message: contactEmailMessage ?? undefined,
    logo_url: logoUrl ?? undefined,
    ecommerce_enabled: ecommerceEnabled,
    ecommerce_prompt: ecommercePrompt ?? undefined,
    ecommerce_products: ecommerceProducts as Product[],
    company_name: companyName ?? undefined,
    last_trained_at: lastTrainedAt ? new Date(lastTrainedAt) : new Date(),
    user_id: user.id
  });

  const savedBot = await botRepo.save(newBot);

  return new Response(JSON.stringify(savedBot), {
    headers: corsHeaders,
  });
}