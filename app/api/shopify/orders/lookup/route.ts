import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { mapShopifyOrderToJourney, RawShopifyOrderNode } from "@/lib/shopify/shopifyOrderMapper";

const { NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;

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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { bot_id, public_key, order_number, email, phone } = body;

    if (!order_number) {
      return NextResponse.json(
        { error: "Order number is required." },
        { status: 400 }
      );
    }

    const supabase = createClient(
      NEXT_PUBLIC_SUPABASE_URL!,
      SUPABASE_SERVICE_ROLE_KEY!
    );

    let targetBotId = bot_id;

    if (!targetBotId && public_key) {
      const { data: bot } = await supabase
        .from("bots")
        .select("id")
        .eq("public_key", public_key)
        .single();
      if (bot) {
        targetBotId = bot.id;
      }
    }

    if (!targetBotId) {
      return NextResponse.json(
        { error: "Bot ID or public key is required." },
        { status: 400 }
      );
    }

    // Retrieve Shopify store token for this bot
    const { data: storeData, error: storeError } = await supabase
      .from("shopify_stores")
      .select("shop, access_token")
      .eq("bot_id", targetBotId)
      .single();

    if (storeError || !storeData?.access_token || !storeData?.shop) {
      return NextResponse.json(
        { error: "Shopify store integration not found for this assistant." },
        { status: 404 }
      );
    }

    const { shop, access_token } = storeData;

    const cleanOrderNum = order_number.trim();
    const searchName = cleanOrderNum.startsWith("#") ? cleanOrderNum : `#${cleanOrderNum}`;
    const rawNum = cleanOrderNum.replace(/^#/, "");

    const targetEmail = email ? email.trim().toLowerCase() : null;
    const targetPhone = phone ? phone.trim().replace(/\D/g, "") : null;

    // Helper to fetch orders from Shopify GraphQL API
    const fetchOrdersFromShopify = async (queryParam?: string) => {
      const gqlPayload = {
        query: queryParam
          ? `query searchOrders($query: String!) { orders(first: 25, query: $query) { edges { node { ${ORDER_QUERY_FIELDS} } } } }`
          : `query searchOrders { orders(first: 50) { edges { node { ${ORDER_QUERY_FIELDS} } } } }`,
        variables: queryParam ? { query: queryParam } : undefined,
      };

      const response = await fetch(`https://${shop}/admin/api/2026-04/graphql.json`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": access_token,
        },
        body: JSON.stringify(gqlPayload),
      });

      if (!response.ok) {
        console.error("Shopify GraphQL error response:", response.status, await response.text());
        return [];
      }

      const resJson = await response.json();
      return resJson?.data?.orders?.edges ?? [];
    };

    let queryStr = `name:"${searchName}" OR name:"${rawNum}" OR "${rawNum}"`;
    if (targetEmail) {
      queryStr += ` OR email:"${targetEmail}"`;
    }

    let orderEdges = await fetchOrdersFromShopify(queryStr);

    if (orderEdges.length === 0) {
      orderEdges = await fetchOrdersFromShopify(rawNum);
    }

    if (orderEdges.length === 0) {
      orderEdges = await fetchOrdersFromShopify();
    }

    if (orderEdges.length === 0) {
      return NextResponse.json(
        { error: `Order ${cleanOrderNum} not found in store.` },
        { status: 404 }
      );
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

      let isMatch = false;

      if (!hasAnyContactInRecord) {
        isMatch = true;
      } else {
        if (targetEmail) {
          if (
            (orderTopEmail && orderTopEmail === targetEmail) ||
            (orderCustomerEmail && orderCustomerEmail === targetEmail)
          ) {
            isMatch = true;
          }
        }

        if (targetPhone) {
          if (
            (orderTopPhone && orderTopPhone.endsWith(targetPhone)) ||
            (orderCustomerPhone && orderCustomerPhone.endsWith(targetPhone)) ||
            (orderShippingPhone && orderShippingPhone.endsWith(targetPhone))
          ) {
            isMatch = true;
          }
        }

        if (!targetEmail && !targetPhone) {
          isMatch = true;
        }
      }

      if (isMatch) {
        matchedOrder = node;
        break;
      }
    }

    if (!matchedOrder) {
      return NextResponse.json(
        {
          error: "Verification failed",
          details: `The email or phone provided does not match records for order ${cleanOrderNum}.`,
          requiresVerification: true,
        },
        { status: 401 }
      );
    }

    // Map order to journey payload
    const journey = mapShopifyOrderToJourney(matchedOrder);

    return NextResponse.json({
      ok: true,
      journey,
    });
  } catch (error) {
    console.error("Error looking up Shopify order:", error);
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Internal server error looking up order", details: msg },
      { status: 500 }
    );
  }
}
