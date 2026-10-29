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

ROLLBACK;
