/**
 * A bot's public key is the id merchants paste into their storefront
 * (`<script bot-id="...">`), and it scopes the bot's knowledge base
 * (bot_documents.public_key) and crawl history. It is generated once, on the
 * server, when the bot is created, and must never change afterwards.
 *
 * This is enforced in three layers:
 *  1. API routes reject any request that tries to change it (this module).
 *  2. The TypeORM column is `update: false`, so ORM updates never write it.
 *  3. A Postgres trigger (BOT_PUBLIC_KEY_IMMUTABLE_SQL, installed by getDb)
 *     rejects UPDATEs that change it, including ones made through Supabase.
 */

/** Request-body spellings that refer to the public key. */
export const PUBLIC_KEY_FIELDS = ["public_key", "publicKey"] as const;

export const PUBLIC_KEY_IMMUTABLE_ERROR = "A bot's public key cannot be changed.";

/**
 * Returns an error message if `body` tries to set the public key to anything
 * other than `currentPublicKey`. Sending the unchanged value is allowed so
 * clients can post a full bot object back.
 */
export function publicKeyChangeError(
  body: unknown,
  currentPublicKey: string | null | undefined,
): string | null {
  if (!body || typeof body !== "object") return null;
  const record = body as Record<string, unknown>;
  for (const field of PUBLIC_KEY_FIELDS) {
    if (!(field in record)) continue;
    const value = record[field];
    if (value === undefined) continue;
    if (value !== currentPublicKey) return PUBLIC_KEY_IMMUTABLE_ERROR;
  }
  return null;
}

/**
 * Postgres guard. Allows setting the key once on legacy rows where it is
 * NULL; any other change raises an error, whichever client issued it.
 */
export const BOT_PUBLIC_KEY_IMMUTABLE_SQL = `
CREATE OR REPLACE FUNCTION prevent_bot_public_key_change() RETURNS trigger AS $$
BEGIN
  IF OLD.public_key IS NOT NULL AND NEW.public_key IS DISTINCT FROM OLD.public_key THEN
    RAISE EXCEPTION 'bots.public_key is immutable (bot %)', OLD.id
      USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS bots_public_key_immutable ON bots;
CREATE TRIGGER bots_public_key_immutable
  BEFORE UPDATE OF public_key ON bots
  FOR EACH ROW EXECUTE FUNCTION prevent_bot_public_key_change();
`;
