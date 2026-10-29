-- ==============================================================================
-- Lock down the public schema for the Supabase Data API.
--
-- The anon key is public (it ships to browsers), so every table must have RLS
-- enabled and no rights for `anon`. The app's server code connects as `postgres`
-- / `service_role`, which bypass RLS, so it is unaffected.
--
-- The only browser access left is the admin inbox's Realtime subscription:
-- a logged-in user may read conversations belonging to their own bots.
-- ==============================================================================

-- 1. Enable RLS and revoke Data API rights on every table in public,
--    including legacy tables the app no longer uses.
DO $$
DECLARE
    t record;
BEGIN
    FOR t IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t.tablename);
        EXECUTE format('REVOKE ALL ON TABLE public.%I FROM anon, authenticated', t.tablename);
    END LOOP;
END $$;

REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon, authenticated;

-- Tables created later by postgres don't get Data API rights automatically.
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
    REVOKE ALL ON TABLES FROM anon, authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
    REVOKE ALL ON SEQUENCES FROM anon, authenticated;

-- 2. Ownership check used by policies. SECURITY DEFINER so policies don't need
--    the caller to have read access to `bots`.
CREATE OR REPLACE FUNCTION public.user_owns_bot(target_bot_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.bots b
        WHERE b.id = target_bot_id
          AND b.user_id = (SELECT auth.uid())::text
    );
$$;

REVOKE ALL ON FUNCTION public.user_owns_bot(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.user_owns_bot(uuid) TO authenticated;

-- 3. Admin inbox Realtime: owners can read their bots' conversations.
GRANT SELECT ON TABLE public.conversations TO authenticated;

DROP POLICY IF EXISTS owner_read_conversations ON public.conversations;
CREATE POLICY owner_read_conversations ON public.conversations
    FOR SELECT TO authenticated
    USING (public.user_owns_bot(bot_id));

-- 4. Realtime publication for conversations (idempotent; skipped where
--    the Supabase publication doesn't exist, e.g. plain Postgres in CI).
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime')
       AND NOT EXISTS (
           SELECT 1 FROM pg_publication_tables
           WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'conversations'
       ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
    END IF;
END $$;
