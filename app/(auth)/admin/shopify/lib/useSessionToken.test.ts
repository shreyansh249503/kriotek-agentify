import { renderHook, act } from "@testing-library/react";
import { useSessionToken } from "./useSessionToken";

describe("useSessionToken Hook", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    jest.clearAllMocks();
    delete (window as unknown as { shopify?: unknown }).shopify;
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("should execute fetch with Bearer token when window.shopify.idToken resolves", async () => {
    const mockToken = "mock_shopify_id_token_123";
    window.shopify = {
      idToken: jest.fn().mockResolvedValue(mockToken),
    };

    const mockResponse = { ok: true, json: async () => ({ success: true }) };
    global.fetch = jest.fn().mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useSessionToken());

    let res: Response | undefined;
    await act(async () => {
      res = await result.current.fetchWithToken("/api/test-endpoint", {
        method: "GET",
      });
    });

    expect(window.shopify.idToken).toHaveBeenCalled();
    expect(global.fetch).toHaveBeenCalledWith(
      "/api/test-endpoint",
      expect.objectContaining({
        method: "GET",
        headers: expect.objectContaining({
          "Content-Type": "application/json",
          Authorization: `Bearer ${mockToken}`,
        }),
      })
    );
    expect(res).toEqual(mockResponse);
  });

  it("should handle error when window.shopify.idToken throws", async () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    window.shopify = {
      idToken: jest.fn().mockRejectedValue(new Error("App Bridge Error")),
    };

    const mockResponse = { ok: true };
    global.fetch = jest.fn().mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useSessionToken());

    await act(async () => {
      await result.current.fetchWithToken("/api/test-endpoint");
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      "Failed to retrieve Shopify App Bridge session token:",
      expect.any(Error)
    );
    expect(global.fetch).toHaveBeenCalledWith(
      "/api/test-endpoint",
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer ",
        }),
      })
    );

    consoleSpy.mockRestore();
  });

  it("should fallback with empty token and console warn if window.shopify is undefined", async () => {
    const consoleSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
    const mockResponse = { ok: true };
    global.fetch = jest.fn().mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useSessionToken());

    await act(async () => {
      await result.current.fetchWithToken("/api/test-endpoint");
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      "Shopify App Bridge v4 global object 'shopify' not found on window"
    );
    expect(global.fetch).toHaveBeenCalledWith(
      "/api/test-endpoint",
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer ",
        }),
      })
    );

    consoleSpy.mockRestore();
  });
});
