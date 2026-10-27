import { POST, OPTIONS } from "./route";
import { recordFeedbackScore } from "../../lib/langfuse";

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
