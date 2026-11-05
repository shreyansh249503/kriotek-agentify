import { getUserFromRequest } from "./auth";
import { supabaseAdmin } from "./supabase-admin";

jest.mock("./supabase-admin");

describe("getUserFromRequest", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return null when Authorization header is missing", async () => {
    const req = new Request("http://localhost/api/test");
    const user = await getUserFromRequest(req);
    expect(user).toBeNull();
    expect(supabaseAdmin.auth.getUser).not.toHaveBeenCalled();
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
    expect(user).toEqual(mockUser);
    expect(supabaseAdmin.auth.getUser).toHaveBeenCalledWith("token_xyz_789");
  });

  it("should return null when Supabase does not recognise the token", async () => {
    (supabaseAdmin.auth.getUser as jest.Mock).mockResolvedValueOnce({
      data: { user: null },
    });

    const req = new Request("http://localhost/api/test", {
      headers: { authorization: "Bearer expired" },
    });

    expect(await getUserFromRequest(req)).toBeNull();
  });
});
