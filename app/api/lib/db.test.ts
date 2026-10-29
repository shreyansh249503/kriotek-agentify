import { getDb, db, AppDataSource, getSslConfig, getPoolMax } from "./db";

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

describe("db connection settings", () => {
  const pooler = "postgresql://u:p@aws-0-x.pooler.supabase.com:6543/postgres";

  it("verifies the certificate when SUPABASE_DB_CA_CERT is set", () => {
    const ssl = getSslConfig({
      NODE_ENV: "production",
      SUPABASE_DATABASE_URL: pooler,
      SUPABASE_DB_CA_CERT: "-----BEGIN CERTIFICATE-----\nabc\n-----END CERTIFICATE-----",
    } as NodeJS.ProcessEnv);

    expect(ssl).toEqual({
      ca: "-----BEGIN CERTIFICATE-----\nabc\n-----END CERTIFICATE-----",
      rejectUnauthorized: true,
    });
  });

  it("falls back to unverified TLS and warns in production without a CA", () => {
    const warn = jest.spyOn(console, "warn").mockImplementation(() => {});

    const ssl = getSslConfig({ NODE_ENV: "production", SUPABASE_DATABASE_URL: pooler } as NodeJS.ProcessEnv);

    expect(ssl).toEqual({ rejectUnauthorized: false });
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("SUPABASE_DB_CA_CERT"));
    warn.mockRestore();
  });

  it("uses no TLS for a local non-Supabase database outside production", () => {
    expect(
      getSslConfig({ NODE_ENV: "development", SUPABASE_DATABASE_URL: "postgresql://localhost/db" } as NodeJS.ProcessEnv)
    ).toBeUndefined();
  });

  it("keeps the pool small in production unless DB_POOL_MAX overrides it", () => {
    expect(getPoolMax({ NODE_ENV: "production" } as NodeJS.ProcessEnv)).toBe(3);
    expect(getPoolMax({ NODE_ENV: "development" } as NodeJS.ProcessEnv)).toBe(10);
    expect(getPoolMax({ NODE_ENV: "production", DB_POOL_MAX: "5" } as NodeJS.ProcessEnv)).toBe(5);
    expect(getPoolMax({ NODE_ENV: "production", DB_POOL_MAX: "abc" } as NodeJS.ProcessEnv)).toBe(3);
  });
});
