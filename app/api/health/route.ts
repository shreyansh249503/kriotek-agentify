import { NextResponse } from "next/server";
import { getDb } from "../lib/db";

export async function GET() {
  try {
    const db = await getDb();
    if (!db.isInitialized) {
      return NextResponse.json({ status: "error", message: "Database not initialized" }, { status: 503 });
    }
    return NextResponse.json({
      status: "ok",
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ status: "error", message }, { status: 500 });
  }
}
