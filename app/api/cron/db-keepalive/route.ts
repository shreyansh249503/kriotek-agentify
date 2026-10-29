import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "../../lib/db";
import { logger } from "../../../../lib/logger";

export const dynamic = "force-dynamic";

/**
 * Validates the Vercel Cron Bearer token against CRON_SECRET using
 * timing-safe comparison to prevent side-channel timing attacks.
 */
export function verifyCronSecret(
  authHeader: string | null,
  expectedSecret: string | undefined,
): boolean {
  if (!authHeader || !expectedSecret) {
    return false;
  }

  const prefix = "Bearer ";
  if (!authHeader.startsWith(prefix)) {
    return false;
  }

  const token = authHeader.slice(prefix.length).trim();
  if (!token) {
    return false;
  }

  const tokenBuf = Buffer.from(token);
  const expectedBuf = Buffer.from(expectedSecret);

  if (tokenBuf.length !== expectedBuf.length) {
    return false;
  }

  return crypto.timingSafeEqual(tokenBuf, expectedBuf);
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!verifyCronSecret(authHeader, cronSecret)) {
    logger.warn("[cron/db-keepalive] Unauthorized cron execution attempt");
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401, headers: { "Cache-Control": "no-store, max-age=0" } },
    );
  }

  try {
    const start = performance.now();
    // Lightweight, read-only query that resets Supabase inactivity pause counter
    await db.query("SELECT 1 AS alive, NOW() AS timestamp;");
    const latencyMs = Math.round(performance.now() - start);

    logger.info("[cron/db-keepalive] Database keepalive ping successful", {
      latencyMs,
    });

    return NextResponse.json(
      {
        ok: true,
        timestamp: new Date().toISOString(),
        latencyMs,
        message: "Database keepalive ping successful",
      },
      {
        status: 200,
        headers: { "Cache-Control": "no-store, max-age=0" },
      },
    );
  } catch (error: unknown) {
    logger.error("[cron/db-keepalive] Database keepalive ping failed", error);
    return NextResponse.json(
      {
        ok: false,
        error: "Database ping failed",
      },
      {
        status: 500,
        headers: { "Cache-Control": "no-store, max-age=0" },
      },
    );
  }
}

