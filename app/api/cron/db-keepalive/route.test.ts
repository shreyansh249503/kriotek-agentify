import { NextRequest } from "next/server";
import { GET, verifyCronSecret } from "./route";
import { db } from "../../lib/db";
import { logger } from "../../../../lib/logger";

jest.mock("../../lib/db", () => ({
  db: {
    query: jest.fn(),
  },
}));

jest.mock("../../../../lib/logger", () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

describe("Cron DB Keepalive (/api/cron/db-keepalive)", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe("verifyCronSecret", () => {
    it("rejects when header or secret is missing", () => {
      expect(verifyCronSecret(null, "secret123")).toBe(false);
      expect(verifyCronSecret("Bearer secret123", undefined)).toBe(false);
      expect(verifyCronSecret("", "secret123")).toBe(false);
    });

    it("rejects non-Bearer format", () => {
      expect(verifyCronSecret("Basic secret123", "secret123")).toBe(false);
      expect(verifyCronSecret("secret123", "secret123")).toBe(false);
    });

    it("rejects mismatched token or length mismatch", () => {
      expect(verifyCronSecret("Bearer wrongsecret", "secret123")).toBe(false);
      expect(verifyCronSecret("Bearer sec", "secret123")).toBe(false);
    });

    it("accepts matching secret", () => {
      expect(verifyCronSecret("Bearer test-cron-secret-32-chars-long", "test-cron-secret-32-chars-long")).toBe(true);
    });
  });

  describe("GET /api/cron/db-keepalive", () => {
    it("returns 401 Unauthorized when authorization header is missing", async () => {
      process.env.CRON_SECRET = "valid-secret-key";
      const req = new NextRequest("http://localhost:3000/api/cron/db-keepalive");

      const res = await GET(req);
      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data.error).toBe("Unauthorized");
      expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining("Unauthorized"));
      expect(db.query).not.toHaveBeenCalled();
    });

    it("returns 401 Unauthorized when CRON_SECRET is not set", async () => {
      delete process.env.CRON_SECRET;
      const req = new NextRequest("http://localhost:3000/api/cron/db-keepalive", {
        headers: {
          authorization: "Bearer some-token",
        },
      });

      const res = await GET(req);
      expect(res.status).toBe(401);
      expect(db.query).not.toHaveBeenCalled();
    });

    it("returns 401 Unauthorized when token is incorrect", async () => {
      process.env.CRON_SECRET = "valid-secret-key";
      const req = new NextRequest("http://localhost:3000/api/cron/db-keepalive", {
        headers: {
          authorization: "Bearer invalid-secret",
        },
      });

      const res = await GET(req);
      expect(res.status).toBe(401);
      expect(db.query).not.toHaveBeenCalled();
    });

    it("executes read-only query and returns 200 on valid authorization", async () => {
      process.env.CRON_SECRET = "valid-secret-key";
      (db.query as jest.Mock).mockResolvedValue({
        rows: [{ alive: 1, timestamp: new Date().toISOString() }],
        rowCount: 1,
      });

      const req = new NextRequest("http://localhost:3000/api/cron/db-keepalive", {
        headers: {
          authorization: "Bearer valid-secret-key",
        },
      });

      const res = await GET(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.ok).toBe(true);
      expect(data.message).toContain("keepalive ping successful");
      expect(typeof data.latencyMs).toBe("number");
      expect(db.query).toHaveBeenCalledWith("SELECT 1 AS alive, NOW() AS timestamp;");
      expect(logger.info).toHaveBeenCalledWith(
        "[cron/db-keepalive] Database keepalive ping successful",
        expect.objectContaining({ latencyMs: expect.any(Number) }),
      );
    });

    it("returns 500 when database query fails", async () => {
      process.env.CRON_SECRET = "valid-secret-key";
      const dbError = new Error("Connection pool timeout");
      (db.query as jest.Mock).mockRejectedValue(dbError);

      const req = new NextRequest("http://localhost:3000/api/cron/db-keepalive", {
        headers: {
          authorization: "Bearer valid-secret-key",
        },
      });

      const res = await GET(req);
      expect(res.status).toBe(500);
      const data = await res.json();
      expect(data.ok).toBe(false);
      expect(data.error).toBe("Database ping failed");
      expect(logger.error).toHaveBeenCalledWith(
        "[cron/db-keepalive] Database keepalive ping failed",
        dbError,
      );
    });
  });
});

