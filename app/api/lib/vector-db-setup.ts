import { getDb } from "./db";

export async function setupCollection() {
  const db = await getDb();
  
  await db.query(`CREATE EXTENSION IF NOT EXISTS vector;`);
  
  await db.query(`
    CREATE TABLE IF NOT EXISTS bot_documents (
      id uuid primary key default gen_random_uuid(),
      public_key text,
      content text,
      embedding vector(768)
    );
  `);
  
  await db.query(`
    CREATE INDEX IF NOT EXISTS idx_bot_documents_public_key ON bot_documents(public_key);
  `);

  console.log("Vector DB table ready (pgvector)");
}
