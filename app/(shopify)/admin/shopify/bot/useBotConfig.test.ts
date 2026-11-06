import { renderHook, act, waitFor } from "@testing-library/react";
import { useBotConfig } from "./useBotConfig";

const mockFetchWithToken = jest.fn();

jest.mock("../lib/useSessionToken", () => ({
  useSessionToken: () => ({
    fetchWithToken: mockFetchWithToken,
  }),
}));

describe("useBotConfig Hook", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should fetch bot configuration on mount successfully", async () => {
    const mockBot = { id: "bot-123", name: "Test Bot", color: "#000000" };
    mockFetchWithToken.mockResolvedValueOnce({
      status: 200,
      json: async () => ({ bot: mockBot }),
    });

    const { result } = renderHook(() => useBotConfig());

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.config).toEqual(mockBot);
    expect(result.current.unauthorized).toBe(false);
  });

  it("should handle 401 unauthorized response correctly", async () => {
    mockFetchWithToken.mockResolvedValueOnce({
      status: 401,
      json: async () => ({ error: "Unauthorized" }),
    });

    const { result } = renderHook(() => useBotConfig());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.unauthorized).toBe(true);
    expect(result.current.config).toBeNull();
  });

  it("should update config field via update function", async () => {
    const mockBot = { id: "bot-123", name: "Original Bot Name" };
    mockFetchWithToken.mockResolvedValueOnce({
      status: 200,
      json: async () => ({ bot: mockBot }),
    });

    const { result } = renderHook(() => useBotConfig());

    await waitFor(() => {
      expect(result.current.config).toEqual(mockBot);
    });

    act(() => {
      result.current.update("name", "Updated Bot Name");
    });

    expect(result.current.config).toEqual({
      id: "bot-123",
      name: "Updated Bot Name",
    });
  });

  it("should handle save success when handleSave is triggered", async () => {
    const mockBot = { id: "bot-123", name: "Save Bot Test" };
    mockFetchWithToken
      .mockResolvedValueOnce({
        status: 200,
        json: async () => ({ bot: mockBot }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

    const { result } = renderHook(() => useBotConfig());

    await waitFor(() => {
      expect(result.current.config).toEqual(mockBot);
    });

    await act(async () => {
      await result.current.handleSave();
    });

    expect(mockFetchWithToken).toHaveBeenCalledWith("/api/shopify/admin/bot", {
      method: "PATCH",
      body: JSON.stringify(mockBot),
    });
    expect(result.current.saving).toBe(false);
    expect(result.current.banner).toEqual({
      tone: "success",
      message: "Bot configuration saved successfully.",
    });
  });

  it("should handle save failure when handleSave API returns error", async () => {
    const mockBot = { id: "bot-123", name: "Save Bot Test" };
    mockFetchWithToken
      .mockResolvedValueOnce({
        status: 200,
        json: async () => ({ bot: mockBot }),
      })
      .mockResolvedValueOnce({
        ok: false,
      });

    const { result } = renderHook(() => useBotConfig());

    await waitFor(() => {
      expect(result.current.config).toEqual(mockBot);
    });

    await act(async () => {
      await result.current.handleSave();
    });

    expect(result.current.saving).toBe(false);
    expect(result.current.banner).toEqual({
      tone: "critical",
      message: "Failed to save configuration. Try again.",
    });
  });
});
