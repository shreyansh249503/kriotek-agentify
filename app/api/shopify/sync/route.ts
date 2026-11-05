import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/api/lib/supabase-admin";
import { verifySessionToken, getShopFromSession } from "../lib/verifySessionToken";
import { getUserFromRequest } from "../../lib/auth";
import { decryptToken } from "@/app/api/lib/crypto";
import { SHOPIFY_API_VERSION } from "@/lib/shopify/apiVersion";
import {
  fromGraphQLProduct,
  isProductActive,
  toBotProduct,
  type ShopifyGraphQLProductNode,
} from "@/lib/shopify/productMapper";
import { saveSyncedProducts } from "../lib/productWebhooks";

interface ShopifyGraphQLResponse {
  data: {
    shop?: { currencyCode?: string | null };
    products: {
      pageInfo: {
        hasNextPage: boolean;
        endCursor: string | null;
      };
      edges: { node: ShopifyGraphQLProductNode }[];
    };
  };
  errors?: unknown;
}

const PRODUCTS_QUERY = `
  query getProducts($cursor: String) {
    shop {
      currencyCode
    }
    products(first: 250, after: $cursor) {
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        node {
          id
          title
          descriptionHtml
          handle
          status
          updatedAt
          productType
          vendor
          tags
          options {
            name
            values
          }
          priceRangeV2 {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          images(first: 5) {
            edges {
              node {
                url
                altText
              }
            }
          }
          variants(first: 25) {
            edges {
              node {
                id
                title
                price
                availableForSale
                sku
                selectedOptions {
                  name
                  value
                }
              }
            }
          }
        }
      }
    }
  }
`;

export async function POST(req: NextRequest) {
  try {
    const { shop, bot_id } = await req.json();

    if (!shop || !bot_id) {
      return NextResponse.json(
        { error: "shop and bot_id are required" },
        { status: 400 }
      );
    }

    let authorizedShop: string | null = null;
    let authorizedViaShopifySession = false;
    const authHeader = req.headers.get("authorization");
    if (authHeader) {
      try {
        const session = verifySessionToken(authHeader);
        authorizedShop = getShopFromSession(session);
        authorizedViaShopifySession = Boolean(authorizedShop);
      } catch {}
    }

    if (!authorizedShop) {
      const user = await getUserFromRequest(req);
      if (user) {
        const { data: bot } = await supabaseAdmin
          .from("bots")
          .select("id")
          .eq("id", bot_id)
          .eq("user_id", user.id)
          .single();
        if (bot) authorizedShop = shop;
      }
    }

    if (!authorizedShop || authorizedShop !== shop) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: storeData, error: storeError } = await supabaseAdmin
      .from("shopify_stores")
      .select("access_token, bot_id")
      .eq("shop", shop)
      .single();

    if (storeError || !storeData) {
      return NextResponse.json(
        { error: "Shop not found or not installed" },
        { status: 404 }
      );
    }

    // A dashboard user only proves they own bot_id, not the shop, so they may only sync
    // a store already linked to that bot. Linking an unlinked store requires the shop's own session.
    if (!authorizedViaShopifySession && storeData.bot_id !== bot_id) {
      return NextResponse.json(
        { error: "Store is not linked to this bot" },
        { status: 403 }
      );
    }

    if (storeData.bot_id && storeData.bot_id !== bot_id) {
      return NextResponse.json(
        { error: "Store is associated with another bot" },
        { status: 403 }
      );
    }

    if (!storeData.bot_id) {
      await supabaseAdmin
        .from("shopify_stores")
        .update({ bot_id })
        .eq("shop", shop);
    }

    const access_token = decryptToken(storeData.access_token);

    // Webhooks that arrive while the sync is fetching are newer than what it fetched.
    const syncStartedAt = new Date();
    let allProducts: ShopifyGraphQLProductNode[] = [];
    let shopCurrency: string | null = null;
    let cursor: string | null = null;
    let hasNextPage = true;

    while (hasNextPage) {
      const res: Response = await fetch(
        `https://${shop}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Shopify-Access-Token": access_token,
          },
          body: JSON.stringify({
            query: PRODUCTS_QUERY,
            variables: { cursor },
          }),
        }
      );

      if (!res.ok) {
        return NextResponse.json(
          { error: "Shopify API call failed" },
          { status: 502 }
        );
      }

      const json = (await res.json()) as ShopifyGraphQLResponse;
      if (json.errors) {
        console.error("Shopify GraphQL errors:", json.errors);
        return NextResponse.json(
          { error: "Shopify GraphQL error", details: json.errors },
          { status: 502 }
        );
      }

      const { products } = json.data;
      shopCurrency = json.data.shop?.currencyCode || shopCurrency;

      allProducts = [...allProducts, ...products.edges.map((e) => e.node)];
      hasNextPage = products.pageInfo.hasNextPage;
      cursor = products.pageInfo.endCursor;
    }

    const mappedProducts = allProducts
      .map(fromGraphQLProduct)
      .filter(isProductActive)
      .map((p) => toBotProduct(p, { shop, currency: shopCurrency }));

    let saved;
    try {
      saved = await saveSyncedProducts({ shop, botId: bot_id, synced: mappedProducts, syncStartedAt });
    } catch (botError) {
      console.error("Bot product save error:", botError);
      return NextResponse.json(
        { error: "Failed to save products to bot" },
        { status: 500 }
      );
    }
    if (!saved) {
      return NextResponse.json({ error: "Bot not found" }, { status: 404 });
    }

    // The shop's currency is also what product webhooks use.
    await supabaseAdmin
      .from("shopify_stores")
      .update(shopCurrency ? { bot_id, currency: shopCurrency } : { bot_id })
      .eq("shop", shop);

    return NextResponse.json({
      success: true,
      synced: mappedProducts.length,
      products: mappedProducts,
    });
  } catch (e: unknown) {
    console.error("Error in sync route:", e);
    const errorMessage = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json(
      { error: "Internal server error", message: errorMessage },
      { status: 500 }
    );
  }
}

