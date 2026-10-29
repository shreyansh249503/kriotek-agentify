/** @jest-environment node */
import { GET } from "./route";
import { getDb } from "../lib/db";

jest.mock("../lib/db", () => ({
  getDb: jest.fn(),
}));

describe("GET /api/health", () => {
  const mockedGetDb = getDb as jest.Mock;
  const mockQuery = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {});
    mockedGetDb.mockResolvedValue({ query: mockQuery });
  });

  it("should return status ok after a successful database query", async () => {
    mockQuery.mockResolvedValueOnce([{ "?column?": 1 }]);
    const res = await GET();
    const json = await res.json();

    expect(mockQuery).toHaveBeenCalledWith("SELECT 1");
    expect(res.status).toBe(200);
    expect(json.status).toBe("ok");
    expect(json.timestamp).toBeDefined();
    expect(res.headers.get("Cache-Control")).toBe("no-store");
  });

  it("should return 503 when the database query fails", async () => {
    mockQuery.mockRejectedValueOnce(new Error("connection terminated unexpectedly"));
    const res = await GET();
    const json = await res.json();

    expect(res.status).toBe(503);
    expect(json.status).toBe("error");
  });

  it("should return 503 without leaking error details when the database cannot connect", async () => {
    mockedGetDb.mockRejectedValueOnce(new Error("password authentication failed for user postgres"));
    const res = await GET();
    const json = await res.json();

    expect(res.status).toBe(503);
    expect(json).toEqual({ status: "error", message: "Database unavailable" });
    expect(JSON.stringify(json)).not.toContain("password");
  });
});
