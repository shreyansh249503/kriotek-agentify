import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useBots, useBot, useCreateBot, useUpdateBot } from "./useBot";
import { getAllBots, getBotById, createBot, updateBot } from "@/services/bot.api";
import { Bot, CreateBotInput, UpdateBotInput } from "@/types/bot";
import React from "react";

jest.mock("@/services/bot.api");

describe("useBot hooks", () => {
  const mockedGetAllBots = getAllBots as jest.Mock;
  const mockedGetBotById = getBotById as jest.Mock;
  const mockedCreateBot = createBot as jest.Mock;
  const mockedUpdateBot = updateBot as jest.Mock;

  const mockBot: Bot = {
    id: "bot-123",
    public_key: "pk_test_123",
    name: "Support Bot",
    description: "Support Assistant",
    tone: "helpful",
    primary_color: "#0070f3",
    created_at: "2026-01-01T00:00:00Z",
    contact_enabled: true,
    contact_email: "support@example.com",
    contact_prompt: "Ask for email",
    contact_email_message: "Contacting soon",
  };

  const createWrapper = () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    return { wrapper: Wrapper, queryClient };
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("useBots", () => {
    it("should fetch all bots successfully", async () => {
      mockedGetAllBots.mockResolvedValueOnce([mockBot]);
      const { wrapper } = createWrapper();

      const { result } = renderHook(() => useBots(), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockedGetAllBots).toHaveBeenCalledTimes(1);
      expect(result.current.data).toEqual([mockBot]);
    });
  });

  describe("useBot", () => {
    it("should fetch bot details when valid ID is provided", async () => {
      mockedGetBotById.mockResolvedValueOnce(mockBot);
      const { wrapper } = createWrapper();

      const { result } = renderHook(() => useBot("bot-123"), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockedGetBotById).toHaveBeenCalledWith("bot-123");
      expect(result.current.data).toEqual(mockBot);
    });

    it("should not execute query when ID is empty (enabled: false)", () => {
      const { wrapper } = createWrapper();

      const { result } = renderHook(() => useBot(""), { wrapper });

      expect(result.current.fetchStatus).toBe("idle");
      expect(mockedGetBotById).not.toHaveBeenCalled();
    });
  });

  describe("useCreateBot", () => {
    it("should call createBot service and invalidate bots query cache on success", async () => {
      const newBotInput: CreateBotInput = {
        name: "New Sales Bot",
        tone: "enthusiastic",
      };

      mockedCreateBot.mockResolvedValueOnce({ id: "bot-456", ...newBotInput });

      const { wrapper, queryClient } = createWrapper();
      const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");

      const { result } = renderHook(() => useCreateBot(), { wrapper });

      result.current.mutate(newBotInput);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockedCreateBot).toHaveBeenCalledWith(newBotInput, expect.anything());
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["bots"] });
    });
  });

  describe("useUpdateBot", () => {
    it("should call updateBot service and invalidate single bot & bots list caches on success", async () => {
      const updateData: UpdateBotInput = {
        id: "bot-123",
        name: "Updated Support Bot",
      };

      mockedUpdateBot.mockResolvedValueOnce({ success: true });

      const { wrapper, queryClient } = createWrapper();
      const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");

      const { result } = renderHook(() => useUpdateBot(), { wrapper });

      result.current.mutate({ id: "bot-123", data: updateData });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockedUpdateBot).toHaveBeenCalledWith("bot-123", updateData);
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["bot", "bot-123"] });
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["bots"] });
    });
  });
});
