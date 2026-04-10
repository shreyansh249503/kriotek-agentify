import { getDb } from "../../lib/db";
import { Bot } from "../../lib/entities";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  console.log("Fetching bot with ID:", id);
  console.log("ID type:", typeof id);
  const db = await getDb();
  const bot = await db.getRepository(Bot).findOne({ where: { id } });

  console.log("Query result:", bot);

  if (!bot) {
    return Response.json({ error: "Bot not found" }, { status: 404 });
  }

  return Response.json(bot);
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
    contactEmail,
    contactPrompt,
    contactEmailMessage,
    logoUrl,
  } = body;

  const db = await getDb();
  await db.getRepository(Bot).update(id, {
    name,
    description,
    tone,
    primary_color: primaryColor,
    contact_enabled: contactEnabled,
    contact_email: contactEmail,
    contact_prompt: contactPrompt,
    contact_email_message: contactEmailMessage,
    logo_url: logoUrl,
  });

  return Response.json({ status: "ok" });
}
