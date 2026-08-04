import { POST } from "./route";
import { NextRequest } from "next/server";
import { supabaseAdmin } from "../lib/supabase-admin";

jest.mock("../lib/supabase-admin", () => ({
  supabaseAdmin: {
    storage: {
      from: jest.fn(),
    },
  },
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

  const createMockRequest = (formData: FormData) => {
    const req = new NextRequest("http://localhost/api/upload", {
      method: "POST",
    });
    req.formData = jest.fn().mockResolvedValue(formData);
    return req;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (supabaseAdmin.storage.from as jest.Mock).mockReturnValue({
      upload: mockUpload,
      getPublicUrl: mockGetPublicUrl,
    });
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
