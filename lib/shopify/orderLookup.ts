import { SHOPIFY_API_VERSION } from "./apiVersion";
import { mapShopifyOrderToJourney, OrderJourneyData, RawShopifyOrderNode } from "./shopifyOrderMapper";

export const ORDER_QUERY_FIELDS = `
  id
  name
  email
  phone
  createdAt
  cancelledAt
  cancelReason
  displayFinancialStatus
  displayFulfillmentStatus
  totalPriceSet {
    presentmentMoney {
      amount
      currencyCode
    }
  }
  shippingAddress {
    address1
    city
    province
    country
    zip
    phone
  }
  lineItems(first: 10) {
    edges {
      node {
        title
        quantity
        originalUnitPriceSet {
          presentmentMoney {
            amount
            currencyCode
          }
        }
        image {
          url
          altText
        }
      }
    }
  }
  fulfillments(first: 5) {
    updatedAt
    trackingInfo {
      number
      url
      company
    }
  }
`;

export const MIN_PHONE_DIGITS = 7;

export type OrderLookupResult =
  | { status: "found"; journey: OrderJourneyData }
  /** No usable email or phone was supplied; ask the customer before looking anything up. */
  | { status: "verification_required" }
  | { status: "not_found" }
  /** The order exists but the supplied email/phone doesn't match its records. */
  | { status: "verification_failed" };

interface LookupParams {
  shop: string;
  accessToken: string;
  orderNumber: string;
  email?: string | null;
  phone?: string | null;
}

/** Strips characters with meaning in Shopify search syntax so input can't widen the query. */
export function sanitizeSearchTerm(input: string): string {
  return input.replace(/["\\{}()[\]^~*?:!<>=]/g, "").trim();
}

function digitsOnly(value?: string | null): string {
  return value ? value.replace(/\D/g, "") : "";
}

/**
 * True only when the order has contact details on record and the supplied email or phone matches one.
 * Phones must have at least MIN_PHONE_DIGITS digits; a suffix match covers country-code differences.
 */
export function contactMatchesOrder(
  order: RawShopifyOrderNode,
  email: string | null,
  phoneDigits: string,
): boolean {
  if (email) {
    const orderEmails = [order.email, order.customer?.email]
      .map((e) => e?.trim().toLowerCase())
      .filter(Boolean);
    if (orderEmails.includes(email)) return true;
  }

  if (phoneDigits.length >= MIN_PHONE_DIGITS) {
    const orderPhones = [order.phone, order.customer?.phone, order.shippingAddress?.phone]
      .map(digitsOnly)
      .filter((p) => p.length >= MIN_PHONE_DIGITS);
    return orderPhones.some(
      (p) => p === phoneDigits || p.endsWith(phoneDigits) || phoneDigits.endsWith(p),
    );
  }

  return false;
}

function isOrderNumberMatch(order: RawShopifyOrderNode, rawNum: string): boolean {
  const name = order.name.trim();
  return (
    name === `#${rawNum}` ||
    name === rawNum ||
    order.id === `gid://shopify/Order/${rawNum}`
  );
}

async function searchOrders(shop: string, accessToken: string, query: string): Promise<RawShopifyOrderNode[]> {
  const response = await fetch(`https://${shop}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": accessToken,
    },
    body: JSON.stringify({
      query: `query searchOrders($query: String!) { orders(first: 25, query: $query) { edges { node { ${ORDER_QUERY_FIELDS} } } } }`,
      variables: { query },
    }),
  });

  if (!response.ok) {
    console.error("[orderLookup] Shopify GraphQL error:", response.status);
    return [];
  }

  const json = await response.json();
  const edges: { node: RawShopifyOrderNode }[] = json?.data?.orders?.edges ?? [];
  return edges.map((edge) => edge.node);
}

/**
 * Finds an order by number and returns it only if the caller proves ownership with the order's
 * email or phone. Never falls back to listing recent orders.
 */
export async function lookupVerifiedOrder({
  shop,
  accessToken,
  orderNumber,
  email,
  phone,
}: LookupParams): Promise<OrderLookupResult> {
  const targetEmail = email?.trim().toLowerCase() || null;
  const targetPhone = digitsOnly(phone);

  if (!targetEmail && targetPhone.length < MIN_PHONE_DIGITS) {
    return { status: "verification_required" };
  }

  const rawNum = sanitizeSearchTerm(orderNumber).replace(/^#/, "").trim();
  if (!rawNum) {
    return { status: "not_found" };
  }

  let orders = await searchOrders(shop, accessToken, `name:"#${rawNum}" OR name:"${rawNum}"`);
  if (orders.length === 0) {
    orders = await searchOrders(shop, accessToken, rawNum);
  }

  const candidates = orders.filter((order) => isOrderNumberMatch(order, rawNum));
  if (candidates.length === 0) {
    return { status: "not_found" };
  }

  const verified = candidates.find((order) => contactMatchesOrder(order, targetEmail, targetPhone));
  if (!verified) {
    return { status: "verification_failed" };
  }

  return { status: "found", journey: mapShopifyOrderToJourney(verified) };
}
