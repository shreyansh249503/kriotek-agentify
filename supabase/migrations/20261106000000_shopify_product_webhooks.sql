-- Shopify product webhooks: dedupe, ordering and the shop's currency.
-- Safe to run more than once.

-- 1. The shop's currency, filled at install and on every sync. Product webhooks don't carry
--    a currency, so they read it from here.
ALTER TABLE public.shopify_stores ADD COLUMN IF NOT EXISTS currency VARCHAR(3);

-- 2. Webhook IDs already processed (X-Shopify-Webhook-Id, the same on every retry).
--    The row is inserted in the same transaction as the product change, so a failed attempt
--    leaves no row and Shopify's retry is processed. Rows older than 7 days are deleted by
--    /api/cron/shopify-webhook-cleanup.
CREATE TABLE IF NOT EXISTS public.shopify_webhook_events (
    webhook_id TEXT PRIMARY KEY,
    topic TEXT NOT NULL,
    shop TEXT NOT NULL,
    received_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_shopify_webhook_events_received_at
    ON public.shopify_webhook_events (received_at);

-- 3. Products removed from a bot by a webhook, so a late create/update can't bring them back.
--    deleted = true: products/delete (permanent; Shopify never reuses product IDs).
--    deleted = false: the product became draft/archived at product_updated_at; only a newer
--    update (e.g. it was published again) adds it back.
CREATE TABLE IF NOT EXISTS public.shopify_product_removals (
    shop TEXT NOT NULL,
    product_id TEXT NOT NULL,
    deleted BOOLEAN NOT NULL,
    product_updated_at TIMESTAMPTZ,
    removed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (shop, product_id)
);
CREATE INDEX IF NOT EXISTS idx_shopify_product_removals_removed_at
    ON public.shopify_product_removals (removed_at);

-- 4. Server-only tables: no Data API access (see 20261028000000_lockdown_rls_realtime.sql).
ALTER TABLE public.shopify_webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopify_product_removals ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.shopify_webhook_events FROM anon, authenticated;
REVOKE ALL ON TABLE public.shopify_product_removals FROM anon, authenticated;
