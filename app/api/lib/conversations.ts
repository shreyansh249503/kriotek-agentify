import { getDb } from "./db";
import type { ConversationMessage } from "./entities";

/**
 * Rows written before 20261105000000_conversations_messages_array.sql hold the history as a JSON
 * string inside the jsonb column. Accept both shapes until every environment has run it.
 */
export function parseMessages(value: unknown): ConversationMessage[] {
  if (Array.isArray(value)) return value;
  if (typeof value !== "string") return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** The stored history as a jsonb array, unwrapping a not-yet-migrated string row. */
const currentMessages = (column: string) =>
  `(CASE jsonb_typeof(${column}) WHEN 'array' THEN ${column} WHEN 'string' THEN (${column} #>> '{}')::jsonb ELSE '[]'::jsonb END)`;

/**
 * Appends messages in one UPDATE, so concurrent writers (the chat stream, an agent's reply, a
 * takeover) can't overwrite each other's messages the way read-modify-write did.
 */
export async function appendMessages(
  conversationId: string,
  messages: ConversationMessage[],
  { state, incrementCount = messages.length }: { state?: string; incrementCount?: number } = {},
): Promise<void> {
  const db = await getDb();
  await db.query(
    `UPDATE conversations
     SET messages = ${currentMessages("messages")} || $2::jsonb,
         message_count = COALESCE(message_count, 0) + $3,
         state = COALESCE($4, state)
     WHERE id = $1`,
    [conversationId, JSON.stringify(messages), incrementCount, state ?? null],
  );
}

/**
 * Creates the conversation with these messages, or appends them if it already exists. A
 * conversation that belongs to another bot is left untouched, and false is returned.
 */
export async function upsertConversationMessages(
  conversationId: string,
  botId: string,
  messages: ConversationMessage[],
  { state, incrementCount = messages.length }: { state: string; incrementCount?: number },
): Promise<boolean> {
  const db = await getDb();
  const rows: unknown[] = await db.query(
    `INSERT INTO conversations (id, bot_id, state, message_count, messages)
     VALUES ($1, $2, $3, $4, $5::jsonb)
     ON CONFLICT (id) DO UPDATE SET
       messages = ${currentMessages("conversations.messages")} || EXCLUDED.messages,
       message_count = COALESCE(conversations.message_count, 0) + EXCLUDED.message_count,
       state = EXCLUDED.state
     WHERE conversations.bot_id = EXCLUDED.bot_id
     RETURNING id`,
    [conversationId, botId, state, incrementCount, JSON.stringify(messages)],
  );
  return rows.length > 0;
}
