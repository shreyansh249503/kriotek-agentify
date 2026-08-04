import { GET } from "./route";
import { NextRequest } from "next/server";
import { getUserFromRequest } from "../lib/auth";

jest.mock("../lib/auth");

describe("API: /api/me", () => {
  const mockUser = { id: "user_123", email: "me@example.com", name: "Current User" };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 401 if user is not authenticated", async () => {
    (getUserFromRequest as jest.Mock).mockResolvedValueOnce(null);

    const req = new NextRequest("http://localhost/api/me");
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(401);
    expect(data).toEqual({ error: "Unauthorized" });
  });

  it("should return user details with 200 status when authenticated", async () => {
    (getUserFromRequest as jest.Mock).mockResolvedValueOnce(mockUser);

    const req = new NextRequest("http://localhost/api/me");
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toEqual(mockUser);
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe("*");
  });
});
