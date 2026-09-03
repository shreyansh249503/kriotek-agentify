import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  useManualConversations,
  useConversationDetail,
  useReplyToConversation,
  useCloseConversation,
  useToggleHitl,
} from "./useInbox";
import {
  getManualConversations,
  getConversationById,
  replyToConversation,
  closeConversation,
  toggleHitl,
} from "@/services/inbox.api";
import React from "react";

jest.mock("@/services/inbox.api");

describe("useInbox hooks", () => {
  const mockedGetManual = getManualConversations as jest.Mock;
  const mockedGetDetail = getConversationById as jest.Mock;
  const mockedReply = replyToConversation as jest.Mock;
  const mockedClose = closeConversation as jest.Mock;
  const mockedToggleHitl = toggleHitl as jest.Mock;

  const createWrapper = () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    return { wrapper: Wrapper, queryClient };
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("useManualConversations", () => {
    it("should fetch manual conversations successfully with default filter", async () => {
      const mockConvos = [{ id: "c-1", bot_id: "b-1", state: "open" }];
      mockedGetManual.mockResolvedValueOnce(mockConvos);

      const { wrapper } = createWrapper();
      const { result } = renderHook(() => useManualConversations(), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(mockedGetManual).toHaveBeenCalledWith("manual");
      expect(result.current.data).toEqual(mockConvos);
    });

    it("should fetch manual conversations with custom filter", async () => {
      const mockConvos = [{ id: "c-1", bot_id: "b-1", state: "all" }];
      mockedGetManual.mockResolvedValueOnce(mockConvos);

      const { wrapper } = createWrapper();
      const { result } = renderHook(() => useManualConversations("all"), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(mockedGetManual).toHaveBeenCalledWith("all");
      expect(result.current.data).toEqual(mockConvos);
    });
  });

  describe("useConversationDetail", () => {
    it("should fetch conversation detail when valid ID is provided", async () => {
      const mockDetail = { state: "open", messages: [] };
      mockedGetDetail.mockResolvedValueOnce(mockDetail);

      const { wrapper } = createWrapper();
      const { result } = renderHook(() => useConversationDetail("c-1"), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(mockedGetDetail).toHaveBeenCalledWith("c-1");
      expect(result.current.data).toEqual(mockDetail);
    });

    it("should stay idle when ID is empty", () => {
      const { wrapper } = createWrapper();
      const { result } = renderHook(() => useConversationDetail(""), { wrapper });

      expect(result.current.fetchStatus).toBe("idle");
      expect(mockedGetDetail).not.toHaveBeenCalled();
    });
  });

  describe("useReplyToConversation", () => {
    it("should send reply and invalidate caches on success", async () => {
      mockedReply.mockResolvedValueOnce(undefined);
      const { wrapper, queryClient } = createWrapper();
      const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");

      const { result } = renderHook(() => useReplyToConversation(), { wrapper });
      result.current.mutate({ id: "c-1", message: "Hello there" });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockedReply).toHaveBeenCalledWith("c-1", "Hello there");
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["conversationDetail", "c-1"] });
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["manualConversations"] });
    });
  });

  describe("useCloseConversation", () => {
    it("should close conversation and invalidate caches on success", async () => {
      mockedClose.mockResolvedValueOnce(undefined);
      const { wrapper, queryClient } = createWrapper();
      const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");

      const { result } = renderHook(() => useCloseConversation(), { wrapper });
      result.current.mutate("c-1");

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockedClose).toHaveBeenCalledWith("c-1");
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["conversationDetail", "c-1"] });
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["manualConversations"] });
    });
  });

  describe("useToggleHitl", () => {
    it("should toggle HITL state and invalidate caches on success", async () => {
      mockedToggleHitl.mockResolvedValueOnce({ success: true, state: "manual_takeover", enabled: true });
      const { wrapper, queryClient } = createWrapper();
      const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");

      const { result } = renderHook(() => useToggleHitl(), { wrapper });
      result.current.mutate({ id: "c-1", enabled: true });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockedToggleHitl).toHaveBeenCalledWith("c-1", true);
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["conversationDetail", "c-1"] });
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["manualConversations"] });
    });
  });
});

