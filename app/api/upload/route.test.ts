import { POST } from "./route";
import { NextRequest } from "next/server";
import { supabaseAdmin } from "../lib/supabase-admin";
import { getUserFromRequest } from "../lib/auth";
import { verifySessionToken } from "../shopify/lib/verifySessionToken";

jest.mock("../lib/supabase-admin", () => ({
  supabaseAdmin: {
    storage: {
      from: jest.fn(),
    },
    from: jest.fn(),
  },
}));

jest.mock("../lib/auth", () => ({
  getUserFromRequest: jest.fn(),
}));

jest.mock("../shopify/lib/verifySessionToken", () => ({
  verifySessionToken: jest.fn(),
  getShopFromSession: jest.fn((session: { dest: string }) => new URL(session.dest).hostname),
}));

jest.mock("nanoid", () => ({
  nanoid: () => "mocked_avatar_id",
}));

describe("API: /api/upload", () => {
  const mockUpload = jest.fn();
  const mockGetPublicUrl = jest.fn();

  const createFile = (content: string, name: string, type: string) => {
    const file = new File([content], name, { type });
    file.arrayBuffer = jest.fn().mockResolvedValue(Buffer.from(content).buffer);
    return file;
  };

  const mockMaybeSingle = jest.fn();

  const createMockRequest = (formData: FormData, headers: Record<string, string> = {}) => {
    const req = new NextRequest("http://localhost/api/upload", {
      method: "POST",
      headers,
    });
    req.formData = jest.fn().mockResolvedValue(formData);
    return req;
  };

  const pngFormData = () => {
    const formData = new FormData();
    formData.append("file", createFile("valid image", "avatar.png", "image/png"));
    return formData;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (getUserFromRequest as jest.Mock).mockResolvedValue({ id: "user_1" });
    (supabaseAdmin.storage.from as jest.Mock).mockReturnValue({
      upload: mockUpload,
      getPublicUrl: mockGetPublicUrl,
    });
    (supabaseAdmin.from as jest.Mock).mockReturnValue({
      select: () => ({ eq: () => ({ maybeSingle: mockMaybeSingle }) }),
    });
    mockGetPublicUrl.mockReturnValue({ data: { publicUrl: "https://example.com/x" } });
  });

  it("should return 400 if no file is provided in formData", async () => {
    const formData = new FormData();
    const req = createMockRequest(formData);

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data).toEqual({ error: "No file provided" });
  });

  it("should return 400 if file type is not allowed", async () => {
    const file = createFile("dummy content", "doc.pdf", "application/pdf");
    const formData = new FormData();
    formData.append("file", file);

    const req = createMockRequest(formData);

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toContain("Invalid file type");
  });

  it("should reject SVG file uploads to prevent stored XSS", async () => {
    const file = createFile("<svg><script>alert(1)</script></svg>", "bad.svg", "image/svg+xml");
    const formData = new FormData();
    formData.append("file", file);

    const req = createMockRequest(formData);

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toContain("Invalid file type");
  });

  describe("authentication", () => {
    beforeEach(() => {
      (getUserFromRequest as jest.Mock).mockResolvedValue(null);
    });

    it("should return 401 when unauthenticated, in any environment", async () => {
      const res = await POST(createMockRequest(pngFormData()));
      const data = await res.json();

      expect(process.env.NODE_ENV).not.toBe("production");
      expect(res.status).toBe(401);
      expect(data.error).toBe("Unauthorized");
      expect(mockUpload).not.toHaveBeenCalled();
    });

    it("should return 401 for a valid Shopify session from a shop that is not installed", async () => {
      (verifySessionToken as jest.Mock).mockReturnValue({ dest: "https://stranger.myshopify.com" });
      mockMaybeSingle.mockResolvedValueOnce({ data: null });

      const res = await POST(createMockRequest(pngFormData(), { Authorization: "Bearer shop_token" }));

      expect(res.status).toBe(401);
      expect(mockUpload).not.toHaveBeenCalled();
    });

    it("should return 401 for an invalid Shopify session token", async () => {
      (verifySessionToken as jest.Mock).mockImplementation(() => {
        throw new Error("invalid signature");
      });

      const res = await POST(createMockRequest(pngFormData(), { Authorization: "Bearer forged" }));

      expect(res.status).toBe(401);
    });

    it("should accept a Shopify session from an installed shop", async () => {
      (verifySessionToken as jest.Mock).mockReturnValue({ dest: "https://test.myshopify.com" });
      mockMaybeSingle.mockResolvedValueOnce({ data: { shop: "test.myshopify.com" } });
      mockUpload.mockResolvedValueOnce({ error: null });

      const res = await POST(createMockRequest(pngFormData(), { Authorization: "Bearer shop_token" }));

      expect(res.status).toBe(200);
      expect(mockUpload).toHaveBeenCalled();
    });
  });

  it("should derive the stored extension from the file type, not the file name", async () => {
    const formData = new FormData();
    formData.append("file", createFile("valid image", "evil.html", "image/png"));
    mockUpload.mockResolvedValueOnce({ error: null });

    const res = await POST(createMockRequest(formData));

    expect(res.status).toBe(200);
    expect(mockUpload).toHaveBeenCalledWith(
      "avatars/mocked_avatar_id.png",
      expect.any(Buffer),
      { contentType: "image/png", upsert: true }
    );
  });

  it("should return 400 if file size exceeds 1MB", async () => {
    const largeBuffer = new Uint8Array(1024 * 1024 + 10);
    const file = new File([largeBuffer], "large.png", { type: "image/png" });
    file.arrayBuffer = jest.fn().mockResolvedValue(largeBuffer.buffer);
    const formData = new FormData();
    formData.append("file", file);

    const req = createMockRequest(formData);

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toContain("File too large");
  });

  it("should upload file to Supabase storage and return public url", async () => {
    const file = createFile("valid image", "avatar.png", "image/png");
    const formData = new FormData();
    formData.append("file", file);

    mockUpload.mockResolvedValueOnce({ error: null });
    mockGetPublicUrl.mockReturnValueOnce({
      data: { publicUrl: "https://example.supabase.co/storage/v1/object/public/bot-avatars/avatars/mocked_avatar_id.png" },
    });

    const req = createMockRequest(formData);

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(mockUpload).toHaveBeenCalledWith(
      "avatars/mocked_avatar_id.png",
      expect.any(Buffer),
      { contentType: "image/png", upsert: true }
    );
    expect(data).toEqual({
      url: "https://example.supabase.co/storage/v1/object/public/bot-avatars/avatars/mocked_avatar_id.png",
    });
  });

  it("should return 500 when Supabase upload fails", async () => {
    jest.spyOn(console, "error").mockImplementationOnce(() => {});

    const file = createFile("valid image", "avatar.png", "image/png");
    const formData = new FormData();
    formData.append("file", file);

    mockUpload.mockResolvedValueOnce({ error: new Error("Storage bucket error") });

    const req = createMockRequest(formData);

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data).toEqual({ error: "Failed to upload to cloud storage" });
  });
});
