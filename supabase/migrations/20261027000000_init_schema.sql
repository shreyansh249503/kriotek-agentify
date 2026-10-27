-- ==============================================================================
-- Migration: 20261027000000_init_schema.sql
-- Description: Core database schema for Agentify (Bots, Conversations, Leads,
--              Crawled Pages, Bot Documents with pgvector, Shopify Stores, Bot Usage).
-- ==============================================================================

-- 1. Enable pgvector extension for AI embeddings
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Bots table
CREATE TABLE IF NOT EXISTS bots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    public_key VARCHAR UNIQUE,
    name VARCHAR NOT NULL,
    description VARCHAR,
    tone VARCHAR DEFAULT 'friendly',
    primary_color VARCHAR DEFAULT '#000000',
    contact_enabled BOOLEAN DEFAULT FALSE,
    contact_email VARCHAR,
    contact_prompt VARCHAR,
    contact_email_message VARCHAR,
    user_id VARCHAR NOT NULL,
    logo_url VARCHAR,
    ecommerce_enabled BOOLEAN DEFAULT FALSE,
    ecommerce_prompt VARCHAR,
    ecommerce_products JSONB,
    company_name VARCHAR,
    allowed_origins JSONB DEFAULT '[]',
    monthly_token_budget INT,
    last_trained_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure all schema columns exist (idempotent for existing databases)
ALTER TABLE bots ADD COLUMN IF NOT EXISTS public_key VARCHAR UNIQUE;
ALTER TABLE bots ADD COLUMN IF NOT EXISTS tone VARCHAR DEFAULT 'friendly';
ALTER TABLE bots ADD COLUMN IF NOT EXISTS primary_color VARCHAR DEFAULT '#000000';
ALTER TABLE bots ADD COLUMN IF NOT EXISTS contact_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE bots ADD COLUMN IF NOT EXISTS contact_email VARCHAR;
ALTER TABLE bots ADD COLUMN IF NOT EXISTS contact_prompt VARCHAR;
ALTER TABLE bots ADD COLUMN IF NOT EXISTS contact_email_message VARCHAR;
ALTER TABLE bots ADD COLUMN IF NOT EXISTS logo_url VARCHAR;
ALTER TABLE bots ADD COLUMN IF NOT EXISTS ecommerce_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE bots ADD COLUMN IF NOT EXISTS ecommerce_prompt VARCHAR;
ALTER TABLE bots ADD COLUMN IF NOT EXISTS ecommerce_products JSONB;
ALTER TABLE bots ADD COLUMN IF NOT EXISTS company_name VARCHAR;
ALTER TABLE bots ADD COLUMN IF NOT EXISTS allowed_origins JSONB DEFAULT '[]';
ALTER TABLE bots ADD COLUMN IF NOT EXISTS monthly_token_budget INT;
ALTER TABLE bots ADD COLUMN IF NOT EXISTS last_trained_at TIMESTAMPTZ;
ALTER TABLE bots ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE bots ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 3. Conversations table
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bot_id UUID REFERENCES bots(id) ON DELETE CASCADE,
    state VARCHAR DEFAULT 'idle',
    message_count INT DEFAULT 0,
    messages JSONB DEFAULT '[]',
    name VARCHAR,
    email VARCHAR,
    phone VARCHAR,
    declined BOOLEAN DEFAULT FALSE,
    prompted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Leads table
CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bot_id UUID REFERENCES bots(id) ON DELETE CASCADE,
    name VARCHAR,
    email VARCHAR,
    phone VARCHAR,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Crawled Pages table
CREATE TABLE IF NOT EXISTS crawled_pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bot_public_key VARCHAR NOT NULL,
    page_url VARCHAR NOT NULL
);

-- 6. Bot Documents (Knowledge Base with pgvector embeddings)
CREATE TABLE IF NOT EXISTS bot_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    public_key VARCHAR NOT NULL,
    content TEXT NOT NULL,
    embedding vector(768)
);

-- 7. Shopify Stores table
CREATE TABLE IF NOT EXISTS shopify_stores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop VARCHAR UNIQUE NOT NULL,
    access_token VARCHAR NOT NULL,
    bot_id UUID REFERENCES bots(id) ON DELETE SET NULL,
    scopes VARCHAR,
    installed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Bot Usages table (Token and conversation metering per billing period)
CREATE TABLE IF NOT EXISTS bot_usages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bot_id UUID NOT NULL REFERENCES bots(id) ON DELETE CASCADE,
    billing_period VARCHAR NOT NULL,
    total_tokens INT DEFAULT 0,
    prompt_tokens INT DEFAULT 0,
    completion_tokens INT DEFAULT 0,
    message_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- Indexes for High Performance & Production Scalability
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_bots_user_id ON bots(user_id);
CREATE INDEX IF NOT EXISTS idx_bots_public_key ON bots(public_key);
CREATE INDEX IF NOT EXISTS idx_conversations_bot_id ON conversations(bot_id);
CREATE INDEX IF NOT EXISTS idx_leads_bot_id ON leads(bot_id);
CREATE INDEX IF NOT EXISTS idx_crawled_pages_bot_public_key ON crawled_pages(bot_public_key);
CREATE INDEX IF NOT EXISTS idx_bot_documents_public_key ON bot_documents(public_key);
CREATE INDEX IF NOT EXISTS idx_shopify_stores_shop ON shopify_stores(shop);
CREATE INDEX IF NOT EXISTS idx_shopify_stores_bot_id ON shopify_stores(bot_id);
CREATE INDEX IF NOT EXISTS idx_bot_usages_bot_period ON bot_usages(bot_id, billing_period);

-- ==============================================================================
-- Row Level Security (RLS) policies for Supabase
-- ==============================================================================
ALTER TABLE bots ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE crawled_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE bot_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopify_stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE bot_usages ENABLE ROW LEVEL SECURITY;

-- Service role bypass policy for backend TypeORM / server operations
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'service_role_manage_all_bots' AND tablename = 'bots'
    ) THEN
        CREATE POLICY service_role_manage_all_bots ON bots FOR ALL TO service_role USING (true) WITH CHECK (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'service_role_manage_all_conversations' AND tablename = 'conversations'
    ) THEN
        CREATE POLICY service_role_manage_all_conversations ON conversations FOR ALL TO service_role USING (true) WITH CHECK (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'service_role_manage_all_leads' AND tablename = 'leads'
    ) THEN
        CREATE POLICY service_role_manage_all_leads ON leads FOR ALL TO service_role USING (true) WITH CHECK (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'service_role_manage_all_crawled_pages' AND tablename = 'crawled_pages'
    ) THEN
        CREATE POLICY service_role_manage_all_crawled_pages ON crawled_pages FOR ALL TO service_role USING (true) WITH CHECK (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'service_role_manage_all_bot_documents' AND tablename = 'bot_documents'
    ) THEN
        CREATE POLICY service_role_manage_all_bot_documents ON bot_documents FOR ALL TO service_role USING (true) WITH CHECK (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'service_role_manage_all_shopify_stores' AND tablename = 'shopify_stores'
    ) THEN
        CREATE POLICY service_role_manage_all_shopify_stores ON shopify_stores FOR ALL TO service_role USING (true) WITH CHECK (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'service_role_manage_all_bot_usages' AND tablename = 'bot_usages'
    ) THEN
        CREATE POLICY service_role_manage_all_bot_usages ON bot_usages FOR ALL TO service_role USING (true) WITH CHECK (true);
    END IF;
END $$;
