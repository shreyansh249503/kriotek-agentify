import { db } from "../lib/db";

export async function GET() {
  const res = await db.query("SELECT NOW()");
  return Response.json({ time: res.rows[0] });
}
