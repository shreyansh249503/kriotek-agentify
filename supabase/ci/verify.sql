-- Assertions run after migrations in CI (and safe to run anywhere: it only reads, inside a
-- transaction that is rolled back). Any failed check raises an exception.

BEGIN;

-- 1. Every public table has RLS enabled.
DO $$
DECLARE missing text;
BEGIN
    SELECT string_agg(relname, ', ') INTO missing
    FROM pg_class
    WHERE relnamespace = 'public'::regnamespace AND relkind = 'r' AND NOT relrowsecurity;
    IF missing IS NOT NULL THEN
        RAISE EXCEPTION 'RLS is disabled on: %', missing;
    END IF;
END $$;

-- 2. anon has no table privileges at all.
DO $$
DECLARE granted text;
BEGIN
    SELECT string_agg(DISTINCT table_name, ', ') INTO granted
    FROM information_schema.role_table_grants
    WHERE grantee = 'anon' AND table_schema = 'public';
    IF granted IS NOT NULL THEN
        RAISE EXCEPTION 'anon still has privileges on: %', granted;
    END IF;
END $$;

-- 3. Owners see only their own bots' conversations; other users see none.
INSERT INTO bots (id, name, user_id, public_key) VALUES
    ('00000000-0000-4000-8000-00000000000a', 'Owner bot', '11111111-1111-4111-8111-111111111111', 'pk_ci_owner'),
    ('00000000-0000-4000-8000-00000000000b', 'Other bot', '22222222-2222-4222-8222-222222222222', 'pk_ci_other');
INSERT INTO conversations (bot_id) VALUES
    ('00000000-0000-4000-8000-00000000000a'),
    ('00000000-0000-4000-8000-00000000000b');

SELECT set_config('request.jwt.claims', '{"sub":"11111111-1111-4111-8111-111111111111"}', true);
SET LOCAL ROLE authenticated;
DO $$
DECLARE visible int;
BEGIN
    SELECT count(*) INTO visible FROM public.conversations;
    IF visible <> 1 THEN
        RAISE EXCEPTION 'owner should see exactly 1 conversation, saw %', visible;
    END IF;
END $$;
RESET ROLE;

-- 4. Logged-in users cannot read Shopify tokens.
SET LOCAL ROLE authenticated;
DO $$
BEGIN
    PERFORM 1 FROM public.shopify_stores LIMIT 1;
    RAISE EXCEPTION 'authenticated could read shopify_stores';
EXCEPTION
    WHEN insufficient_privilege THEN NULL;
END $$;
RESET ROLE;

-- 5. Columns the app relies on exist.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'shopify_stores' AND column_name = 'uninstalled_at'
    ) THEN
        RAISE EXCEPTION 'shopify_stores.uninstalled_at is missing';
    END IF;
END $$;

-- 6. Usage counters are unique per bot and period (recordBotTokenUsage upserts on it).
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conrelid = 'public.bot_usages'::regclass
          AND contype = 'u'
          AND conname = 'bot_usages_bot_id_billing_period_key'
    ) THEN
        RAISE EXCEPTION 'bot_usages is missing UNIQUE (bot_id, billing_period)';
    END IF;
END $$;

-- 7. conversations.messages is a required jsonb array, and appendMessages' SQL (app/api/lib/conversations.ts)
--    appends to both an array row and a row still stored the old way, as a JSON string.
DO $$
DECLARE
    stored jsonb;
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'conversations' AND column_name = 'messages'
          AND (is_nullable = 'YES' OR data_type <> 'jsonb')
    ) THEN
        RAISE EXCEPTION 'conversations.messages must be NOT NULL jsonb';
    END IF;

    INSERT INTO conversations (id, bot_id, messages) VALUES
        ('00000000-0000-4000-8000-0000000000c1', '00000000-0000-4000-8000-00000000000a', '[{"role":"user","content":"a"}]'),
        ('00000000-0000-4000-8000-0000000000c2', '00000000-0000-4000-8000-00000000000a', to_jsonb('[{"role":"user","content":"a"}]'::text));

    UPDATE conversations
    SET messages = (CASE jsonb_typeof(messages) WHEN 'array' THEN messages WHEN 'string' THEN (messages #>> '{}')::jsonb ELSE '[]'::jsonb END)
                   || '[{"role":"assistant","content":"b"}]'::jsonb,
        message_count = COALESCE(message_count, 0) + 1
    WHERE id IN ('00000000-0000-4000-8000-0000000000c1', '00000000-0000-4000-8000-0000000000c2');

    FOR stored IN
        SELECT messages FROM conversations
        WHERE id IN ('00000000-0000-4000-8000-0000000000c1', '00000000-0000-4000-8000-0000000000c2')
    LOOP
        IF jsonb_typeof(stored) <> 'array' OR jsonb_array_length(stored) <> 2 OR stored->1->>'content' <> 'b' THEN
            RAISE EXCEPTION 'append produced %', stored;
        END IF;
    END LOOP;
END $$;

-- 8. Shopify product webhooks (app/api/shopify/lib/productWebhooks.ts): a webhook ID is claimed
--    once, removal markers are keyed by shop and product, and stores have a currency column.
DO $$
DECLARE
    first_claim int;
    second_claim int;
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'shopify_stores' AND column_name = 'currency'
    ) THEN
        RAISE EXCEPTION 'shopify_stores.currency is missing';
    END IF;

    WITH claimed AS (
        INSERT INTO shopify_webhook_events (webhook_id, topic, shop) VALUES ('ci-webhook-1', 'products/update', 'ci.myshopify.com')
        ON CONFLICT (webhook_id) DO NOTHING RETURNING webhook_id
    ) SELECT count(*) INTO first_claim FROM claimed;
    WITH claimed AS (
        INSERT INTO shopify_webhook_events (webhook_id, topic, shop) VALUES ('ci-webhook-1', 'products/update', 'ci.myshopify.com')
        ON CONFLICT (webhook_id) DO NOTHING RETURNING webhook_id
    ) SELECT count(*) INTO second_claim FROM claimed;
    IF first_claim <> 1 OR second_claim <> 0 THEN
        RAISE EXCEPTION 'webhook dedupe claimed % then % rows', first_claim, second_claim;
    END IF;

    INSERT INTO shopify_product_removals (shop, product_id, deleted) VALUES ('ci.myshopify.com', 'gid://shopify/Product/1', true);
    -- Marking a deleted product inactive must not clear the deletion.
    INSERT INTO shopify_product_removals (shop, product_id, deleted, product_updated_at)
    VALUES ('ci.myshopify.com', 'gid://shopify/Product/1', false, NOW())
    ON CONFLICT (shop, product_id) DO UPDATE
      SET product_updated_at = EXCLUDED.product_updated_at, removed_at = NOW()
      WHERE NOT shopify_product_removals.deleted;
    IF NOT (SELECT deleted FROM shopify_product_removals WHERE shop = 'ci.myshopify.com' AND product_id = 'gid://shopify/Product/1') THEN
        RAISE EXCEPTION 'a deletion marker was overwritten';
    END IF;
END $$;

ROLLBACK;
