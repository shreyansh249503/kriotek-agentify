import { GET } from "./route";
import { getDb } from "../lib/db";

jest.mock("../lib/db", () => ({
  getDb: jest.fn(),
}));

describe("GET /api/health", () => {
  const mockedGetDb = getDb as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return status ok when database is initialized", async () => {
    mockedGetDb.mockResolvedValueOnce({ isInitialized: true });
    const res = await GET();
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.status).toBe("ok");
    expect(json.timestamp).toBeDefined();
  });

  it("should return status 503 when database is not initialized", async () => {
    mockedGetDb.mockResolvedValueOnce({ isInitialized: false });
    const res = await GET();
    const json = await res.json();

    expect(res.status).toBe(503);
    expect(json.status).toBe("error");
  });

  it("should return status 500 when database throws an exception", async () => {
    mockedGetDb.mockRejectedValueOnce(new Error("DB connection failure"));
    const res = await GET();
    const json = await res.json();

    expect(res.status).toBe(500);
    expect(json.status).toBe("error");
    expect(json.message).toBe("DB connection failure");
  });
});
