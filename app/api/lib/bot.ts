import { getDb } from "./db";
import { Bot } from "./entities";

/** Returns null for an unknown public key so callers can answer 404 instead of 500. */
export async function getBotByPublicKey(publicKey: string): Promise<Bot | null> {
  const db = await getDb();
  return db.getRepository<Bot>("Bot").findOne({
    where: { public_key: publicKey },
  });
}
