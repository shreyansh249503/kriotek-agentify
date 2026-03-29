import { getDb } from "../lib/db";

export async function GET() {
  const db = await getDb();
  const res = await db.query("SELECT NOW()");
  return Response.json({ time: res[0] });
}
