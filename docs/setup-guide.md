# Setup guide: environment, Supabase, Shopify and deployment

Step-by-step setup for a new environment (staging or production), plus local development.
Do the sections in order. Operating the app once it's live (monitoring, key rotation,
incidents) is in [production-runbook.md](production-runbook.md).

**Quick checklist**

1. [ ] Accounts ready (section 1)
2. [ ] Supabase project, migrations, auth and storage (section 3)
3. [ ] Gemini, Upstash, email, Langfuse and Sentry keys (section 4)
4. [ ] Every environment variable set in Vercel (section 5)
5. [ ] Hardcoded dev values replaced (section 6)
6. [ ] Deployed to Vercel, crons visible (section 7)
7. [ ] Shopify app configured and deployed (section 8)
8. [ ] Post-deploy checks pass (section 10)

---

## 1. Accounts you need

| Service | Used for | Plan notes |
|---|---|---|
| Supabase | Postgres (with pgvector), user login, logo storage | Production: Pro or higher, point-in-time recovery on |
| Vercel | Hosting, cron jobs | Hobby allows only 2 cron jobs; this app uses exactly 2 |
| Shopify Partners | The Shopify app (one dev app, one production app) | Free |
| Google AI Studio / Cloud | Gemini API (chat and embeddings) | Paid tier for production; set a billing budget |
| Upstash (or Vercel KV) | Rate limiting | Required in production |
| Email provider (Resend, Postmark, SES, SendGrid) | Lead emails, privacy-request emails | Needs a verified sending domain |
| Langfuse | LLM tracing (optional) | Free tier is fine to start |
| Sentry | Error tracking (optional, recommended) | Free tier is fine to start |
| A domain | e.g. `app.yourdomain.com` | Must be HTTPS |

Use **separate** Supabase projects and Shopify apps for development, staging and production.
Never point staging or development at the production database.

---

## 2. Local development

```bash
npm install
cp .env.example .env        # then fill in the values (section 5)
npm run dev                 # http://localhost:3000
```

- Use a **development** Supabase project, with all migrations applied (section 3.4).
- Run the tests with `npm test` (Jest) and `npm run test:e2e` (Playwright).
- Testing the Shopify app locally needs a public HTTPS URL for your machine:
  1. Run `ngrok http 3000` and copy the `https://….ngrok-free.dev` URL.
  2. Put that URL everywhere the current ngrok URL appears in `shopify.app.toml`,
     `extensions/theme-extension/blocks/chatbot.liquid` and `allowedDevOrigins` in
     `next.config.ts` (section 6 lists them).
  3. Set `SHOPIFY_APP_URL`, `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_WIDGET_URL` in `.env` to the
     same URL.
  4. Run `npx shopify app config use shopify.app.toml && npx shopify app deploy` to push the URLs
     to the **dev** app, then install it on a development store.

  A free ngrok URL changes each time ngrok restarts, so repeat steps 2–4 when it does.

---

## 3. Supabase

### Supabase setup, start to end

Follow these steps in order. Sections 3.1–3.7 below explain each step in more detail.
For production, do all of them **before** deploying the code.

**Step 1: Create the project**
1. Go to supabase.com → **New project**.
2. Pick a region close to where the app will be hosted.
3. Set a database password and save it somewhere safe.
4. Wait until the project says it's ready (1–2 minutes).

**Step 2: Turn on the extensions**

**Database → Extensions** → search for and enable `vector` and `uuid-ossp`.
The first migration also tries to enable these, so this step just avoids a permission error.

**Step 3: Run the 6 migration files, in this exact order**

Open **SQL Editor → New query**. For each file below:
1. Open it in VS Code and copy **everything** in it.
2. Paste it into the SQL Editor and click **Run**.
3. Wait for "Success", then start a **new query** for the next file.

| Order | File |
|---|---|
| 1 | `supabase/migrations/20261027000000_init_schema.sql` |
| 2 | `supabase/migrations/20261028000000_lockdown_rls_realtime.sql` |
| 3 | `supabase/migrations/20261029000000_shopify_uninstall_tracking.sql` |
| 4 | `supabase/migrations/20261104000000_bot_usages_unique.sql` |
| 5 | `supabase/migrations/20261105000000_conversations_messages_array.sql` |
| 6 | `supabase/migrations/20261106000000_shopify_product_webhooks.sql` |

If one fails, fix the error and run **that same file** again before moving on. Every file is safe
to run twice.

**Don't run** the files in `supabase/ci/`. They're for the automated tests, not for Supabase.

**Step 4: Check the tables exist**

**Table Editor** should list:
- `bots`, `conversations`, `leads`
- `crawled_pages`, `bot_documents`
- `shopify_stores`, `bot_usages`
- `shopify_webhook_events`, `shopify_product_removals`

**Step 5: Set up login (Authentication)**
1. **Authentication → Sign In / Providers → Email:** enabled, with **Confirm email** on.
2. **Authentication → URL Configuration:**
   - **Site URL:** `https://app.yourdomain.com`
   - **Redirect URLs:** add `https://app.yourdomain.com/**`
3. **Authentication → Emails → SMTP Settings:** enter your email provider's SMTP details.
   Supabase's built-in email only sends a few emails per hour.

**Step 6: Create the storage bucket (bot logos)**

**Storage → New bucket:**
- Name: exactly **`bot-avatars`**
- **Public bucket:** on

**Step 7: Check Realtime (admin inbox)**

**Database → Publications → `supabase_realtime`**: `conversations` should be listed.
Migration 2 adds it.

**Step 8: Copy the keys into your environment variables**

| Copy from | Into |
|---|---|
| Project Settings → API → Project URL | `NEXT_PUBLIC_SUPABASE_URL` |
| Project Settings → API → `anon` key | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| Project Settings → API → `service_role` key (secret) | `SUPABASE_SERVICE_ROLE_KEY` |
| **Connect** button → Transaction pooler (port **6543**), with your password filled in | `SUPABASE_DATABASE_URL` |
| Project Settings → Database → SSL Configuration → Download certificate | `SUPABASE_DB_CA_CERT` |

**Step 9: Confirm the database is locked down**

In a terminal, with your URL and anon key filled in:

```bash
curl -s "https://<project-ref>.supabase.co/rest/v1/conversations?select=id&limit=1" \
  -H "apikey: <anon key>" -H "Authorization: Bearer <anon key>"
```

You should get `permission denied for table conversations`. If you get data back, migration 2
didn't run.

**Step 10: Start the app**

Set the env vars (locally in `.env`, or in Vercel), start or deploy the app, and open
`/api/health`. It should show `{"status":"ok"}`.

### 3.1 Create the project

1. Go to supabase.com → **New project**. Choose a region close to your Vercel region (section 7).
2. Save the **database password** in a password manager. You need it for the connection string.
3. Production: **Project Settings → Add-ons → Point in time recovery** on. Test one restore
   before launch.

### 3.2 Collect keys and connection strings

| Value | Where in the Supabase dashboard | Goes into |
|---|---|---|
| Project URL | Project Settings → API → Project URL | `NEXT_PUBLIC_SUPABASE_URL` |
| `anon` public key | Project Settings → API → Project API keys | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| `service_role` key (**secret**) | same page | `SUPABASE_SERVICE_ROLE_KEY` |
| Transaction pooler string (port **6543**) | Connect → Connection string → Transaction pooler | `SUPABASE_DATABASE_URL` (the app uses this) |
| Session pooler or direct string (port **5432**) | Connect → Session pooler | Only for running migrations with `psql` |
| SSL certificate | Project Settings → Database → SSL Configuration → Download certificate | `SUPABASE_DB_CA_CERT` |

Replace `[YOUR-PASSWORD]` in the connection strings with the database password.

For `SUPABASE_DB_CA_CERT`, paste the certificate's contents. In Vercel you can paste it with
real line breaks. In a `.env` file, put it on one line with `\n` where the line breaks were.

### 3.3 Extensions

The first migration creates `vector` (pgvector) and `uuid-ossp`. If it fails with a permission
error, enable both under **Database → Extensions**, then run the migrations again.

### 3.4 Run the migrations, in this order

| # | File | What it does |
|---|---|---|
| 1 | `20261027000000_init_schema.sql` | Tables, columns, indexes |
| 2 | `20261028000000_lockdown_rls_realtime.sql` | Row-level security; no table access for anonymous users; Realtime for the admin inbox |
| 3 | `20261029000000_shopify_uninstall_tracking.sql` | `shopify_stores.uninstalled_at` |
| 4 | `20261104000000_bot_usages_unique.sql` | One usage row per bot per month (token accounting) |
| 5 | `20261105000000_conversations_messages_array.sql` | Fixes the conversation message storage format |
| 6 | `20261106000000_shopify_product_webhooks.sql` | Shop currency, webhook dedupe, product removals |

All six must be applied **before** deploying the code. With migration 6 missing, every chat
request fails with a 500. Each migration is safe to run more than once.

Pick **one** way to run them:

**Option A: Supabase CLI** (recommended; it records which files have run)

```bash
npx supabase login
npx supabase link --project-ref <project-ref>     # the ID in the project URL
npx supabase db push
```

**Option B: SQL editor.** In this repo, open each file in `supabase/migrations/`, in the order of
the table above (1 to 6). Copy the file's entire contents into Supabase's **SQL Editor** and click
**Run**. Check each one succeeds before running the next.

**Option C: psql**, using the session (5432) connection string:

```bash
for f in supabase/migrations/*.sql; do psql "$SESSION_DATABASE_URL" -v ON_ERROR_STOP=1 -f "$f"; done
```

**Check the database is locked down.** With only the anon key, reading a table must fail:

```bash
curl -s "$NEXT_PUBLIC_SUPABASE_URL/rest/v1/conversations?select=id&limit=1" \
  -H "apikey: $NEXT_PUBLIC_SUPABASE_ANON_KEY" -H "Authorization: Bearer $NEXT_PUBLIC_SUPABASE_ANON_KEY"
# expected: "permission denied for table conversations"
```

### 3.5 Authentication (admin dashboard login)

Admins sign up and log in with email and password.

1. **Authentication → Sign In / Providers → Email:** enabled. Keep **Confirm email** on in production.
2. **Authentication → URL Configuration:**
   - **Site URL:** `https://app.yourdomain.com` (confirmation links go here).
   - **Redirect URLs:** add `https://app.yourdomain.com/**`, plus `http://localhost:3000/**` on the
     development project only.
3. **Authentication → Emails → SMTP Settings:** turn on custom SMTP with your email provider's
   details. Supabase's built-in email sends only a few messages an hour, which isn't enough for
   production sign-ups.
4. Optional: brand the confirmation and password-reset templates under **Authentication → Emails**.

### 3.6 Storage (bot logos)

1. **Storage → New bucket**, name it exactly **`bot-avatars`**, and make it **Public**.
2. Optional: set the bucket's file size limit to 1 MB and its allowed MIME types to
   `image/jpeg, image/png, image/webp`. The upload API enforces these too.

Uploads go through the server with the service role key, so the bucket needs no upload policies.

### 3.7 Realtime

Migration 2 adds `conversations` to Supabase's Realtime publication, which the admin inbox uses.
To check, go to **Database → Publications → supabase_realtime**: `conversations` should be listed.

---

## 4. Other services

| Service | Steps | Variables |
|---|---|---|
| **Gemini** | Google AI Studio → Get API key (link a billing account for production). In Google Cloud, add a billing budget alert at 50%, 90% and 100% | `GOOGLE_GENERATIVE_AI_API_KEY`, optional `GEMINI_MODEL` |
| **Upstash Redis** | upstash.com → Create database (region near Vercel) → REST API section. Alternatively, Vercel → Storage → Upstash integration, which sets `KV_REST_API_*` | `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` |
| **Email (SMTP)** | Verify your sending domain and add its SPF, DKIM and DMARC DNS records. Create SMTP credentials | `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM` |
| **Langfuse** | cloud.langfuse.com → New project → API keys | `LANGFUSE_PUBLIC_KEY`, `LANGFUSE_SECRET_KEY`, `LANGFUSE_BASEURL` |
| **Sentry** | sentry.io → New project (Next.js) → Client keys (DSN). For readable stack traces, also create an auth token | `SENTRY_DSN`, `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT` |

**Generating secrets.** Use either command for `ENCRYPTION_KEY` and `CRON_SECRET`:

```bash
openssl rand -base64 32
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Store `ENCRYPTION_KEY` in a password manager. If it's lost, every Shopify store has to reinstall
the app.

---

## 5. Environment variables

In production the app checks these at startup (`lib/env.ts`). If a **required** one is missing,
the server refuses to start and the Vercel function logs list what's wrong.

| Variable | Required (prod) | Where it comes from / value |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | yes | Section 3.2 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | yes | Section 3.2 |
| `SUPABASE_SERVICE_ROLE_KEY` | yes | Section 3.2 (secret) |
| `SUPABASE_DATABASE_URL` | yes | Transaction pooler, port 6543 |
| `SUPABASE_DB_CA_CERT` | recommended | Section 3.2 |
| `DB_POOL_MAX` | no | Default 3 per instance in production |
| `GOOGLE_GENERATIVE_AI_API_KEY` | yes | Section 4 |
| `GEMINI_MODEL` | no | Default `gemini-2.5-flash-lite` |
| `DEFAULT_MONTHLY_TOKEN_BUDGET` | recommended | e.g. `2000000`: monthly token cap for bots without their own budget |
| `ENCRYPTION_KEY` | yes (32+ chars) | Generate (section 4) |
| `ENCRYPTION_KEY_LEGACY` | no | Only during a key rotation |
| `SHOPIFY_API_KEY` | yes | Partner Dashboard → app → Client ID |
| `NEXT_PUBLIC_SHOPIFY_API_KEY` | yes | Same value as `SHOPIFY_API_KEY` |
| `SHOPIFY_API_SECRET` | yes | Partner Dashboard → app → Client secret |
| `SHOPIFY_APP_URL` | yes | `https://app.yourdomain.com` |
| `SHOPIFY_SCOPES` | yes | `read_orders,read_products` (must match the TOML) |
| `NEXT_PUBLIC_API_URL` | yes | `https://app.yourdomain.com` |
| `NEXT_PUBLIC_WIDGET_URL` | yes | `https://app.yourdomain.com` (`widget.js` is served from here) |
| `NEXT_PUBLIC_LANDING_BOT_KEY` | no | Public key of the bot shown on your own marketing site; no widget there when unset |
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | yes | Or `KV_REST_API_URL`, `KV_REST_API_TOKEN` |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM` | yes | Section 4 |
| `CRON_SECRET` | recommended | Generate a **new** value (the one previously committed in `.env.example` is public) |
| `LANGFUSE_PUBLIC_KEY`, `LANGFUSE_SECRET_KEY`, `LANGFUSE_BASEURL` | recommended | Section 4 |
| `SENTRY_DSN`, `NEXT_PUBLIC_SENTRY_DSN` | recommended | Section 4 |
| `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT` | no | Build time only |

**`NEXT_PUBLIC_*` values are baked into the build.** After changing one in Vercel, redeploy.

---

## 6. Hardcoded development values to replace before going live

| File | What's there now | Change to |
|---|---|---|
| `extensions/theme-extension/blocks/chatbot.liquid` | `src="https://drew-thirteen-heroism.ngrok-free.dev/widget.js"` | `src="https://app.yourdomain.com/widget.js"`. **This is the script merchants' stores load**; it can't read env vars, so edit the file before `shopify app deploy` for the production app |
| `shopify.app.production.toml` | `REPLACE_ME` client ID and domain | Production app's Client ID and your domain (section 8.2) |
| `shopify.app.toml` | ngrok URLs | Dev app only. Leave it, or update it to your current ngrok URL |
| `next.config.ts` → `allowedDevOrigins` | ngrok hostname | Dev only, so it doesn't affect production. Update it to your current ngrok host |
| `next.config.ts` → `images.remotePatterns` | `bhyrxyzokssibgeznojo.supabase.co` | Production Supabase host. `*.supabase.co` is already allowed, so this entry is optional |
| `public/widget.js` (default bot avatar) | Image URL in the **dev** Supabase project | Upload the avatar to the production `bot-avatars` bucket and use that URL, or a file in `public/` |
| `components/header/Header.tsx` | Storage key `sb-bhyrxyzokssibgeznojo-auth-token` | Fallback only. Change it to `sb-<prod-project-ref>-auth-token`, or remove the fallback |
| `.env.example` → `CRON_SECRET` | (cleared) | The old value is still in git history: never use it, always generate a new one |
| `extensions/theme-extension/shopify.extension.toml` | `api_version = "2024-01"` | Consider `2026-04` to match the app |

The marketing site's widget (`app/(main)/(landing)/layout.tsx`) now uses `NEXT_PUBLIC_WIDGET_URL` and
`NEXT_PUBLIC_LANDING_BOT_KEY`, so it needs no code change.

---

## 7. Vercel deployment

1. **Import the project:** Vercel → Add New → Project → pick the repo. The framework is detected
   as Next.js and the defaults are fine. Node.js 20 or newer.
2. **Region:** Project Settings → Functions → Region. Pick the one closest to the Supabase region.
3. **Environment variables:** add everything from section 5 for **Production**, and a separate
   set (staging Supabase project and dev Shopify app) for **Preview**.
4. **Domain:** Project Settings → Domains → add `app.yourdomain.com` and create the DNS record
   Vercel shows.
5. **Deploy** (push to the production branch, or click Redeploy).
6. **Cron jobs** come from `vercel.json`. Under **Settings → Cron Jobs** you should see:
   - `/api/cron/db-keepalive` daily at 04:00 UTC
   - `/api/cron/shopify-webhook-cleanup` daily at 04:30 UTC

   Vercel sends `CRON_SECRET` with each run automatically.
7. **Long requests:** website crawling (`/api/ingest-url`, `/api/extract-products`) can take minutes.
   If you see timeouts in the function logs, raise **Settings → Functions → Max Duration**.

---

## 8. Shopify

### 8.1 Create the apps

In the **Partner Dashboard → Apps → Create app → Create app manually**:

- one **development** app (used with `shopify.app.toml` and ngrok);
- one **production** app (used with `shopify.app.production.toml`).

From each app's **Client credentials** page, copy the **Client ID** (`SHOPIFY_API_KEY`,
`NEXT_PUBLIC_SHOPIFY_API_KEY`) and the **Client secret** (`SHOPIFY_API_SECRET`).

### 8.2 Configure the production app

Edit `shopify.app.production.toml` and replace every `REPLACE_ME`:

```toml
client_id = "<production Client ID>"
application_url = "https://app.yourdomain.com/api/shopify/install"
# webhooks uri (both entries):   https://app.yourdomain.com/api/shopify/webhooks
# [auth] redirect_urls:          https://app.yourdomain.com/api/shopify/callback
```

Keep `[access_scopes] scopes = "read_orders,read_products"` the same as `SHOPIFY_SCOPES`.

### 8.3 Point the theme extension at production

In `extensions/theme-extension/blocks/chatbot.liquid`, set the script `src` to
`https://app.yourdomain.com/widget.js` (section 6).

### 8.4 Deploy the app configuration

Deploy only after the web app is live (section 7), because Shopify checks the URLs:

```bash
npx shopify app config use shopify.app.production.toml
npx shopify app deploy        # pushes URLs, scopes, webhooks and the theme extension
```

To switch back to development afterwards: `npx shopify app config use shopify.app.toml`.

### 8.5 Partner Dashboard settings

1. **API access → Protected customer data:** request access to customer **name, email, phone and
   address**. The order lookup needs them, and Shopify blocks those fields until it's approved.
2. **Order history:** `read_orders` only returns the last 60 days of orders. If customers need
   older orders, request `read_all_orders` as well.
3. **Compliance webhooks** (`customers/data_request`, `customers/redact`, `shop/redact`) are
   declared in the TOML. Run the Partner Dashboard's compliance webhook tests against staging.
4. For the App Store listing: privacy policy and support URLs (see `docs/legal/`).

### 8.6 Install and test on a development store

1. Partner Dashboard → **Stores → Add store → Development store**.
2. Production app → **Test your app** → choose the store → install. The app opens inside the
   Shopify admin at `/admin/shopify`.
3. In the app, link or create a bot and run **Sync products**.
4. In the store's **Online Store → Themes → Customize → App embeds / Add block**, add
   **Agentify Chatbot**. Leave "Bot Public Key Override" empty: the widget finds the bot from the
   shop domain.
5. Open the storefront and run the checks in section 10.

---

## 9. First release: order of operations

1. Set every environment variable in Vercel (section 5). Production won't start without the required ones.
2. Run all migrations on the target database (section 3.4). **Before** deploying the code.
3. Replace the hardcoded values (section 6).
4. Deploy to Vercel (section 7). Check `https://app.yourdomain.com/api/health` returns `{"status":"ok"}`.
5. Deploy the Shopify app configuration (section 8.4).
6. If this database holds Shopify stores from before encryption was added, re-encrypt their tokens:
   `node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON --env-file=.env scripts/reencrypt-shopify-tokens.mjs`
   (dry run), then again with `--apply`. See section 4 of the runbook.
7. Run the post-deploy checks (section 10).

---

## 10. Post-deploy checks

| Check | Expected |
|---|---|
| `GET /api/health` | `{"status":"ok"}` |
| `GET /widget.js` | 200, JavaScript |
| Sign up, confirm the email, log in at `/login` | The admin dashboard opens |
| Create a bot, upload a logo | The logo shows (stored in the `bot-avatars` bucket) |
| Train the bot from a URL, then ask the widget about that page | The answer uses the page's content |
| Chat with the bot on the marketing site (if `NEXT_PUBLIC_LANDING_BOT_KEY` is set) | Replies stream in |
| Give your email in chat | The lead appears under Leads; the owner email arrives |
| "Talk to support" in the widget, reply from the admin inbox | The reply appears in the widget |
| Shopify: install, sync, ask for a product | A product carousel shows real products in the shop's currency |
| Shopify: edit a product in the admin | The change reaches the bot within a few seconds (webhook) |
| Shopify: order lookup with an order number and email | The order card shows |
| Vercel → Cron Jobs | Both jobs listed; the next day's runs return 200 |
| Sentry | Any errors from the checks above appear |
| Database lockdown `curl` (section 3.4) | Permission denied |

---

## 11. Troubleshooting

| Symptom | Likely cause |
|---|---|
| Every chat request returns 500 with an empty body | A migration is missing, usually `20261106…` (column `shopify_stores.currency does not exist`) |
| Server doesn't start; logs say `Invalid server environment` | A required variable is missing or not `https`. The log lists which |
| Chat returns 503 `budget_check_failed` | The database is unreachable from the app |
| Chat returns 403 "origin is not authorized" | The bot has allowed domains configured and the site isn't one of them |
| Shopify webhooks return 401 | `SHOPIFY_API_SECRET` doesn't match the app the webhook came from (dev vs production app) |
| Widget doesn't appear on the store | The theme block isn't added, or the liquid `src` still points at ngrok |
| Order lookup finds nothing for older orders | `read_orders` covers 60 days only (section 8.5) |
| No confirmation email at sign-up | Supabase custom SMTP isn't set up (section 3.5), or the email went to spam |
| Logo upload fails | The `bot-avatars` bucket is missing or not named exactly that (section 3.6) |
| Cron jobs return 401 | `CRON_SECRET` isn't set in Vercel, or was changed without redeploying |
