import "reflect-metadata";
import { getMetadataArgsStorage } from "typeorm";
import {
  BOT_PUBLIC_KEY_IMMUTABLE_SQL,
  PUBLIC_KEY_IMMUTABLE_ERROR,
  publicKeyChangeError,
} from "./botImmutable";
import { Bot } from "./entities";

describe("bot public key immutability", () => {
  describe("publicKeyChangeError", () => {
    it("allows bodies that don't mention the public key", () => {
      expect(publicKeyChangeError({ name: "New name" }, "pk_1")).toBeNull();
      expect(publicKeyChangeError(null, "pk_1")).toBeNull();
    });

    it("allows sending the unchanged public key back", () => {
      expect(publicKeyChangeError({ public_key: "pk_1" }, "pk_1")).toBeNull();
      expect(publicKeyChangeError({ publicKey: "pk_1" }, "pk_1")).toBeNull();
    });

    it.each([
      [{ public_key: "pk_2" }],
      [{ publicKey: "pk_2" }],
      [{ public_key: null }],
      [{ publicKey: "" }],
      [{ public_key: "pk_1", publicKey: "pk_2" }],
    ])("rejects an attempt to change it: %j", (body) => {
      expect(publicKeyChangeError(body, "pk_1")).toBe(PUBLIC_KEY_IMMUTABLE_ERROR);
    });
  });

  it("excludes public_key from ORM updates (update: false)", () => {
    const column = getMetadataArgsStorage().columns.find(
      (c) => c.target === Bot && c.propertyName === "public_key",
    );
    expect(column).toBeDefined();
    expect(column?.options.update).toBe(false);
  });

  it("defines a Postgres trigger that rejects changes to an existing key", () => {
    expect(BOT_PUBLIC_KEY_IMMUTABLE_SQL).toContain("BEFORE UPDATE OF public_key ON bots");
    expect(BOT_PUBLIC_KEY_IMMUTABLE_SQL).toMatch(
      /OLD\.public_key IS NOT NULL AND NEW\.public_key IS DISTINCT FROM OLD\.public_key/,
    );
    expect(BOT_PUBLIC_KEY_IMMUTABLE_SQL).toContain("RAISE EXCEPTION");
  });

  it("installs the trigger when the database connection starts", async () => {
    await jest.isolateModulesAsync(async () => {
      const { AppDataSource, getDb } = await import("./db");
      Object.defineProperty(AppDataSource, "isInitialized", {
        value: true,
        configurable: true,
        writable: true,
      });
      const query = jest.spyOn(AppDataSource, "query").mockResolvedValue([]);

      await getDb();

      expect(query).toHaveBeenCalledWith(BOT_PUBLIC_KEY_IMMUTABLE_SQL);
      query.mockRestore();
    });
  });
});
