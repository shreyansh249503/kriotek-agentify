# Data inventory and subprocessors

**Status: input for legal review, not a privacy policy.** It describes what the code does as of
29 Oct 2026, so counsel can draft the privacy policy, terms of service and DPA, and so the Shopify
App Store listing can link to a published privacy policy. Update it when data handling changes.

## Roles

- **Merchants** (Agentify customers) are the controllers of their shoppers' data.
- **Agentify** processes shoppers' data on the merchant's behalf (processor), and is the controller
  of merchant account data.

## Data collected

| Data | From whom | Where it's stored | Purpose |
|---|---|---|---|
| Account email, auth identifiers | Merchants | Supabase Auth | Login |
| Bot configuration (name, prompts, colors, contact email, allowed sites) | Merchants | `bots` | Running the bot |
| Logo and product images | Merchants | Supabase Storage (`bot-avatars`, public URLs) | Widget display |
| Website text, PDFs, embeddings | Merchants' sites/files | `crawled_pages`, `bot_documents` | Answering questions (RAG) |
| Shopify product catalog | Merchants' Shopify stores | `bots.ecommerce_products` | Product recommendations |
| Shopify access token | Shopify install | `shopify_stores` (AES-256-GCM encrypted) | Reading products and orders |
| **Chat messages** (full transcripts) | Shoppers | `conversations.messages` | Conversation, live support, analytics |
| **Name, email, phone** | Shoppers (when asked by the bot) | `conversations`, `leads` | Lead capture; emailed to the merchant |
| Shopify order details (status, items, address) | Merchant's Shopify, on request | **Not stored**; fetched live and shown only after the shopper's email or phone matches the order | Order tracking |
| IP address | Shoppers, merchants | Upstash (rate-limit counters, expire within minutes) | Abuse prevention |
| Conversation IDs | Shoppers | Shopper's browser `localStorage` | Resuming chats |

No cookies are set by the widget on merchants' sites; it uses `localStorage` for conversation IDs.

## Subprocessors

| Service | What it receives | Region / notes |
|---|---|---|
| Supabase | All stored data above | Project region **[confirm]** |
| Google (Gemini API) | Chat messages, bot prompts, site content snippets | Paid tier required so data isn't used for training **[confirm terms]** |
| Langfuse | **Full chat messages and AI replies** (tracing), bot and conversation IDs | `cloud.langfuse.com` (EU) **[confirm]** |
| Upstash | IP addresses and bot keys (rate-limit counters) | **[confirm region]** |
| Email provider (Resend / Postmark / SES) | Merchant emails; lead name, email and phone; privacy-request exports | **[choose provider]** |
| Sentry | Error type, message, stack trace, route. Configured **not** to receive bodies, headers, cookies, query strings, SQL parameters or AI inputs/outputs (`lib/sentryPrivacy.ts`) | **[confirm region]** |
| Hosting (Vercel) | All traffic in transit; function logs | **[confirm]** |
| Shopify | Data the app reads via the Admin API | Merchant's own platform |

## Retention and deletion

| Trigger | What is deleted |
|---|---|
| Merchant deletes a bot | Its conversations, leads, documents, crawled pages and bot record. **Not** uploaded images in Storage. |
| Shopify `customers/redact` | That shopper's leads and conversations (matched by email, or phone ≥ 7 digits) |
| Shopify `shop/redact` (48h after uninstall) | The shop's conversations, leads, Shopify-imported products and store record |
| Shopify `customers/data_request` | Not deleted; the shopper's leads and conversations are emailed to the merchant |
| App uninstall | Shopify access token wiped immediately |

## Gaps to resolve before launch

1. **No retention limit.** Conversations and leads are kept until the bot is deleted. Decide a
   retention period (e.g. 12–24 months) and add a scheduled cleanup, or state indefinite retention
   in the policy.
2. **Uploaded images are never deleted**, even when the bot is deleted.
3. **Bot deletion ignores errors** (each step has `.catch(() => {})`), so it can report success while
   leaving data behind. Make it a single transaction that fails loudly.
4. **No self-service export or deletion** for merchants outside Shopify (GDPR access/erasure
   requests would be manual).
5. **`shop/redact` deletes all conversations and leads of the linked bot**, including any collected
   outside Shopify if the merchant also uses the bot elsewhere. Either track each conversation's
   source or say so in the terms.
6. **Langfuse holds transcripts.** Either list it as above or stop sending message text to it.
7. **Consent:** the widget asks shoppers for contact details in chat. Decide whether merchants must
   show a privacy notice in the widget (a "by chatting you agree…" line linking to the merchant's
   policy is typical).

## Documents to publish

- **Privacy policy** (public URL, required for the Shopify App Store listing), covering merchant data
  as controller and shopper data as processor.
- **Terms of service** for merchants.
- **DPA** for merchants, with the subprocessor list above as an annex.
- **Subprocessor page**, kept in sync with the table above.
