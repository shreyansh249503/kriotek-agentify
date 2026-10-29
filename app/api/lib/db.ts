import "reflect-metadata";
import { DataSource } from "typeorm";
import {
  Bot,
  Conversation,
  Lead,
  CrawledPage,
  BotDocument,
  ShopifyStore,
  BotUsage,
} from "./entities";

const globalForTypeorm = globalThis as unknown as {
  AppDataSource: DataSource;
};

const isProduction = process.env.NODE_ENV === "production";
const dbUrl = process.env.SUPABASE_DATABASE_URL || "";

/**
 * TLS settings for Postgres. With SUPABASE_DB_CA_CERT (the CA from Supabase Dashboard →
 * Database → SSL) the server certificate is verified; without it the connection is still
 * encrypted but unverified, which is only acceptable outside production.
 */
export function getSslConfig(env: NodeJS.ProcessEnv = process.env) {
  const url = env.SUPABASE_DATABASE_URL || "";
  const needsSsl =
    env.NODE_ENV === "production" || url.includes("supabase.co") || url.includes("supabase.com");
  if (!needsSsl) return undefined;

  const ca = env.SUPABASE_DB_CA_CERT?.replace(/\\n/g, "\n").trim();
  if (ca) {
    return { ca, rejectUnauthorized: true };
  }

  if (env.NODE_ENV === "production") {
    console.warn(
      "[db] SUPABASE_DB_CA_CERT is not set; the database certificate is not being verified.",
    );
  }
  return { rejectUnauthorized: false };
}

/** Each serverless instance holds its own pool, so production keeps it small. */
export function getPoolMax(env: NodeJS.ProcessEnv = process.env): number {
  const configured = Number(env.DB_POOL_MAX);
  if (Number.isInteger(configured) && configured > 0) return configured;
  return env.NODE_ENV === "production" ? 3 : 10;
}

export const AppDataSource =
  globalForTypeorm.AppDataSource ||
  new DataSource({
    type: "postgres",
    url: dbUrl,
    synchronize: false,
    logging: !isProduction && process.env.DEBUG_TYPEORM === "true",
    entities: [
      Bot,
      Conversation,
      Lead,
      CrawledPage,
      BotDocument,
      ShopifyStore,
      BotUsage,
    ],
    ssl: getSslConfig(),
    extra: {
      max: getPoolMax(),
      connectionTimeoutMillis: 10000,
      idleTimeoutMillis: 30000,
    },
  });

if (!isProduction) {
  globalForTypeorm.AppDataSource = AppDataSource;
}

let initPromise: Promise<DataSource> | null = null;

export const getDb = async (): Promise<DataSource> => {
  if (AppDataSource.isInitialized) {
    return AppDataSource;
  }

  if (!initPromise) {
    initPromise = (async () => {
      if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
      }
      return AppDataSource;
    })().catch((err) => {
      initPromise = null;
      throw err;
    });
  }

  return initPromise;
};

export const db = {
  query: async (queryStr: string, params?: unknown[]) => {
    const dataSource = await getDb();
    const rows = await dataSource.query(queryStr, params);
    return { rows, rowCount: Array.isArray(rows) ? rows.length : 0 };
  },
};
