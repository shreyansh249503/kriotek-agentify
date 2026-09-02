import { streamText, tool } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import { buildSystemPrompt, type ContactState } from "../agent";
import type { LeadDecision } from "./leadAgent";
import type { Bot } from "../entities";
import { mapShopifyOrderToJourney, RawShopifyOrderNode } from "@/lib/shopify/shopifyOrderMapper";

type Message = { role: "user" | "assistant" | "system"; content: string };

interface ReceptionistOptions {
  messages: Message[];
  botConfig: Bot & { supported_languages?: string[] };
  leadDecision: LeadDecision | null;
  websiteContext: string;
  isShopifyConnected?: boolean;
}

const ORDER_QUERY_FIELDS = `
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

export function runReceptionistAgent({
  messages,
  botConfig,
  leadDecision,
  websiteContext,
  isShopifyConnected = false,
}: ReceptionistOptions) {
  const contactState: ContactState | undefined = leadDecision
    ? {
        collected: leadDecision.collectedInfo,
        missingFields: leadDecision.missingFields,
        isComplete: leadDecision.isComplete,
      }
    : undefined;

  const systemPrompt = buildSystemPrompt(
    {
      companyName: botConfig.name,
      companyDescription: botConfig.description || "",
      tone: botConfig.tone as "friendly" | "professional" | undefined,
      supportedLanguages: botConfig.supported_languages,
      ecommerceEnabled: botConfig.ecommerce_enabled,
      ecommercePrompt: botConfig.ecommerce_prompt,
      ecommerceProducts: botConfig.ecommerce_products,
      shopifyEnabled: isShopifyConnected,
    },
    { websiteContext },
    contactState,
  );

  const tools = isShopifyConnected
    ? {
        lookup_shopify_order: tool({
          description:
            "Lookup Shopify order status and order journey timeline using order number and customer email or phone.",
          inputSchema: z.object({
            order_number: z.string().describe("The Shopify order number, e.g. #1042 or 1042"),
            email: z.string().optional().describe("Customer's email address associated with the order"),
            phone: z.string().optional().describe("Customer's phone number associated with the order"),
          }),
          execute: async ({ order_number, email, phone }) => {
            try {
              console.log("[lookup_shopify_order tool triggered]", {
                order_number,
                email,
                phone,
                bot_id: botConfig.id,
              });

              const supabase = createClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.SUPABASE_SERVICE_ROLE_KEY!
              );

              const { data: storeData, error: storeErr } = await supabase
                .from("shopify_stores")
                .select("shop, access_token")
                .eq("bot_id", botConfig.id)
                .single();

              if (storeErr || !storeData?.access_token || !storeData?.shop) {
                console.error("[lookup_shopify_order] Store not found error:", storeErr);
                return {
                  error: "Shopify store integration is not configured for this assistant.",
                };
              }

              const cleanOrderNum = order_number.trim();
              const searchName = cleanOrderNum.startsWith("#")
                ? cleanOrderNum
                : `#${cleanOrderNum}`;
              const rawNum = cleanOrderNum.replace(/^#/, "");
              const targetEmail = email ? email.trim().toLowerCase() : null;
              const targetPhone = phone ? phone.trim().replace(/\D/g, "") : null;

              const fetchOrdersFromShopify = async (queryParam?: string) => {
                const gqlPayload = {
                  query: queryParam
                    ? `query searchOrders($query: String!) { orders(first: 25, query: $query) { edges { node { ${ORDER_QUERY_FIELDS} } } } }`
                    : `query searchOrders { orders(first: 50) { edges { node { ${ORDER_QUERY_FIELDS} } } } }`,
                  variables: queryParam ? { query: queryParam } : undefined,
                };

                const response = await fetch(
                  `https://${storeData.shop}/admin/api/2026-04/graphql.json`,
                  {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      "X-Shopify-Access-Token": storeData.access_token,
                    },
                    body: JSON.stringify(gqlPayload),
                  }
                );

                if (!response.ok) {
                  console.error("[lookup_shopify_order] HTTP error:", response.status, await response.text());
                  return [];
                }

                const resJson = await response.json();
                if (resJson.errors) {
                  console.warn("[lookup_shopify_order] GQL warning/errors:", resJson.errors);
                }
                return resJson?.data?.orders?.edges ?? [];
              };

              let queryStr = `name:"${searchName}" OR name:"${rawNum}" OR "${rawNum}"`;
              if (targetEmail) {
                queryStr += ` OR email:"${targetEmail}"`;
              }

              let orderEdges = await fetchOrdersFromShopify(queryStr);
              console.log("[lookup_shopify_order] Primary search fetched count:", orderEdges.length);

              if (orderEdges.length === 0) {
                console.log("[lookup_shopify_order] Primary search returned 0. Querying raw number fallback:", rawNum);
                orderEdges = await fetchOrdersFromShopify(rawNum);
              }

              if (orderEdges.length === 0) {
                console.log("[lookup_shopify_order] Raw query returned 0. Querying recent store orders fallback...");
                orderEdges = await fetchOrdersFromShopify();
              }

              if (orderEdges.length === 0) {
                console.log("[lookup_shopify_order] No orders found in store.");
                return { error: `Order ${cleanOrderNum} was not found.` };
              }

              let matchedOrder: RawShopifyOrderNode | null = null;

              for (const edge of orderEdges) {
                const node = edge.node as RawShopifyOrderNode;
                const nodeName = node.name.trim();
                const nodeRawNum = nodeName.replace(/^#/, "").trim();

                const isOrderNumMatch =
                  nodeName === searchName ||
                  nodeName === cleanOrderNum ||
                  nodeRawNum === rawNum ||
                  node.id.includes(rawNum);

                if (!isOrderNumMatch) continue;

                const orderTopEmail = node.email?.trim().toLowerCase();
                const orderCustomerEmail = node.customer?.email?.trim().toLowerCase();

                const orderTopPhone = node.phone?.replace(/\D/g, "");
                const orderCustomerPhone = node.customer?.phone?.replace(/\D/g, "");
                const orderShippingPhone = node.shippingAddress?.phone?.replace(/\D/g, "");

                const hasAnyContactInRecord = Boolean(
                  orderTopEmail || orderCustomerEmail || orderTopPhone || orderCustomerPhone || orderShippingPhone
                );

                let isContactMatch = false;

                if (!hasAnyContactInRecord) {
                  isContactMatch = true;
                } else {
                  if (targetEmail) {
                    if (
                      (orderTopEmail && orderTopEmail === targetEmail) ||
                      (orderCustomerEmail && orderCustomerEmail === targetEmail)
                    ) {
                      isContactMatch = true;
                    }
                  }

                  if (targetPhone) {
                    if (
                      (orderTopPhone && orderTopPhone.endsWith(targetPhone)) ||
                      (orderCustomerPhone && orderCustomerPhone.endsWith(targetPhone)) ||
                      (orderShippingPhone && orderShippingPhone.endsWith(targetPhone))
                    ) {
                      isContactMatch = true;
                    }
                  }

                  if (!targetEmail && !targetPhone) {
                    isContactMatch = true;
                  }
                }

                if (isContactMatch) {
                  matchedOrder = node;
                  break;
                }
              }

              if (!matchedOrder) {
                console.log("[lookup_shopify_order] Order num matched but contact verification failed for:", cleanOrderNum);
                return {
                  error:
                    "Verification failed. The provided email or phone does not match order records.",
                };
              }

              const journey = mapShopifyOrderToJourney(matchedOrder);
              console.log("[lookup_shopify_order] Successfully mapped journey for:", journey.orderNumber);

              const tagString = `[ORDER_JOURNEY_JSON:${JSON.stringify(journey)}]`;

              return {
                success: true,
                orderNumber: journey.orderNumber,
                statusBadge: journey.statusBadge,
                statusDescription: journey.statusDescription,
                tagPayload: tagString,
                instruction: `Write a warm, friendly 1-sentence status summary for order ${journey.orderNumber}. (e.g. "Your order ${journey.orderNumber} is currently ${journey.statusBadge.toLowerCase()} and being prepared for shipment!").`,
              };
            } catch (err) {
              console.error("[lookup_shopify_order tool exception]", err);
              return {
                error: "An unexpected error occurred while fetching order details.",
              };
            }
          },
        }),
      }
    : undefined;

  const modelName = process.env.GEMINI_MODEL || "gemini-2.5-flash-lite";

  return streamText({
    model: google(modelName),
    system: systemPrompt,
    messages: messages.filter(
      (m) => m.role === "user" || m.role === "assistant",
    ),
    maxOutputTokens: 2048,
    ...(tools ? { tools, stopWhen: ({ steps }) => steps.length >= 5 } : {}),
  });
}

