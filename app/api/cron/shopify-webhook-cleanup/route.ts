import { NextRequest, NextResponse } from "next/server";
import { db } from "../../lib/db";
import { logger } from "../../../../lib/logger";
import { verifyCronSecret } from "../db-keepalive/route";

export const dynamic = "force-dynamic";

/**
 * Shopify retries a webhook for about 48 hours, so dedupe IDs and removal markers older
 * than this can't matter any more.
 */
const RETENTION_DAYS = 7;

const NO_STORE = { "Cache-Control": "no-store, max-age=0" };

export async function GET(request: NextRequest) {
  if (!verifyCronSecret(request.headers.get("authorization"), process.env.CRON_SECRET)) {
    logger.warn("[cron/shopify-webhook-cleanup] Unauthorized cron execution attempt");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: NO_STORE });
  }

  try {
    const events = await db.query(
      `DELETE FROM shopify_webhook_events WHERE received_at < NOW() - make_interval(days => $1)`,
      [RETENTION_DAYS],
    );
    const removals = await db.query(
      `DELETE FROM shopify_product_removals WHERE removed_at < NOW() - make_interval(days => $1)`,
      [RETENTION_DAYS],
    );
    // TypeORM returns [rows, affectedCount] for DELETE on Postgres.
    const deleted = {
      webhookEvents: affected(events.rows),
      productRemovals: affected(removals.rows),
    };
    logger.info("[cron/shopify-webhook-cleanup] Old Shopify webhook records deleted", deleted);
    return NextResponse.json({ ok: true, deleted }, { headers: NO_STORE });
  } catch (error: unknown) {
    logger.error("[cron/shopify-webhook-cleanup] Cleanup failed", error);
    return NextResponse.json({ ok: false, error: "Cleanup failed" }, { status: 500, headers: NO_STORE });
  }
}

function affected(result: unknown): number {
  return Array.isArray(result) && typeof result[1] === "number" ? result[1] : 0;
}
