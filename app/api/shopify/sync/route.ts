// app/api/shopify/sync/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

interface ShopifyProductImageEdge {
  node: {
    url: string;
    altText?: string | null;
  };
}

interface ShopifyProductVariantEdge {
  node: {
    id: string;
    price: string;
    availableForSale: boolean;
  };
}

interface ShopifyProductNode {
  id: string;
  title: string;
  descriptionHtml: string;
  handle: string;
  status: string;
  priceRangeV2: {
    minVariantPrice: {
      amount: string;
      currencyCode: string;
    };
  };
  images: {
    edges: ShopifyProductImageEdge[];
  };
  variants: {
    edges: ShopifyProductVariantEdge[];
  };
}

interface ShopifyProductEdge {
  node: ShopifyProductNode;
}

interface ShopifyGraphQLResponse {
  data: {
    products: {
      pageInfo: {
        hasNextPage: boolean;
        endCursor: string | null;
      };
      edges: ShopifyProductEdge[];
    };
  };
  errors?: unknown;
}

const {
  NEXT_PUBLIC_SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
} = process.env;

// Shopify GraphQL query — fetches up to 250 products with images + pricing
const PRODUCTS_QUERY = `
  query getProducts($cursor: String) {
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
          priceRangeV2 {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          images(first: 1) {
            edges {
              node {
                url
                altText
              }
            }
          }
          variants(first: 1) {
            edges {
              node {
                id
                price
                availableForSale
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

    const supabase = createClient(
      NEXT_PUBLIC_SUPABASE_URL!,
      SUPABASE_SERVICE_ROLE_KEY!
    );

    // 1. Get the stored access token for this shop
    const { data: storeData, error: storeError } = await supabase
      .from("shopify_stores")
      .select("access_token")
      .eq("shop", shop)
      .single();

    if (storeError || !storeData) {
      return NextResponse.json(
        { error: "Shop not found or not installed" },
        { status: 404 }
      );
    }

    const { access_token } = storeData;

    // 2. Fetch all products from Shopify (handles pagination)
    let allProducts: ShopifyProductNode[] = [];
    let cursor: string | null = null;
    let hasNextPage = true;

    while (hasNextPage) {
      const res: Response = await fetch(
        `https://${shop}/admin/api/2024-01/graphql.json`,
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

      allProducts = [...allProducts, ...products.edges.map((e) => e.node)];
      hasNextPage = products.pageInfo.hasNextPage;
      cursor = products.pageInfo.endCursor;
    }

    // 3. Map Shopify product schema → existing product schema
    const mappedProducts = allProducts
      .filter((p) => p.status === "ACTIVE") // only sync active products
      .map((p) => ({
        shopify_id: p.id,                          // e.g. gid://shopify/Product/123
        name: p.title,
        description: stripHtml(p.descriptionHtml),
        price: parseFloat(
          p.variants.edges[0]?.node.price ??
          p.priceRangeV2.minVariantPrice.amount ??
          "0"
        ),
        currency: p.priceRangeV2.minVariantPrice.currencyCode,
        image_url: p.images.edges[0]?.node.url ?? null,
        url: `https://${shop}/products/${p.handle}`,
        available: p.variants.edges[0]?.node.availableForSale ?? false,
      }));

    // 4. Save to bots.ecommerce_products and link the store to the bot
    const { error: botError } = await supabase
      .from("bots")
      .update({ ecommerce_products: mappedProducts, ecommerce_enabled: true })
      .eq("id", bot_id);

    if (botError) {
      console.error("Supabase Bot update error:", botError);
      return NextResponse.json(
        { error: "Failed to save products to bot" },
        { status: 500 }
      );
    }

    // 5. Link this shop to the bot in shopify_stores table
    await supabase
      .from("shopify_stores")
      .update({ bot_id })
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

// Strips HTML tags from Shopify's descriptionHtml field
function stripHtml(html: string): string {
  return html?.replace(/<[^>]*>/g, "").trim() ?? "";
}
