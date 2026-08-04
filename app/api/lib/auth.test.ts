import { getUserFromRequest, supabaseAdmin } from "./auth";

jest.mock("@supabase/supabase-js", () => ({
  createClient: jest.fn().mockReturnValue({
    auth: {
      getUser: jest.fn(),
    },
  }),
}));

describe("getUserFromRequest", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return null when Authorization header is missing", async () => {
    const req = new Request("http://localhost/api/test");
    const user = await getUserFromRequest(req);
    expect(user).toBeNull();
  });

  it("should extract bearer token and return user from Supabase auth", async () => {
    const mockUser = { id: "user_abc123", email: "user@example.com" };
    (supabaseAdmin.auth.getUser as jest.Mock).mockResolvedValueOnce({
      data: { user: mockUser },
    });

    const req = new Request("http://localhost/api/test", {
      headers: { authorization: "Bearer token_xyz_789" },
    });

    const user = await getUserFromRequest(req);

    expect(supabaseAdmin.auth.getUser).toHaveBeenCalledWith("token_xyz_789");
    expect(user).toEqual(mockUser);
  });

  it("should return null when Supabase auth returns no user", async () => {
    (supabaseAdmin.auth.getUser as jest.Mock).mockResolvedValueOnce({
      data: { user: null },
    });

    const req = new Request("http://localhost/api/test", {
      headers: { authorization: "Bearer invalid_token" },
    });

    const user = await getUserFromRequest(req);
    expect(user).toBeNull();
  });
});
