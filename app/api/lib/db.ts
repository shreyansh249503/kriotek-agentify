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
const isSupabase = dbUrl.includes("supabase.co") || dbUrl.includes("supabase.com");

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
    ssl: isSupabase || isProduction ? { rejectUnauthorized: false } : undefined,
    extra: {
      max: 10,
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
