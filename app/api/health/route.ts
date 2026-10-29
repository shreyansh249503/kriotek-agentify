import { NextResponse } from "next/server";
import { getDb } from "../lib/db";

export const dynamic = "force-dynamic";

const noStore = { "Cache-Control": "no-store" };

export async function GET() {
  try {
    const db = await getDb();
    await db.query("SELECT 1");
    return NextResponse.json(
      { status: "ok", timestamp: new Date().toISOString() },
      { headers: noStore },
    );
  } catch (error: unknown) {
    // Details stay in server logs; the public response never exposes them.
    console.error("[health] Database check failed:", error);
    return NextResponse.json(
      { status: "error", message: "Database unavailable" },
      { status: 503, headers: noStore },
    );
  }
}
