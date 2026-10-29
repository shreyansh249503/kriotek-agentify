-- Track app uninstalls without deleting the store row.
--
-- On app/uninstalled the access token is wiped and uninstalled_at is set. The row is kept
-- because Shopify sends shop/redact ~48 hours later, and that handler needs the shop's
-- bot_id to erase the shop's customer data before deleting the row.
ALTER TABLE public.shopify_stores ADD COLUMN IF NOT EXISTS uninstalled_at TIMESTAMPTZ;
