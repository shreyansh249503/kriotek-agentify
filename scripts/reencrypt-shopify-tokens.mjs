// Re-encrypts every stored Shopify access token with the current ENCRYPTION_KEY.
// Handles plaintext tokens and tokens encrypted with a legacy key (ENCRYPTION_KEY_LEGACY or SHOPIFY_API_SECRET).
//
// Usage (Node 24+, which runs the imported .ts file natively):
//   node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON --env-file=.env scripts/reencrypt-shopify-tokens.mjs            # dry run
//   node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON --env-file=.env scripts/reencrypt-shopify-tokens.mjs --apply    # write changes

import { createClient } from "@supabase/supabase-js";
import { decryptTokenWithKeyInfo, encryptToken } from "../app/api/lib/crypto.ts";

const apply = process.argv.includes("--apply");

if (!process.env.ENCRYPTION_KEY || process.env.ENCRYPTION_KEY.length < 32) {
  console.error("ENCRYPTION_KEY must be set (>= 32 chars) before re-encrypting.");
  process.exit(1);
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } },
);

const { data: stores, error } = await supabase
  .from("shopify_stores")
  .select("shop, access_token");

if (error) {
  console.error("Failed to load shopify_stores:", error.message);
  process.exit(1);
}

let updated = 0;
let failed = 0;

for (const store of stores ?? []) {
  if (!store.access_token) continue;

  let result;
  try {
    result = decryptTokenWithKeyInfo(store.access_token);
  } catch {
    failed++;
    console.error(`  ✗ ${store.shop}: cannot decrypt with current or legacy keys`);
    continue;
  }

  if (!result.needsReencrypt) continue;

  updated++;
  console.log(`  ${apply ? "↻" : "would re-encrypt"} ${store.shop}`);

  if (apply) {
    const { error: updateError } = await supabase
      .from("shopify_stores")
      .update({ access_token: encryptToken(result.plainText) })
      .eq("shop", store.shop);

    if (updateError) {
      failed++;
      console.error(`  ✗ ${store.shop}: update failed: ${updateError.message}`);
    }
  }
}

console.log(
  `\n${stores?.length ?? 0} stores checked, ${updated} ${apply ? "re-encrypted" : "need re-encryption"}, ${failed} failed.`,
);
if (!apply && updated > 0) console.log("Run again with --apply to write changes.");
process.exit(failed > 0 ? 1 : 0);
