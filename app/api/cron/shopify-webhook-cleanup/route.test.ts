import { NextRequest } from "next/server";
import { GET } from "./route";
import { db } from "../../lib/db";

jest.mock("../../lib/db", () => ({ db: { query: jest.fn() } }));
jest.mock("../../../../lib/logger", () => ({
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));

const request = (auth?: string) =>
  new NextRequest("http://localhost/api/cron/shopify-webhook-cleanup", {
    headers: auth ? { authorization: auth } : {},
  });

describe("GET /api/cron/shopify-webhook-cleanup", () => {
  const originalSecret = process.env.CRON_SECRET;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.CRON_SECRET = "cron_test_secret";
  });

  afterAll(() => {
    process.env.CRON_SECRET = originalSecret;
  });

  it("rejects calls without the cron secret", async () => {
    const res = await GET(request("Bearer wrong"));

    expect(res.status).toBe(401);
    expect(db.query).not.toHaveBeenCalled();
  });

  it("deletes dedupe IDs and removal markers older than 7 days", async () => {
    (db.query as jest.Mock)
      .mockResolvedValueOnce({ rows: [[], 12], rowCount: 2 })
      .mockResolvedValueOnce({ rows: [[], 3], rowCount: 2 });

    const res = await GET(request("Bearer cron_test_secret"));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toEqual({ ok: true, deleted: { webhookEvents: 12, productRemovals: 3 } });
    expect(db.query).toHaveBeenCalledWith(expect.stringContaining("DELETE FROM shopify_webhook_events"), [7]);
    expect(db.query).toHaveBeenCalledWith(expect.stringContaining("DELETE FROM shopify_product_removals"), [7]);
  });

  it("returns 500 when the database fails", async () => {
    (db.query as jest.Mock).mockRejectedValueOnce(new Error("db down"));

    const res = await GET(request("Bearer cron_test_secret"));

    expect(res.status).toBe(500);
  });
});
