import { GET } from "./route";

const mockQuery = jest.fn();

jest.mock("../lib/db", () => ({
  getDb: jest.fn().mockImplementation(() => ({
    query: mockQuery,
  })),
}));

describe("GET /api/db-test", () => {
  it("should query database and return current timestamp in JSON response", async () => {
    const mockTimestamp = "2026-08-07T12:00:00.000Z";
    mockQuery.mockResolvedValueOnce([{ now: mockTimestamp }]);

    const response = await GET();
    const data = await response.json();

    expect(mockQuery).toHaveBeenCalledWith("SELECT NOW()");
    expect(response.status).toBe(200);
    expect(data).toEqual({ time: { now: mockTimestamp } });
  });
});
