import { getDb } from "./db";
import { Bot } from "./entities";

export async function getBotByPublicKey(publicKey: string) {
  const db = await getDb();
  const bot = await db.getRepository(Bot).findOne({
    where: { public_key: publicKey },
  });

  if (!bot) {
    throw new Error("Bot not found");
  }

  return bot;
}
