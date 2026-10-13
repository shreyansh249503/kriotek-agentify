import { createClient } from "@supabase/supabase-js";
import {
  mapShopifyOrderToJourney,
  OrderJourneyData,
  RawShopifyOrderNode,
} from "./shopifyOrderMapper";

/**
 * Single implementation of "look up a Shopify order for a shopper".
 *
 * Used by the /api/shopify/orders/lookup route and by the sales and
 * receptionist agents' lookup_shopify_order tool. Because the caller is an
 * anonymous storefront visitor, an order is only returned when the shopper
 * proves they placed it: an exact email match, or a phone number of at least
 * MIN_PHONE_DIGITS digits that matches the end of a phone on the order.
 */

export const SHOPIFY_API_VERSION = "2026-04";
export const MIN_PHONE_DIGITS = 7;

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

export type OrderLookupErrorCode =
  | "invalid_order_number"
  | "verification_required"
  | "not_configured"
  | "not_found"
  | "verification_failed"
  | "upstream_error";

export type OrderLookupResult =
  | { ok: true; journey: OrderJourneyData }
  | { ok: false; code: OrderLookupErrorCode; message: string };

export interface OrderLookupInput {
  botId: string;
  orderNumber: string;
  email?: string | null;
  phone?: string | null;
}

export interface StoreCredentials {
  shop: string;
  access_token: string;
}

/** Order names are things like "#1042" or "1042" or "SHOP-1042". */
export function normalizeOrderNumber(input: string): string | null {
  const raw = (input ?? "").trim().replace(/^#/, "");
  return /^[A-Za-z0-9-]{1,32}$/.test(raw) ? raw : null;
}

export function normalizeEmail(input?: string | null): string | null {
  const email = (input ?? "").trim().toLowerCase();
  return /^[^\s@"]+@[^\s@"]+\.[^\s@"]+$/.test(email) ? email : null;
}

export function normalizePhone(input?: string | null): string | null {
  const digits = (input ?? "").replace(/\D/g, "");
  return digits.length >= MIN_PHONE_DIGITS ? digits : null;
}

/**
 * True only if the shopper's email or phone matches contact details stored on
 * the order. An order with no contact details on file never verifies.
 */
export function verifyOrderContact(
  order: RawShopifyOrderNode,
  email: string | null,
  phone: string | null,
): boolean {
  if (email) {
    const emails = [order.email, order.customer?.email]
      .map((e) => e?.trim().toLowerCase())
      .filter(Boolean);
    if (emails.includes(email)) return true;
  }

  if (phone) {
    const phones = [order.phone, order.customer?.phone, order.shippingAddress?.phone]
      .map((p) => p?.replace(/\D/g, ""))
      .filter((p): p is string => Boolean(p && p.length >= MIN_PHONE_DIGITS));
    // Compare from the end so "+49 151 2345678" matches "01512345678".
    if (phones.some((p) => p.endsWith(phone) || phone.endsWith(p))) return true;
  }

  return false;
}

async function loadStoreForBot(botId: string): Promise<StoreCredentials | null> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
  const { data, error } = await supabase
    .from("shopify_stores")
    .select("shop, access_token")
    .eq("bot_id", botId)
    .single();
  if (error || !data?.shop || !data?.access_token) return null;
  return data as StoreCredentials;
}

async function searchOrders(
  store: StoreCredentials,
  query: string,
): Promise<RawShopifyOrderNode[] | null> {
  const response = await fetch(
    `https://${store.shop}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": store.access_token,
      },
      body: JSON.stringify({
        query: `query searchOrders($query: String!) { orders(first: 5, query: $query) { edges { node { ${ORDER_QUERY_FIELDS} } } } }`,
        variables: { query },
      }),
    },
  );

  if (!response.ok) {
    console.error("[orderLookup] Shopify HTTP error:", response.status);
    return null;
  }
  const json = await response.json();
  if (json?.errors) console.warn("[orderLookup] Shopify GraphQL errors:", json.errors);
  const edges: Array<{ node: RawShopifyOrderNode }> = json?.data?.orders?.edges ?? [];
  return edges.map((e) => e.node);
}

export async function lookupShopifyOrder(
  input: OrderLookupInput,
  deps: { loadStore?: (botId: string) => Promise<StoreCredentials | null> } = {},
): Promise<OrderLookupResult> {
  const orderNum = normalizeOrderNumber(input.orderNumber);
  if (!orderNum) {
    return {
      ok: false,
      code: "invalid_order_number",
      message: "That doesn't look like a valid order number.",
    };
  }

  const email = normalizeEmail(input.email);
  const phone = normalizePhone(input.phone);
  if (!email && !phone) {
    return {
      ok: false,
      code: "verification_required",
      message:
        "To protect customer privacy, please provide the email address or phone number used for the order.",
    };
  }

  const store = await (deps.loadStore ?? loadStoreForBot)(input.botId);
  if (!store) {
    return {
      ok: false,
      code: "not_configured",
      message: "Order lookup isn't set up for this store.",
    };
  }

  // orderNum is restricted to [A-Za-z0-9-], so it can't break out of the
  // quoted search terms.
  const orders = await searchOrders(store, `name:"#${orderNum}" OR name:"${orderNum}"`);
  if (orders === null) {
    return {
      ok: false,
      code: "upstream_error",
      message: "We couldn't reach the store right now. Please try again shortly.",
    };
  }

  const candidates = orders.filter(
    (o) => o.name?.trim().replace(/^#/, "").toLowerCase() === orderNum.toLowerCase(),
  );

  // Use the same message for "no such order" and "wrong contact details" so
  // the endpoint can't be used to discover which order numbers exist.
  const notMatched: OrderLookupResult = {
    ok: false,
    code: candidates.length === 0 ? "not_found" : "verification_failed",
    message:
      "We couldn't find an order with that number and contact details. Please double-check both.",
  };

  const match = candidates.find((o) => verifyOrderContact(o, email, phone));
  if (!match) return notMatched;

  return { ok: true, journey: mapShopifyOrderToJourney(match) };
}

/** Shape the agents' lookup_shopify_order tool returns to the model. */
export async function runOrderLookupTool(
  botId: string,
  args: { order_number: string; email?: string; phone?: string },
) {
  try {
    const result = await lookupShopifyOrder({
      botId,
      orderNumber: args.order_number,
      email: args.email,
      phone: args.phone,
    });
    if (!result.ok) return { error: result.message, code: result.code };

    const { journey } = result;
    return {
      success: true,
      orderNumber: journey.orderNumber,
      statusBadge: journey.statusBadge,
      statusDescription: journey.statusDescription,
      tagPayload: `[ORDER_JOURNEY_JSON:${JSON.stringify(journey)}]`,
      instruction: `Write a warm, friendly 1-sentence status summary for order ${journey.orderNumber}.`,
    };
  } catch (err) {
    console.error("[lookup_shopify_order]", err);
    return { error: "An unexpected error occurred while fetching order details." };
  }
}
