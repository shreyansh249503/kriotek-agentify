import { getDb, db, AppDataSource } from "./db";

describe("db utility", () => {
  const originalIsInitialized = AppDataSource.isInitialized;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    Object.defineProperty(AppDataSource, "isInitialized", {
      value: originalIsInitialized,
      configurable: true,
      writable: true,
    });
  });

  it("should initialize AppDataSource if not initialized when getDb is called", async () => {
    Object.defineProperty(AppDataSource, "isInitialized", {
      value: false,
      configurable: true,
      writable: true,
    });

    const spyInitialize = jest
      .spyOn(AppDataSource, "initialize")
      .mockImplementation(async () => AppDataSource);

    const ds = await getDb();

    expect(spyInitialize).toHaveBeenCalled();
    expect(ds).toBe(AppDataSource);

    spyInitialize.mockRestore();
  });

  it("should return AppDataSource immediately if already initialized", async () => {
    Object.defineProperty(AppDataSource, "isInitialized", {
      value: true,
      configurable: true,
      writable: true,
    });

    const spyInitialize = jest.spyOn(AppDataSource, "initialize");

    const ds = await getDb();

    expect(spyInitialize).not.toHaveBeenCalled();
    expect(ds).toBe(AppDataSource);

    spyInitialize.mockRestore();
  });

  it("should execute raw SQL query and return rows and rowCount via db.query", async () => {
    Object.defineProperty(AppDataSource, "isInitialized", {
      value: true,
      configurable: true,
      writable: true,
    });

    const mockRows = [{ id: "1", name: "Bot 1" }];
    const spyQuery = jest
      .spyOn(AppDataSource, "query")
      .mockResolvedValueOnce(mockRows);

    const result = await db.query("SELECT * FROM bots WHERE id = $1", ["1"]);

    expect(spyQuery).toHaveBeenCalledWith("SELECT * FROM bots WHERE id = $1", ["1"]);
    expect(result).toEqual({ rows: mockRows, rowCount: 1 });

    spyQuery.mockRestore();
  });

  it("should rethrow errors in db.query so callers can detect failures", async () => {
    Object.defineProperty(AppDataSource, "isInitialized", {
      value: true,
      configurable: true,
      writable: true,
    });

    const spyQuery = jest
      .spyOn(AppDataSource, "query")
      .mockRejectedValueOnce(new Error("DB error"));

    await expect(db.query("SELECT * FROM invalid_table")).rejects.toThrow("DB error");

    spyQuery.mockRestore();
  });
});
