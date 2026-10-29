# Agentify

AI chat agents for websites and Shopify stores. Merchants create a bot in the dashboard, train it
on their site, PDFs or Shopify catalog, and embed it with one script tag. The bot answers
questions, recommends products, captures leads, looks up orders, and hands off to a human.

## What's in this repo

| Area | Path | Notes |
|---|---|---|
| Marketing site | `app/(landing)`, `app/(others)` | Public pages |
| Dashboard | `app/(auth)/admin` | Bots, inbox (live support), leads, analytics, settings |
| Embedded Shopify admin | `app/(auth)/admin/shopify` | Loaded inside Shopify admin; framing rules in `proxy.ts` |
| API | `app/api` | Next.js route handlers |
| Chat agents | `app/api/lib/agents` | Router, receptionist, sales and lead agents (Gemini via AI SDK) |
| Chat widget | `public/widget.js` | Embedded on merchant sites; talks only to `/api/public/*` and `/api/chat*` |
| Shopify theme extension | `extensions/theme-extension` | Adds the widget to storefronts |
| Database migrations | `supabase/migrations` | See [supabase/README.md](supabase/README.md) |

**Stack:** Next.js 16 (App Router), React 19, TypeScript, Supabase (Postgres + pgvector, Auth,
Storage, Realtime), TypeORM, Google Gemini, Langfuse, Upstash Redis, Shopify Admin GraphQL API.

## Getting started

Requires Node 24.

```bash
npm install
cp .env.example .env      # then fill in the values
npm run dev               # http://localhost:3000
```

Apply the database migrations to your Supabase project before first run:
see [supabase/README.md](supabase/README.md).

### Environment

Every variable is documented in [.env.example](.env.example). At startup, `instrumentation.ts`
checks the environment (`lib/env.ts`):

- **Development:** only Supabase, the database URL and the Gemini key are required; problems are logged.
- **Production:** the server refuses to start if anything required is missing or invalid
  (encryption key, Shopify credentials, Upstash, SMTP, https URLs). Values are never logged.

### Shopify app (local)

The dev app config is `shopify.app.toml` (ngrok URLs). Expose the dev server with ngrok, update
the URLs, then `npx shopify app deploy`. Production uses `shopify.app.production.toml`
(fill in the `REPLACE_ME` values first).

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` / `npm start` | Production build / server |
| `npm run lint` | ESLint |
| `npm test` | Unit tests (Jest) |
| `npm run test:e2e` | Playwright E2E (Chromium); starts the dev server |
| `npx tsc --noEmit` | Typecheck |

## Testing

- Unit tests sit next to the code (`*.test.ts(x)`). They mock the database, Supabase, Shopify
  and email; `jest.setup.ts` clears the database URL so a test can never reach a real database.
- E2E tests in `e2e/` mock network calls with Playwright routes.

## CI

`.github/workflows/ci.yml` runs on every pull request and on `main`:

1. **checks:** lint, typecheck, unit tests, production build.
2. **migrations:** applies every migration twice to a fresh Postgres (they must be idempotent),
   then `supabase/ci/verify.sql` asserts the security rules (RLS everywhere, no `anon` access).
3. **e2e:** Playwright on Chromium.

## Security model (short version)

- **Database:** RLS on every table, no access for the public `anon` key. Server code uses the
  `postgres` / `service_role` connection. Details in [supabase/README.md](supabase/README.md).
- **API auth:** dashboard routes require a Supabase session and check bot ownership; embedded
  Shopify routes verify the App Bridge session token; webhooks verify Shopify's HMAC.
  Public widget routes are rate limited per route (`app/api/lib/rateLimit.ts`).
- **Shopify tokens** are encrypted at rest with `ENCRYPTION_KEY` (`app/api/lib/crypto.ts`).
  Rotate with `ENCRYPTION_KEY_LEGACY` and `scripts/reencrypt-shopify-tokens.mjs`.
- **Order lookups** only return an order when the customer's email or phone matches it
  (`lib/shopify/orderLookup.ts`).
- **Crawler** blocks private and internal addresses, including via redirects and DNS rebinding.
- **Shopify privacy webhooks** (`customers/data_request`, `customers/redact`, `shop/redact`)
  are handled in `app/api/shopify/lib/compliance.ts`.
- **Headers:** HSTS, `nosniff`, clickjacking protection; the embedded admin may only be framed by
  Shopify admin and the requesting shop.
- **Logs** must not contain visitor names, emails, phone numbers or message text.
