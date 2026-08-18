import { renderHook, act } from "@testing-library/react";
import { useLogoUpload } from "./useLogoUpload";

describe("useLogoUpload Hook", () => {
  const mockUpdate = jest.fn();
  const mockSetBanner = jest.fn();
  const originalFetch = global.fetch;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("should set critical banner if uploaded file exceeds 1MB", async () => {
    const { result } = renderHook(() =>
      useLogoUpload({ update: mockUpdate, setBanner: mockSetBanner })
    );

    const largeFile = new File(["a".repeat(1024 * 1024 + 1)], "large.png", {
      type: "image/png",
    });

    await act(async () => {
      await result.current.handleLogoUpload([], [largeFile], []);
    });

    expect(mockSetBanner).toHaveBeenCalledWith({
      tone: "critical",
      message: "File is too large. Max size is 1MB.",
    });
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("should handle logo upload success", async () => {
    const validFile = new File(["test image"], "avatar.png", {
      type: "image/png",
    });
    const mockResponse = {
      ok: true,
      json: async () => ({ url: "https://example.com/logo.png" }),
    };
    global.fetch = jest.fn().mockResolvedValue(mockResponse);

    const { result } = renderHook(() =>
      useLogoUpload({ update: mockUpdate, setBanner: mockSetBanner })
    );

    await act(async () => {
      await result.current.handleLogoUpload([], [validFile], []);
    });

    expect(global.fetch).toHaveBeenCalledWith("/api/upload", {
      method: "POST",
      body: expect.any(FormData),
    });
    expect(mockUpdate).toHaveBeenCalledWith(
      "logo_url",
      "https://example.com/logo.png"
    );
    expect(mockSetBanner).toHaveBeenCalledWith({
      tone: "success",
      message: "Logo uploaded successfully.",
    });
  });

  it("should handle upload failure response", async () => {
    const validFile = new File(["test image"], "avatar.png", {
      type: "image/png",
    });
    const mockResponse = {
      ok: false,
      json: async () => ({ error: "Invalid file type" }),
    };
    global.fetch = jest.fn().mockResolvedValue(mockResponse);

    const { result } = renderHook(() =>
      useLogoUpload({ update: mockUpdate, setBanner: mockSetBanner })
    );

    await act(async () => {
      await result.current.handleLogoUpload([], [validFile], []);
    });

    expect(mockSetBanner).toHaveBeenCalledWith({
      tone: "critical",
      message: "Invalid file type",
    });
    expect(mockUpdate).not.toHaveBeenCalled();
  });
});
