import { POST, OPTIONS } from "./route";
import { recordFeedbackScore } from "../../lib/langfuse";
import { checkRateLimit } from "../../lib/rateLimit";

const mockCheckRateLimit = checkRateLimit as jest.Mock;

function feedbackRequest(body: unknown, raw = false) {
  return new Request("http://localhost/api/chat/feedback", {
    method: "POST",
    body: raw ? (body as string) : JSON.stringify(body),
  });
}

jest.mock("../../lib/langfuse", () => ({
  recordFeedbackScore: jest.fn().mockResolvedValue(true),
}));

jest.mock("../../lib/rateLimit", () => ({
  checkRateLimit: jest.fn().mockResolvedValue({
    success: true,
    headers: {},
  }),
}));

describe("POST /api/chat/feedback", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("handles OPTIONS preflight request", async () => {
    const res = await OPTIONS();
    expect(res.status).toBe(204);
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe("*");
  });

  it("returns 400 if traceId or score is missing", async () => {
    const req = new Request("http://localhost/api/chat/feedback", {
      method: "POST",
      body: JSON.stringify({ comment: "Missing trace and score" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain("traceId");
  });

  it("successfully records positive thumbs-up feedback", async () => {
    const req = new Request("http://localhost/api/chat/feedback", {
      method: "POST",
      body: JSON.stringify({
        traceId: "trace_convo-123_456",
        score: 1,
        comment: "Great recommendation!",
        conversationId: "convo-123",
        botPublicKey: "pk_test_123",
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(recordFeedbackScore).toHaveBeenCalledWith(
      expect.objectContaining({
        traceId: "trace_convo-123_456",
        name: "user_feedback",
        value: 1,
        comment: "Great recommendation!",
      }),
    );
  });

  describe("rate limiting", () => {
    it("rate-limits requests that name a bot, per IP and per bot", async () => {
      await POST(feedbackRequest({ traceId: "trace_c_1", score: 1, botPublicKey: "pk_test_123" }));

      expect(mockCheckRateLimit).toHaveBeenCalledWith(expect.any(Request), "pk_test_123", { scope: "chat-feedback" });
    });

    it("still rate-limits per IP when no bot key is sent", async () => {
      await POST(feedbackRequest({ traceId: "trace_c_1", score: 1 }));

      expect(mockCheckRateLimit).toHaveBeenCalledWith(expect.any(Request), undefined, { scope: "chat-feedback" });
    });

    it("ignores a bot key that isn't a short string", async () => {
      await POST(feedbackRequest({ traceId: "trace_c_1", score: 1, botPublicKey: { $ne: "" } }));
      await POST(feedbackRequest({ traceId: "trace_c_1", score: 1, botPublicKey: "x".repeat(500) }));

      expect(mockCheckRateLimit).toHaveBeenNthCalledWith(1, expect.any(Request), undefined, { scope: "chat-feedback" });
      expect(mockCheckRateLimit).toHaveBeenNthCalledWith(2, expect.any(Request), undefined, { scope: "chat-feedback" });
    });

    it("counts malformed requests too", async () => {
      await POST(feedbackRequest({ nonsense: true }));

      expect(mockCheckRateLimit).toHaveBeenCalledTimes(1);
    });

    it("returns 429 with retry headers when the limit is hit, without recording", async () => {
      mockCheckRateLimit.mockResolvedValueOnce({
        success: false,
        retryAfter: 30,
        headers: { "Retry-After": "30" },
      });

      const res = await POST(feedbackRequest({ traceId: "trace_c_1", score: 1 }));

      expect(res.status).toBe(429);
      expect(res.headers.get("Retry-After")).toBe("30");
      expect((await res.json()).retryAfter).toBe(30);
      expect(recordFeedbackScore).not.toHaveBeenCalled();
    });
  });

  describe("validation", () => {
    it("returns 400 for a body that isn't JSON", async () => {
      const res = await POST(feedbackRequest("{not json", true));

      expect(res.status).toBe(400);
      expect((await res.json()).error).toMatch(/JSON/);
      expect(mockCheckRateLimit).not.toHaveBeenCalled();
    });

    it.each([
      ["a score outside 0–1", { traceId: "trace_c_1", score: 5 }],
      ["a score sent as a string", { traceId: "trace_c_1", score: "1" }],
      ["a trace id with unexpected characters", { traceId: "trace <script>", score: 1 }],
      ["a very long trace id", { traceId: "t".repeat(201), score: 1 }],
      ["a very long comment", { traceId: "trace_c_1", score: 1, comment: "x".repeat(5001) }],
      ["a body that isn't an object", ["trace_c_1", 1]],
    ])("returns 400 for %s", async (_label, body) => {
      const res = await POST(feedbackRequest(body));

      expect(res.status).toBe(400);
      expect(recordFeedbackScore).not.toHaveBeenCalled();
    });

    it("trims comments to 1000 characters", async () => {
      await POST(feedbackRequest({ traceId: "trace_c_1", score: 1, comment: "y".repeat(3000) }));

      expect(recordFeedbackScore).toHaveBeenCalledWith(expect.objectContaining({ comment: "y".repeat(1000) }));
    });
  });

  it("successfully records negative thumbs-down feedback", async () => {
    const req = new Request("http://localhost/api/chat/feedback", {
      method: "POST",
      body: JSON.stringify({
        traceId: "trace_convo-789_101",
        score: 0,
        comment: "Did not find the right size",
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(recordFeedbackScore).toHaveBeenCalledWith(
      expect.objectContaining({
        traceId: "trace_convo-789_101",
        value: 0,
        comment: "Did not find the right size",
      }),
    );
  });
});
