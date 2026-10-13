# Agentify product roadmap

_Last updated: 13 October 2026_

Agentify is positioned as **an AI sales and support agent for Indian D2C brands that cuts RTO on cash-on-delivery orders**: one agent, on the website and later on WhatsApp, that confirms COD orders, nudges shoppers to prepay, tracks orders and recommends products in Hinglish.

The market research, competitor analysis, pricing and go-to-market plan behind this roadmap are in the strategy doc (shared separately). This file is the engineering view: what to build, in what order, and how we know a phase is done.

## Principles

- **Each phase ends with a customer gate.** Don't start the next phase until the gate is met.
- **One roadmap item = one small PR.** Each PR has tests, passes CI (Jest, `next build`, Playwright e2e) and carries its own post-merge checklist.
- **Cost before features.** Nothing is sold to a client until AI cost per client is metered and below roughly ₹1,000 a month.
- **Measure what we sell.** Every feature that claims to save or make money logs the event the ROI report needs.

## Phase 0: Security hardening (done)

- [x] Lock down public endpoints, order lookup, Shopify sync/OAuth/webhooks, uploads and the widget (PR #3)
- [x] CI for unit tests, build and e2e (PR #3)
- [x] Bot public key immutable after creation (PR #3)

## Phase 1: Foundations (weeks 1–2)

**Gate:** 3 pilot brands have the agent installed on their live store.

| # | Item | Why | Where | Done when |
|---|---|---|---|---|
| 1.1 | Product retrieval instead of full catalog in the prompt | Prompt size and cost grow with catalog size today; large catalogs exceed the context window | New `products` table with embeddings; `app/api/lib/agents/*`, `app/api/lib/agent.ts`, `app/api/shopify/sync`, webhooks | Prompt carries at most 10 products; a 2,000-product store answers correctly |
| 1.2 | Remove per-message lead-extraction AI call | One extra AI call on almost every message | `app/api/lib/agents/leadAgent.ts`, `app/api/chat/route.ts` | Model is called only when a message contains `@` or a likely name |
| 1.3 | Merge requirement extraction into the main call; model-based routing | Saves a call per sales message; replaces keyword routing | `salesAgent.ts`, `receptionistAgent.ts`, `chat/route.ts` | One AI call per message on the normal path |
| 1.4 | Usage metering per bot | Needed for pricing, caps and margin | New `usage_events` table; every AI and embedding call | Admin shows tokens and estimated cost per bot per month |
| 1.5 | Rate limits and monthly caps per plan | Protects margin and quota | `app/api/chat/route.ts` | Requests over the cap get a polite fallback message |
| 1.6 | Shopify install fixes | Widget and app URLs point at ngrok | `extensions/theme-extension`, `shopify.app.toml`, `public/widget.js` | Fresh install on a dev store works end to end with no tunnel |
| 1.7 | Auto-sync products and crawl key pages on install; "Turn on widget" deep link | New installs start with an empty bot | `app/api/shopify/admin/dashboard`, `app/(auth)/admin/shopify` | A new store has products and policies trained within minutes |
| 1.8 | Cache `widget.js` and public bot config | Every storefront page view hits Vercel and the database | `next.config.ts`, `app/api/public/*` | Versioned, cacheable widget; config cached at the CDN for 60 s |
| 1.9 | Razorpay subscriptions for direct clients | Can't charge pilots otherwise | New billing routes and admin page | A pilot can subscribe and get a GST invoice |

## Phase 2: Sellable core (weeks 3–5)

**Gate:** 3 pilots agree to pay.

| # | Item | Why | Where | Done when |
|---|---|---|---|---|
| 2.1 | COD confirmation on site | RTO is the most expensive problem for COD-heavy brands | `orders/create` webhook, `public/widget.js` order status page block | COD orders get a confirm or cancel prompt; order is tagged in Shopify |
| 2.2 | Prepaid nudge | Brands using prepaid incentives and address checks were at 21% RTO, against 39.2% at the festive peak (Unicommerce) | Widget and checkout extension; merchant-set discount | Merchant can offer an incentive; conversions are logged |
| 2.3 | Returns and exchanges | Most common support question after order status | `lib/shopify/*`, agent tools | Shopper can start a return or exchange within the store's policy |
| 2.4 | Add to cart and checkout link from product cards | Turns recommendations into orders | `public/widget.js` (Shopify AJAX cart API), `salesAgent.ts` | A shopper can add a recommended item without leaving chat |
| 2.5 | Hindi and Hinglish replies | Most new D2C customers are outside metros | Agent prompts, bot settings | Agent answers in the shopper's language; tested with a Hinglish set |
| 2.6 | ROI report v1 | Proves value at renewal | Admin analytics | Monthly view of orders influenced, COD confirmed, RTO avoided (estimate), tickets deflected |

## Phase 3: WhatsApp and recovery (weeks 6–9)

**Gate:** 8 paying clients.

| # | Item | Why | Where | Done when |
|---|---|---|---|---|
| 3.1 | WhatsApp Cloud API channel for the same agent | Indian shoppers expect WhatsApp; needed for COD and cart flows | New `app/api/whatsapp/*`, shared agent pipeline | The agent answers on WhatsApp with the same knowledge and tools |
| 3.2 | COD confirmation on WhatsApp | Reaches shoppers who left the site | Order webhook → WhatsApp utility template | Confirmations sent and tracked; message fees metered |
| 3.3 | Cart recovery | The lead feature of the top Indian competitors | Checkout webhooks, WhatsApp marketing templates | Recovered carts attributed in the ROI report |
| 3.4 | Proactive on-site triggers | Engage hesitating shoppers | `public/widget.js` | Merchant-configurable triggers (time on page, exit intent) |
| 3.5 | Pass-through WhatsApp billing | Meta charges per message since Oct 2026 | Usage metering, billing | Monthly invoice shows WhatsApp fees at cost plus GST |

## Phase 4: Scale (weeks 10–14)

**Gate:** decided at the Phase 3 gate, based on which channel brought paying clients.

| # | Item | Why | Where |
|---|---|---|---|
| 4.1 | WooCommerce plugin | Non-Shopify stores get nothing from Shopify Inbox | New `plugins/woocommerce`, same widget |
| 4.2 | Shopify App Store listing | Self-serve channel | Shopify Billing API, protected customer data approval, remove unused `write_products` scope, close GDPR webhook gaps |
| 4.3 | Self-serve onboarding | Lower setup cost per client | Onboarding pages and checklist |

## Not now

Voice agent, Instagram DMs, product quizzes and loyalty. Competitors offer them, but each adds cost and support load before the core is proven. Revisit after the Phase 3 gate.
