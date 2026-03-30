import "reflect-metadata";
import { DataSource } from "typeorm";
import { nanoid } from "nanoid";
import { Bot, Conversation, Lead, CrawledPage, BotDocument } from "./entities";

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
    entities: [Bot, Conversation, Lead, CrawledPage, BotDocument],
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : undefined,
  });

if (process.env.NODE_ENV !== "production") globalForTypeorm.AppDataSource = AppDataSource;

export const getDb = async () => {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
    
    // One-time migration for existing bots that don't have a public_key
    const botRepo = AppDataSource.getRepository(Bot);
    const botsWithoutKeys = await botRepo.find({ where: { public_key: null as any } });
    if (botsWithoutKeys.length > 0) {
      console.log(`[DB] Generating public keys for ${botsWithoutKeys.length} bots...`);
      for (const bot of botsWithoutKeys) {
        bot.public_key = nanoid(16);
      }
      await botRepo.save(botsWithoutKeys);
    }
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
