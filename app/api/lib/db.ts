import "reflect-metadata";
import { DataSource } from "typeorm";
import { nanoid } from "nanoid";
import { Bot, Conversation, Lead, CrawledPage, BotDocument, Subscription, SavedAvatar } from "./entities";

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
    entities: [Bot, Conversation, Lead, CrawledPage, BotDocument, Subscription, SavedAvatar],
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : undefined,
  });

if (process.env.NODE_ENV !== "production") globalForTypeorm.AppDataSource = AppDataSource;

export const getDb = async () => {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
  return AppDataSource;
};

// Proxy to behave like the pg Pool for piecemeal migration
export const db = {
  query: async (queryStr: string, params?: any[]) => {
    const dataSource = await getDb();
    const rows = await dataSource.query(queryStr, params).catch((err) => {
      console.log(err);
      return [];
    });
    return { rows, rowCount: rows.length };
  },
};
