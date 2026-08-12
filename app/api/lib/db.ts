import "reflect-metadata";
import { DataSource } from "typeorm";
import { Bot, Conversation, Lead, CrawledPage, BotDocument, ShopifyStore } from "./entities";

const globalForTypeorm = globalThis as unknown as {
  AppDataSource: DataSource;
};

export const AppDataSource =
  globalForTypeorm.AppDataSource ||
  new DataSource({
    type: "postgres",
    url: process.env.SUPABASE_DATABASE_URL,
    synchronize: true,
    logging: false,
    entities: [Bot, Conversation, Lead, CrawledPage, BotDocument, ShopifyStore],
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : undefined,
  });

let dbMigrationRun = false;

export const getDb = async () => {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
  if (!dbMigrationRun && AppDataSource.isInitialized) {
    dbMigrationRun = true;
    await AppDataSource.query(`
      ALTER TABLE bots ADD COLUMN IF NOT EXISTS last_trained_at TIMESTAMPTZ;
      ALTER TABLE bots ADD COLUMN IF NOT EXISTS company_name VARCHAR;
      ALTER TABLE bots ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
      ALTER TABLE bots ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
    `).catch((err) => {
      console.log("Migration columns error:", err);
    });
  }
  return AppDataSource;
};

export const db = {
  query: async (queryStr: string, params?: unknown[]) => {
    const dataSource = await getDb();
    const rows = await dataSource.query(queryStr, params).catch((err) => {
      console.log(err);
      return [];
    });
    return { rows, rowCount: rows.length };
  },
};
