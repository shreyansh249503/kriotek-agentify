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

  it("should catch errors in db.query and return empty array with rowCount 0", async () => {
    Object.defineProperty(AppDataSource, "isInitialized", {
      value: true,
      configurable: true,
      writable: true,
    });

    const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    const spyQuery = jest
      .spyOn(AppDataSource, "query")
      .mockRejectedValueOnce(new Error("DB error"));

    const result = await db.query("SELECT * FROM invalid_table");

    expect(consoleSpy).toHaveBeenCalled();
    expect(result).toEqual({ rows: [], rowCount: 0 });

    consoleSpy.mockRestore();
    spyQuery.mockRestore();
  });
});
