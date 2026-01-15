import { db } from "./db";

export async function getBotByPublicKey(publicKey: string) {
  const bot = await db.query(`SELECT * FROM bots WHERE public_key = $1`, [
    publicKey,
  ]);

  if (!bot.rows[0]) {
    throw new Error("Bot not found");
  }

  return bot.rows[0];
}
