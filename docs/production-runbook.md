# Production runbook

How to set up, deploy and operate Agentify in production. Steps marked **[account]** need access
to a third-party dashboard; everything else is in this repo.

## 1. Environments

| | Development | Staging | Production |
|---|---|---|---|
| Supabase project | own / shared dev | **separate project** | **separate project** (Pro plan or higher, PITR on) |
| Vercel | `npm run dev` | Preview deployments | Production deployment |
| Shopify app | dev app (`shopify.app.toml`) | dev app or a staging app | **separate app** (`shopify.app.production.toml`) |
| `NODE_ENV` | development | production (Vercel previews run as production) | production |

Never point staging or development at the production database.

## 2. One-time setup (in this order)

1. **[account] Supabase:** create the staging and production projects. Enable point-in-time
   recovery on production, and test one restore.
2. **Migrations:** apply every file in `supabase/migrations` to each project
   (see [supabase/README.md](../supabase/README.md)). Then confirm the lockdown: the `curl` check
   in that README must return `permission denied`.
3. **[account] Upstash:** create a Redis database per environment (or use Vercel KV).
4. **[account] Email provider** (Resend, Postmark or SES): verify the sending domain and add its
   SPF, DKIM and DMARC records. Send one test email from staging.
5. **[account] Sentry:** create a project. Add `SENTRY_DSN` and `NEXT_PUBLIC_SENTRY_DSN`; for readable
   stack traces also `SENTRY_AUTH_TOKEN`, `SENTRY_ORG` and `SENTRY_PROJECT` (build-time only).
6. **[account] Vercel:** set the environment variables from section 3 for **Preview** and **Production**.
7. **Deploy** and check `/api/health` returns `{"status":"ok"}`. A missing or invalid variable stops
   the server at startup with a list of what's wrong (Vercel function logs).
8. **[account] Shopify:** fill in the `REPLACE_ME` values in `shopify.app.production.toml`, then
   `npx shopify app config use shopify.app.production.toml && npx shopify app deploy`.
   In the Partner Dashboard, request **protected customer data** access (order email, phone, address)
   and run the compliance webhook tests against staging.
9. **Monitoring:** section 5.

## 3. Environment variables

`.env.example` documents each variable. Production refuses to start without the **required** ones.

| Variable | Required in production | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | yes | Per environment |
| `SUPABASE_DATABASE_URL` | yes | Transaction pooler, port 6543 |
| `SUPABASE_DB_CA_CERT` | recommended | Dashboard → Database → SSL; enables certificate verification |
| `DB_POOL_MAX` | no | Default 3 per instance in production |
| `GOOGLE_GENERATIVE_AI_API_KEY`, `GEMINI_MODEL` | key: yes | Paid tier for production |
| `DEFAULT_MONTHLY_TOKEN_BUDGET` | recommended | Token cap per bot per month for bots without their own budget |
| `ENCRYPTION_KEY` | yes, 32+ chars | Encrypts Shopify tokens. **Back it up in a password manager**: losing it means every store must reinstall |
| `ENCRYPTION_KEY_LEGACY` | no | Only during a key rotation |
| `SHOPIFY_API_KEY`, `NEXT_PUBLIC_SHOPIFY_API_KEY`, `SHOPIFY_API_SECRET`, `SHOPIFY_APP_URL`, `SHOPIFY_SCOPES` | yes | `SHOPIFY_SCOPES=read_orders,read_products` (must match the TOML) |
| `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_WIDGET_URL` | yes, https | |
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | yes | Or `KV_REST_API_URL` / `KV_REST_API_TOKEN` |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM` | yes | Gmail fallback works but warns |
| `LANGFUSE_PUBLIC_KEY`, `LANGFUSE_SECRET_KEY`, `LANGFUSE_BASEURL` | recommended | LLM tracing |
| `SENTRY_DSN`, `NEXT_PUBLIC_SENTRY_DSN` | recommended | Error tracking; off when unset |
| `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT` | no | Build-time source map upload |

## 4. First production release: order matters

This release changes encryption, the database and the widget together. Do it in this order:

1. Set `ENCRYPTION_KEY` (and all section 3 variables) in Vercel **before** deploying.
   Without it every Shopify request fails.
2. Apply all migrations to the target database **before** deploying. The code reads
   `shopify_stores.uninstalled_at`; without that column store lookups fail.
3. Deploy. The new `widget.js` polls instead of using Supabase Realtime, which the RLS lockdown blocks
   for anonymous visitors.
4. Re-encrypt stored Shopify tokens with the new key:
   `node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON --env-file=.env scripts/reencrypt-shopify-tokens.mjs`
   (dry run), then again with `--apply`.
5. Rotate keys (section 6). Before this release the database was readable with the public anon
   key, so treat every stored Shopify token and every key in old `.env` files as exposed.
   Ask affected merchants to reinstall the app to get a new Shopify token.

## 5. Monitoring

| What | How | Alert when |
|---|---|---|
| Errors | Sentry (server, edge, browser) | New issue; error rate spike |
| Uptime | **[account]** UptimeRobot, Better Stack or similar, every 1–5 min | `GET /api/health` is not 200, or `GET /widget.js` is not 200 |
| Gemini spend | **[account]** Google Cloud billing budget on the Gemini API project | 50% / 90% / 100% of the monthly budget |
| Per-bot spend | `DEFAULT_MONTHLY_TOKEN_BUDGET` and `bots.monthly_token_budget` | Chat returns `budget_exceeded` |
| LLM quality / cost | Langfuse | — |
| Abuse | 429 counts in logs (`rate_limited`) | Sustained spikes |

`/api/health` runs `SELECT 1`, so it catches database outages as well as app crashes.

What Sentry receives is limited in `lib/sentryPrivacy.ts`: no request or response bodies,
headers, cookies, query strings, SQL parameters, local variables or AI inputs/outputs.
Keep it that way; those would contain shopper data and Shopify tokens.

## 6. Key rotation

| Key | How | Side effects |
|---|---|---|
| `GOOGLE_GENERATIVE_AI_API_KEY` | Create a new key in Google AI Studio / Cloud, update Vercel, redeploy, delete the old key | None |
| Supabase service role / anon keys | Supabase dashboard → API keys (rotate JWT secret or switch to new API keys), update Vercel, redeploy | Rotating the JWT secret signs every dashboard user out |
| Database password | Supabase → Database → reset password, update `SUPABASE_DATABASE_URL` | Brief connection errors during the switch |
| `SHOPIFY_API_SECRET` | Partner Dashboard → rotate client secret, update Vercel, redeploy | Webhooks and session tokens signed with the old secret fail until deploy completes |
| `ENCRYPTION_KEY` | Move the current key to `ENCRYPTION_KEY_LEGACY`, set a new `ENCRYPTION_KEY`, deploy, run `scripts/reencrypt-shopify-tokens.mjs --apply`, then remove `ENCRYPTION_KEY_LEGACY` | None if done in this order |
| Upstash, SMTP, Langfuse, Sentry tokens | Regenerate in each dashboard, update Vercel, redeploy | None |

## 7. Load testing (staging only)

`loadtest/widget.k6.js` covers the public widget API (bot config, live-support polling, chat).
See the header of that file. Chat requests call Gemini and cost money: use a test bot with a small
`monthly_token_budget` and a low `CHAT_RATE`. From one machine you'll mostly see the per-IP rate
limiter (429s); run distributed to measure capacity. Pass criteria: no 5xx, browse p95 < 800 ms.

## 8. Incidents

- **Bad deploy:** Vercel → Deployments → Instant Rollback. Migrations are additive, so the previous
  code keeps working with the newer schema.
- **A bot is being abused or running up cost:** set its `monthly_token_budget` to a small value
  (chat stops once exceeded), or delete the bot.
- **Database outage:** `/api/health` returns 503 and uptime alerts fire. Check Supabase status;
  restore from PITR if data was lost.
- **Suspected key leak:** rotate per section 6, starting with the leaked key.
