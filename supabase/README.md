# Database migrations

The schema is managed only by the SQL files in `migrations/`. TypeORM runs with
`synchronize: false` and never changes the schema.

Migrations are idempotent (`IF NOT EXISTS`, `DROP POLICY IF EXISTS`, guarded `DO` blocks),
so they are safe to run against a database that already has data.

| File | Purpose |
|---|---|
| `20261027000000_init_schema.sql` | Tables, columns, indexes |
| `20261028000000_lockdown_rls_realtime.sql` | RLS on every table, no Data API access for `anon`, inbox Realtime policy |
| `20261029000000_shopify_uninstall_tracking.sql` | `shopify_stores.uninstalled_at` (app/uninstalled keeps the row until shop/redact) |

## Apply migrations

### Option A: Supabase CLI (recommended)

```bash
npx supabase login
npx supabase link --project-ref <your-project-ref>
npx supabase db push            # applies pending migrations and records them
```

`db push` keeps a history in `supabase_migrations.schema_migrations`, so each file runs once.

### Option B: psql

Use the **session** connection string (port 5432), not the transaction pooler (6543):

```bash
psql "$SESSION_DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/migrations/20261027000000_init_schema.sql
psql "$SESSION_DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/migrations/20261028000000_lockdown_rls_realtime.sql
psql "$SESSION_DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/migrations/20261029000000_shopify_uninstall_tracking.sql
```

## Adding a migration

1. Create `migrations/<YYYYMMDDHHMMSS>_<description>.sql`.
2. Keep it idempotent and non-destructive where possible.
3. Every new table needs `ENABLE ROW LEVEL SECURITY`. Grant `anon` nothing; grant
   `authenticated` only what a browser feature needs, behind a policy.
4. Apply it to staging before production.

## Security model

- Server code connects as `postgres` (direct connection) or `service_role`, both of which bypass RLS.
- The anon key ships to browsers, so `anon` has no table access.
- `authenticated` can only `SELECT` conversations of bots it owns (`owner_read_conversations`),
  which the admin inbox needs for Realtime updates.
- The chat widget does not use Supabase directly; it polls `/api/public/conversation/[id]`.

### Verify the lockdown

With only the anon key, every table should return an error or zero rows:

```bash
curl -s "$NEXT_PUBLIC_SUPABASE_URL/rest/v1/conversations?select=id&limit=1" \
  -H "apikey: $NEXT_PUBLIC_SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $NEXT_PUBLIC_SUPABASE_ANON_KEY"
# expected: {"code":"42501", ... "permission denied for table conversations"}
```
