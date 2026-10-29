import { supabase } from "@/lib/supabase";
import { uploadImage } from "./upload.api";

jest.mock("@/lib/supabase", () => ({
  supabase: {
    auth: {
      getSession: jest.fn(),
    },
  },
}));

describe("upload.api services", () => {
  const mockedGetSession = supabase.auth.getSession as jest.Mock;
  const originalFetch = global.fetch;
  const file = new File(["img"], "logo.png", { type: "image/png" });

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn().mockResolvedValue({
      json: async () => ({ url: "https://example.com/logo.png" }),
    });
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  it("should send the file with the user's Supabase access token", async () => {
    mockedGetSession.mockResolvedValue({ data: { session: { access_token: "user_jwt" } } });

    const result = await uploadImage(file);

    expect(global.fetch).toHaveBeenCalledWith("/api/upload", {
      method: "POST",
      headers: { Authorization: "Bearer user_jwt" },
      body: expect.any(FormData),
    });
    const body = (global.fetch as jest.Mock).mock.calls[0][1].body as FormData;
    expect(body.get("file")).toBeInstanceOf(File);
    expect(result).toEqual({ url: "https://example.com/logo.png" });
  });

  it("should send no Authorization header when logged out", async () => {
    mockedGetSession.mockResolvedValue({ data: { session: null } });

    await uploadImage(file);

    expect((global.fetch as jest.Mock).mock.calls[0][1].headers).toBeUndefined();
  });
});
