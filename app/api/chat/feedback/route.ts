import { recordFeedbackScore } from "../../lib/langfuse";
import { checkRateLimit } from "../../lib/rateLimit";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, x-forwarded-for, cf-connecting-ip, x-real-ip",
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { traceId, score, comment, conversationId, botPublicKey } = body;

    if (!traceId || typeof score !== "number") {
      return new Response(
        JSON.stringify({ error: "traceId (string) and score (number: 0 or 1) are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (botPublicKey) {
      const rateLimitResult = await checkRateLimit(req, botPublicKey);
      if (!rateLimitResult.success) {
        return new Response(
          JSON.stringify({
            error: "Rate limit exceeded. Please wait a moment before sending more feedback.",
            retryAfter: rateLimitResult.retryAfter,
          }),
          {
            status: 429,
            headers: {
              ...corsHeaders,
              ...rateLimitResult.headers,
              "Content-Type": "application/json",
            },
          },
        );
      }
    }

    // Value normalized (1 for positive, 0 for negative, or numeric score)
    const normalizedScore = Number(score);

    const recorded = await recordFeedbackScore({
      traceId,
      name: "user_feedback",
      value: normalizedScore,
      comment: comment ? String(comment).slice(0, 1000) : undefined,
      dataType: "NUMERIC",
      metadata: {
        conversationId,
        botPublicKey,
        submittedAt: new Date().toISOString(),
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        recorded,
        message: recorded ? "Feedback submitted to observability engine." : "Feedback received locally.",
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  } catch (error) {
    console.error("[Feedback API] Error processing feedback:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error processing feedback" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
}
