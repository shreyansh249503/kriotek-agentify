-- Minimal Supabase stand-ins so migrations can run on plain Postgres in CI.
-- Everything is created only if missing, so this is a no-op on a real Supabase database.

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
        CREATE ROLE anon NOLOGIN;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
        CREATE ROLE authenticated NOLOGIN;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'service_role') THEN
        CREATE ROLE service_role NOLOGIN BYPASSRLS;
    END IF;
END $$;

CREATE SCHEMA IF NOT EXISTS auth;
GRANT USAGE ON SCHEMA auth TO anon, authenticated, service_role;
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- Same contract as Supabase's auth.uid(): the JWT "sub" claim of the current request.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
        WHERE n.nspname = 'auth' AND p.proname = 'uid'
    ) THEN
        CREATE FUNCTION auth.uid() RETURNS uuid
        LANGUAGE sql STABLE
        AS $fn$ SELECT nullif(current_setting('request.jwt.claims', true)::json->>'sub', '')::uuid $fn$;
        GRANT EXECUTE ON FUNCTION auth.uid() TO anon, authenticated, service_role;
    END IF;
END $$;

-- Supabase grants table access to anon by default; mirror that so CI proves the lockdown removes it.
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated;
