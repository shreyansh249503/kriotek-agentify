import axiosInstance from "@/lib/axios";
import {
  getManualConversations,
  getConversationById,
  replyToConversation,
  closeConversation,
  ConversationInfo,
  ConversationDetail,
} from "./inbox.api";

jest.mock("@/lib/axios");

describe("inbox.api services", () => {
  const mockedAxios = axiosInstance as jest.Mocked<typeof axiosInstance>;

  const mockConversation: ConversationInfo = {
    id: "conv-101",
    bot_id: "bot-123",
    bot_name: "Support Assistant",
    state: "open",
    name: "John Doe",
    email: "john@example.com",
    snippet: "Hello, I need help with my order",
    created_at: "2026-01-20T10:00:00Z",
  };

  const mockDetail: ConversationDetail = {
    state: "open",
    messages: [
      { role: "user", content: "Hello, I need help with my order" },
      { role: "assistant", sender: "ai", content: "Sure, what is your order number?" },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getManualConversations", () => {
    it("should fetch manual conversations list from /api/admin/conversations", async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: [mockConversation] });

      const result = await getManualConversations();

      expect(mockedAxios.get).toHaveBeenCalledWith("/api/admin/conversations");
      expect(result).toEqual([mockConversation]);
    });
  });

  describe("getConversationById", () => {
    it("should fetch conversation details by ID from /api/admin/conversations/:id", async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: mockDetail });

      const result = await getConversationById("conv-101");

      expect(mockedAxios.get).toHaveBeenCalledWith("/api/admin/conversations/conv-101");
      expect(result).toEqual(mockDetail);
    });
  });

  describe("replyToConversation", () => {
    it("should post reply message to /api/admin/conversations/:id/reply", async () => {
      mockedAxios.post.mockResolvedValueOnce({ data: { success: true } });

      await replyToConversation("conv-101", "We are looking into your order right now.");

      expect(mockedAxios.post).toHaveBeenCalledWith(
        "/api/admin/conversations/conv-101/reply",
        { message: "We are looking into your order right now." }
      );
    });
  });

  describe("closeConversation", () => {
    it("should post close action to /api/admin/conversations/:id/close", async () => {
      mockedAxios.post.mockResolvedValueOnce({ data: { success: true } });

      await closeConversation("conv-101");

      expect(mockedAxios.post).toHaveBeenCalledWith(
        "/api/admin/conversations/conv-101/close"
      );
    });
  });
});
