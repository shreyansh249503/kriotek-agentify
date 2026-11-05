import { SHOPIFY_API_VERSION } from "./apiVersion";

/**
 * The shop's currency code (e.g. "EUR"), or null if Shopify can't be reached in time.
 * Best effort: callers must not fail because of it (the next product sync fills it too).
 */
export async function fetchShopCurrency(
  shop: string,
  accessToken: string,
  timeoutMs = 5000,
): Promise<string | null> {
  try {
    const res = await fetch(`https://${shop}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": accessToken },
      body: JSON.stringify({ query: "{ shop { currencyCode } }" }),
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (!res?.ok) return null;
    const json = await res.json();
    const code = json?.data?.shop?.currencyCode;
    return typeof code === "string" && /^[A-Z]{3}$/.test(code) ? code : null;
  } catch (err) {
    console.warn(`[shopify] Could not read the currency for ${shop}:`, err);
    return null;
  }
}
