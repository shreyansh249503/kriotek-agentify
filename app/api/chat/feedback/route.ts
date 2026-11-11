import { z } from "zod";
import { recordFeedbackScore } from "../../lib/langfuse";
import { checkRateLimit } from "../../lib/rateLimit";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, x-forwarded-for, cf-connecting-ip, x-real-ip",
};

// Trace IDs come from the chat route's x-trace-id header: trace_<conversationId>_<timestamp>.
const FeedbackSchema = z.object({
  traceId: z.string().trim().min(1).max(200).regex(/^[\w.:-]+$/),
  score: z.number().min(0).max(1),
  comment: z.string().max(5000).optional(),
  conversationId: z.string().max(100).optional(),
  botPublicKey: z.string().max(64).optional(),
});

function json(body: unknown, status: number, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, ...headers, "Content-Type": "application/json" },
  });
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

export async function POST(req: Request) {
  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return json({ error: "Request body must be JSON" }, 400);
    }

    // Every request is rate-limited per IP; requests naming a bot are also limited per bot.
    // Checked before validation so malformed requests count too.
    const rawKey = (body as { botPublicKey?: unknown } | null)?.botPublicKey;
    const botKey = typeof rawKey === "string" && rawKey.length > 0 && rawKey.length <= 64 ? rawKey : undefined;
    const rateLimitResult = await checkRateLimit(req, botKey, { scope: "chat-feedback" });
    if (!rateLimitResult.success) {
      return json(
        {
          error: "Rate limit exceeded. Please wait a moment before sending more feedback.",
          retryAfter: rateLimitResult.retryAfter,
        },
        429,
        rateLimitResult.headers,
      );
    }

    const parsed = FeedbackSchema.safeParse(body ?? {});
    if (!parsed.success) {
      return json(
        {
          error: "traceId (string) and score (number: 0 or 1) are required",
          details: parsed.error.issues.map((i) => `${i.path.join(".") || "body"}: ${i.message}`),
        },
        400,
      );
    }
    const { traceId, score, comment, conversationId, botPublicKey } = parsed.data;

    const recorded = await recordFeedbackScore({
      traceId,
      name: "user_feedback",
      value: score,
      comment: comment ? comment.slice(0, 1000) : undefined,
      dataType: "NUMERIC",
      metadata: {
        conversationId,
        botPublicKey,
        submittedAt: new Date().toISOString(),
      },
    });

    return json(
      {
        success: true,
        recorded,
        message: recorded ? "Feedback submitted to observability engine." : "Feedback received locally.",
      },
      200,
    );
  } catch (error) {
    console.error("[Feedback API] Error processing feedback:", error);
    return json({ error: "Internal server error processing feedback" }, 500);
  }
}
