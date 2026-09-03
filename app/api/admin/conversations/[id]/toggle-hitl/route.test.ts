import { POST, OPTIONS } from "./route";
import { getDb } from "@/app/api/lib/db";
import { getUserFromRequest } from "@/app/api/lib/auth";

jest.mock("@/app/api/lib/db");
jest.mock("@/app/api/lib/auth");

describe("POST /api/admin/conversations/[id]/toggle-hitl", () => {
  const mockUser = { id: "user_123", email: "admin@example.com" };
  const mockRepo = {
    findOne: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (getDb as jest.Mock).mockResolvedValue({
      getRepository: jest.fn().mockReturnValue(mockRepo),
    });
  });

  it("should handle OPTIONS request with 204 status", async () => {
    const res = await OPTIONS();
    expect(res.status).toBe(204);
  });

  it("should return 401 when user is not authenticated", async () => {
    (getUserFromRequest as jest.Mock).mockResolvedValueOnce(null);

    const req = new Request("http://localhost/api/admin/conversations/c_1/toggle-hitl", {
      method: "POST",
      body: JSON.stringify({ enabled: true }),
    });
    const params = Promise.resolve({ id: "c_1" });
    const res = await POST(req, { params });
    const data = await res.json();

    expect(res.status).toBe(401);
    expect(data).toEqual({ error: "Unauthorized" });
  });

  it("should return 400 when enabled is not a boolean", async () => {
    (getUserFromRequest as jest.Mock).mockResolvedValueOnce(mockUser);

    const req = new Request("http://localhost/api/admin/conversations/c_1/toggle-hitl", {
      method: "POST",
      body: JSON.stringify({ enabled: "invalid" }),
    });
    const params = Promise.resolve({ id: "c_1" });
    const res = await POST(req, { params });
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data).toEqual({ error: "enabled (boolean) is required" });
  });

  it("should return 404 when conversation is not found", async () => {
    (getUserFromRequest as jest.Mock).mockResolvedValueOnce(mockUser);
    mockRepo.findOne.mockResolvedValueOnce(null);

    const req = new Request("http://localhost/api/admin/conversations/non_existent/toggle-hitl", {
      method: "POST",
      body: JSON.stringify({ enabled: true }),
    });
    const params = Promise.resolve({ id: "non_existent" });
    const res = await POST(req, { params });
    const data = await res.json();

    expect(res.status).toBe(404);
    expect(data).toEqual({ error: "Conversation not found" });
  });

  it("should pause AI (enable HITL manual takeover) and save successfully", async () => {
    (getUserFromRequest as jest.Mock).mockResolvedValueOnce(mockUser);
    const mockConvo = {
      id: "convo_1",
      state: "idle",
      messages: JSON.stringify([{ role: "user", content: "Hello" }]),
      message_count: 1,
    };
    mockRepo.findOne.mockResolvedValueOnce(mockConvo);

    const req = new Request("http://localhost/api/admin/conversations/convo_1/toggle-hitl", {
      method: "POST",
      body: JSON.stringify({ enabled: true }),
    });
    const params = Promise.resolve({ id: "convo_1" });
    const res = await POST(req, { params });
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toEqual({
      success: true,
      state: "manual_takeover",
      enabled: true,
    });

    expect(mockRepo.save).toHaveBeenCalledTimes(1);
    const savedConvo = mockRepo.save.mock.calls[0][0];
    expect(savedConvo.state).toBe("manual_takeover");
    expect(savedConvo.message_count).toBe(2);
    const updatedMessages = JSON.parse(savedConvo.messages);
    expect(updatedMessages[1].content).toContain("Support representative has taken over the chat");
  });

  it("should resume AI (disable HITL) and save successfully", async () => {
    (getUserFromRequest as jest.Mock).mockResolvedValueOnce(mockUser);
    const mockConvo = {
      id: "convo_1",
      state: "manual_takeover",
      messages: JSON.stringify([{ role: "user", content: "Hello" }]),
      message_count: 1,
    };
    mockRepo.findOne.mockResolvedValueOnce(mockConvo);

    const req = new Request("http://localhost/api/admin/conversations/convo_1/toggle-hitl", {
      method: "POST",
      body: JSON.stringify({ enabled: false }),
    });
    const params = Promise.resolve({ id: "convo_1" });
    const res = await POST(req, { params });
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toEqual({
      success: true,
      state: "idle",
      enabled: false,
    });

    expect(mockRepo.save).toHaveBeenCalledTimes(1);
    const savedConvo = mockRepo.save.mock.calls[0][0];
    expect(savedConvo.state).toBe("idle");
    const updatedMessages = JSON.parse(savedConvo.messages);
    expect(updatedMessages[1].content).toContain("AI Assistant has resumed automated responses");
  });

  it("should return 500 when saving fails", async () => {
    jest.spyOn(console, "error").mockImplementationOnce(() => {});
    (getUserFromRequest as jest.Mock).mockResolvedValueOnce(mockUser);
    mockRepo.findOne.mockResolvedValueOnce({
      id: "convo_1",
      state: "idle",
      messages: "[]",
      message_count: 0,
    });
    mockRepo.save.mockRejectedValueOnce(new Error("Database error"));

    const req = new Request("http://localhost/api/admin/conversations/convo_1/toggle-hitl", {
      method: "POST",
      body: JSON.stringify({ enabled: true }),
    });
    const params = Promise.resolve({ id: "convo_1" });
    const res = await POST(req, { params });
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data).toEqual({ error: "Internal Server Error" });
  });
});
