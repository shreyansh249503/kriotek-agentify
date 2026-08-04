import { setupCollection } from "./vector-db-setup";
import { getDb } from "./db";

jest.mock("./db");

describe("setupCollection", () => {
  const mockDb = {
    query: jest.fn().mockResolvedValue(true),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "log").mockImplementation(() => {});
    (getDb as jest.Mock).mockResolvedValue(mockDb);
  });

  it("should execute pgvector extension, table creation, and index queries", async () => {
    await setupCollection();

    expect(mockDb.query).toHaveBeenCalledTimes(3);
    expect(mockDb.query).toHaveBeenNthCalledWith(1, expect.stringContaining("CREATE EXTENSION IF NOT EXISTS vector"));
    expect(mockDb.query).toHaveBeenNthCalledWith(2, expect.stringContaining("CREATE TABLE IF NOT EXISTS bot_documents"));
    expect(mockDb.query).toHaveBeenNthCalledWith(3, expect.stringContaining("CREATE INDEX IF NOT EXISTS idx_bot_documents_public_key"));
    expect(console.log).toHaveBeenCalledWith("Vector DB table ready (pgvector)");
  });
});
