import { generateObject, streamText, tool } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import { Product, ProductVariant } from "@/types/bot";
import type { LeadDecision } from "./leadAgent";
import type { Bot } from "../entities";
import { mapShopifyOrderToJourney, RawShopifyOrderNode } from "@/lib/shopify/shopifyOrderMapper";

export type Message = {
  role: "user" | "assistant" | "system";
  content: string;
};

export interface CustomerRequirements {
  category?: string;
  subCategory?: string;
  brand?: string;
  color?: string;
  size?: string;
  style?: string;
  type?: string;
  material?: string;
  gender?: string;
  maxPrice?: number;
  minPrice?: number;
  features?: string[];
  useCase?: string;
  keywords?: string[];
  isShoppingIntent?: boolean;
}

export interface ScoredProduct {
  product: Product;
  score: number;
  matchedAttributes: string[];
  differingAttributes: Array<{
    attribute: string;
    requested: string;
    actual: string;
  }>;
  isExactMatch: boolean;
  isPartialMatch: boolean;
  matchRationale: string;
}

export interface SalesAgentOptions {
  messages: Message[];
  botConfig: Bot & { supported_languages?: string[] };
  leadDecision?: LeadDecision | null;
  websiteContext: string;
  isShopifyConnected?: boolean;
}

const CustomerRequirementsSchema = z.object({
  isShoppingIntent: z
    .boolean()
    .describe("Whether the user is searching for, asking about, or interested in products/purchasing"),
  category: z
    .string()
    .optional()
    .describe("General product category requested (e.g. Apparel, Electronics, Footwear, Skincare)"),
  subCategory: z
    .string()
    .optional()
    .describe("Specific item type (e.g. Hoodie, T-Shirt, Headphones, Smartwatch, Running Shoes)"),
  brand: z.string().optional().describe("Requested brand name"),
  color: z.string().optional().describe("Requested color (e.g. Black, White, Navy, Red)"),
  size: z.string().optional().describe("Requested size (e.g. S, M, L, XL, XXL, 10, 42, 64GB)"),
  style: z.string().optional().describe("Requested style or fit (e.g. Oversized, Slim Fit, Casual, Wireless)"),
  type: z.string().optional().describe("Product subtype or variant type"),
  material: z.string().optional().describe("Requested material (e.g. Cotton, Fleece, Leather, Stainless Steel)"),
  gender: z.string().optional().describe("Target gender or audience (e.g. Men, Women, Unisex, Kids)"),
  maxPrice: z.number().optional().describe("Maximum budget or price mentioned"),
  minPrice: z.number().optional().describe("Minimum price mentioned"),
  features: z
    .array(z.string())
    .optional()
    .describe("Specific features or attributes requested (e.g. Noise cancelling, Waterproof, Pockets)"),
  useCase: z
    .string()
    .optional()
    .describe("Intended use or scenario (e.g. Gym workout, Winter travel, Office work)"),
  keywords: z
    .array(z.string())
    .optional()
    .describe("Other descriptive keywords or search terms from user"),
});

/**
 * Extracts structured customer requirements from the conversation history using Gemini.
 */
export async function extractCustomerRequirements(
  messages: Message[],
): Promise<CustomerRequirements> {
  const conversationText = messages
    .filter((m) => m.role === "user" || m.role === "assistant")
    .map((m) => `${m.role === "user" ? "USER" : "ASSISTANT"}: ${m.content}`)
    .join("\n\n");

  try {
    const modelName = process.env.GEMINI_MODEL || "gemini-2.5-flash-lite";
    const { object } = await generateObject({
      model: google(modelName),
      schema: CustomerRequirementsSchema,
      prompt: `Analyze the conversation history and extract the customer's shopping requirements and preferences.
Extract specific attributes like category, color, size, style, material, brand, budget, and use-case if mentioned.

Conversation History:
${conversationText}

Extract the customer's requirements accurately. If an attribute was not mentioned, leave it undefined.`,
    });

    return object;
  } catch (err) {
    console.error("[salesAgent] Error extracting customer requirements:", err);
    return { isShoppingIntent: true };
  }
}

/**
 * Helper to parse a price string or number into a numeric value.
 */
function parsePrice(price: string | number | undefined): number | null {
  if (typeof price === "number") return price;
  if (!price) return null;
  const match = String(price).replace(/,/g, "").match(/(\d+(\.\d+)?)/);
  return match ? parseFloat(match[0]) : null;
}

/**
 * Helper to test string array or string value matches.
 */
function matchesValue(
  fieldValue: string | string[] | undefined,
  target: string | undefined,
): boolean {
  if (!fieldValue || !target) return false;
  const targetLower = target.trim().toLowerCase();
  if (Array.isArray(fieldValue)) {
    return fieldValue.some((v) =>
      String(v).toLowerCase().includes(targetLower) ||
      targetLower.includes(String(v).toLowerCase()),
    );
  }
  const fieldLower = String(fieldValue).toLowerCase();
  return fieldLower.includes(targetLower) || targetLower.includes(fieldLower);
}

/**
 * Scores and ranks candidate products against extracted customer requirements.
 * Performs deep matching on category, color, size, style, material, brand, budget, and specs.
 */
export function matchAndRankProducts(
  products: Product[],
  reqs: CustomerRequirements,
): ScoredProduct[] {
  if (!products || products.length === 0) return [];

  const scored: ScoredProduct[] = [];

  for (const product of products) {
    let score = 0;
    const matchedAttrs: string[] = [];
    const differingAttrs: Array<{ attribute: string; requested: string; actual: string }> = [];

    const meta = product.metadata || {};
    const variants: ProductVariant[] = product.variants || [];
    const pName = (product.name || "").toLowerCase();
    const pDesc = (product.description || "").toLowerCase();
    const pCategory = (product.category || "").toLowerCase();
    const pSubCategory = (product.subCategory || "").toLowerCase();
    const pBrand = (product.brand || meta.brand || "").toLowerCase();

    // 1. Category / Subcategory Matching (High Importance)
    const targetCategory = (reqs.subCategory || reqs.category || "").toLowerCase();
    if (targetCategory) {
      const isCatMatch =
        pCategory.includes(targetCategory) ||
        targetCategory.includes(pCategory) ||
        pSubCategory.includes(targetCategory) ||
        targetCategory.includes(pSubCategory) ||
        pName.includes(targetCategory) ||
        matchesValue(meta.type, targetCategory) ||
        matchesValue(meta.tags, targetCategory);

      if (isCatMatch) {
        score += 35;
        matchedAttrs.push(`Category: ${reqs.subCategory || reqs.category}`);
      } else {
        differingAttrs.push({
          attribute: "Category",
          requested: reqs.subCategory || reqs.category || "",
          actual: product.category || product.name,
        });
      }
    }

    // 2. Color Matching
    if (reqs.color) {
      const targetColor = reqs.color.toLowerCase();
      const variantColors = variants.map((v) => v.color).filter(Boolean) as string[];
      const isColorMatch =
        matchesValue(meta.color, targetColor) ||
        variantColors.some((c) => c.toLowerCase().includes(targetColor)) ||
        pName.includes(targetColor) ||
        pDesc.includes(targetColor);

      if (isColorMatch) {
        score += 20;
        matchedAttrs.push(`Color: ${reqs.color}`);
      } else {
        const actualColor =
          (Array.isArray(meta.color) ? meta.color.join(", ") : meta.color) ||
          variantColors.join(", ") ||
          "Other color";
        differingAttrs.push({
          attribute: "Color",
          requested: reqs.color,
          actual: actualColor,
        });
      }
    }

    // 3. Size Matching
    if (reqs.size) {
      const targetSize = reqs.size.toLowerCase();
      const variantSizes = variants.map((v) => v.size).filter(Boolean) as string[];
      const isSizeMatch =
        matchesValue(meta.size, targetSize) ||
        variantSizes.some((s) => s.toLowerCase() === targetSize || s.toLowerCase().includes(targetSize)) ||
        pName.includes(` ${targetSize} `) ||
        pName.endsWith(` ${targetSize}`) ||
        pDesc.includes(`size ${targetSize}`) ||
        pDesc.includes(`size: ${targetSize}`);

      if (isSizeMatch) {
        score += 20;
        matchedAttrs.push(`Size: ${reqs.size}`);
      } else {
        const actualSize =
          (Array.isArray(meta.size) ? meta.size.join(", ") : meta.size) ||
          variantSizes.join(", ") ||
          "Other size";
        differingAttrs.push({
          attribute: "Size",
          requested: reqs.size,
          actual: actualSize,
        });
      }
    }

    // 4. Style / Fit Matching (e.g. Oversized, Slim fit, Wireless)
    if (reqs.style) {
      const targetStyle = reqs.style.toLowerCase();
      const variantStyles = variants.map((v) => v.style).filter(Boolean) as string[];
      const isStyleMatch =
        matchesValue(meta.style, targetStyle) ||
        variantStyles.some((s) => s.toLowerCase().includes(targetStyle)) ||
        pName.includes(targetStyle) ||
        pDesc.includes(targetStyle);

      if (isStyleMatch) {
        score += 15;
        matchedAttrs.push(`Style: ${reqs.style}`);
      } else {
        const actualStyle =
          (Array.isArray(meta.style) ? meta.style.join(", ") : meta.style) ||
          variantStyles.join(", ") ||
          "Standard fit/style";
        differingAttrs.push({
          attribute: "Style",
          requested: reqs.style,
          actual: actualStyle,
        });
      }
    }

    // 5. Material Matching
    if (reqs.material) {
      const targetMaterial = reqs.material.toLowerCase();
      const specMat = meta.specifications
        ? Object.entries(meta.specifications)
            .filter(([k]) => k.includes("material") || k.includes("fabric") || k.includes("made of"))
            .map(([, v]) => String(v).toLowerCase())
            .join(" ")
        : "";
      const isMaterialMatch =
        matchesValue(meta.material, targetMaterial) ||
        pDesc.includes(targetMaterial) ||
        pName.includes(targetMaterial) ||
        specMat.includes(targetMaterial);

      if (isMaterialMatch) {
        score += 15;
        matchedAttrs.push(`Material: ${reqs.material}`);
      } else {
        const actualMat =
          (Array.isArray(meta.material) ? meta.material.join(", ") : meta.material) || "Standard material";
        differingAttrs.push({
          attribute: "Material",
          requested: reqs.material,
          actual: actualMat,
        });
      }
    }

    // 6. Brand Matching
    if (reqs.brand) {
      const targetBrand = reqs.brand.toLowerCase();
      const isBrandMatch =
        pBrand.includes(targetBrand) ||
        targetBrand.includes(pBrand) ||
        pName.includes(targetBrand);

      if (isBrandMatch) {
        score += 15;
        matchedAttrs.push(`Brand: ${reqs.brand}`);
      } else {
        differingAttrs.push({
          attribute: "Brand",
          requested: reqs.brand,
          actual: product.brand || meta.brand || "In-house brand",
        });
      }
    }

    // 7. Budget / Price Filtering
    const numericPrice = parsePrice(product.price);
    if (numericPrice !== null) {
      if (reqs.maxPrice !== undefined) {
        if (numericPrice <= reqs.maxPrice) {
          score += 10;
          matchedAttrs.push(`Within budget: ${product.price}`);
        } else {
          differingAttrs.push({
            attribute: "Price",
            requested: `Under ${reqs.maxPrice}`,
            actual: `${product.price}`,
          });
        }
      }
    }

    // 8. Specific Features or Use Case Keywords
    if (reqs.features && reqs.features.length > 0) {
      for (const feat of reqs.features) {
        const featLower = feat.toLowerCase();
        const featMatched =
          matchesValue(meta.features, featLower) ||
          pDesc.includes(featLower) ||
          pName.includes(featLower);
        if (featMatched) {
          score += 5;
          matchedAttrs.push(`Feature: ${feat}`);
        }
      }
    }

    // 9. Availability / In Stock Boost
    const isAvailable = product.available !== false && meta.inStock !== false;
    if (isAvailable) {
      score += 5;
    }

    const hasRequests = Boolean(
      reqs.category ||
      reqs.subCategory ||
      reqs.color ||
      reqs.size ||
      reqs.style ||
      reqs.material ||
      reqs.brand ||
      reqs.maxPrice,
    );

    // If user made specific requests, exact match requires all specified attributes to match
    const isExactMatch = hasRequests && differingAttrs.length === 0 && matchedAttrs.length > 0;
    const isPartialMatch = hasRequests && matchedAttrs.length > 0 && differingAttrs.length > 0;

    let matchRationale = "";
    if (isExactMatch) {
      matchRationale = `Exact match for all requirements: ${matchedAttrs.join(", ")}.`;
    } else if (isPartialMatch) {
      const diffStr = differingAttrs
        .map((d) => `${d.attribute} is ${d.actual} (requested ${d.requested})`)
        .join(", ");
      matchRationale = `Matches ${matchedAttrs.join(", ")}, but ${diffStr}.`;
    } else {
      matchRationale = "General catalog recommendation.";
    }

    scored.push({
      product,
      score,
      matchedAttributes: matchedAttrs,
      differingAttributes: differingAttrs,
      isExactMatch,
      isPartialMatch,
      matchRationale,
    });
  }

  // Sort highest score first
  return scored.sort((a, b) => b.score - a.score);
}

/**
 * Builds the comprehensive sales system prompt for Gemini.
 */
export function buildSalesSystemPrompt(
  config: {
    companyName: string;
    companyDescription: string;
    tone?: "friendly" | "professional";
    supportedLanguages?: string[];
    ecommercePrompt?: string | null;
    shopifyEnabled?: boolean;
  },
  context: { websiteContext: string },
  contactState?: {
    collected: { name?: string; email?: string; phone?: string };
    missingFields: ("name" | "email")[];
    isComplete: boolean;
  },
  reqs?: CustomerRequirements,
  rankedProducts?: ScoredProduct[],
  allProducts?: Product[],
): string {
  const tone = config.tone ?? "friendly";
  const languageSection = config.supportedLanguages?.length
    ? `Supported languages: ${config.supportedLanguages.join(", ")}`
    : "Detect and match the user's language automatically";

  const isContactPending = contactState && !contactState.isComplete;

  // Format top recommended products (show all matching products up to 15)
  const matchingRanked = (rankedProducts || []).filter(
    (sp) => sp.matchedAttributes.length > 0 || sp.score > 0,
  );
  const topProducts = (matchingRanked.length > 0 ? matchingRanked : (rankedProducts || [])).slice(0, 15);
  const normalizedRecommendations = topProducts.map((sp) => ({
    name: sp.product.name,
    price: String(sp.product.price),
    image: sp.product.image || sp.product.image_url || "",
    url: sp.product.url,
    description: sp.product.description || "",
    score: sp.score,
    isExactMatch: sp.isExactMatch,
    isPartialMatch: sp.isPartialMatch,
    matchedAttributes: sp.matchedAttributes,
    differingAttributes: sp.differingAttributes,
    matchRationale: sp.matchRationale,
  }));

  const recommendationsJson = JSON.stringify(normalizedRecommendations, null, 2);

  const fullCatalogJson = JSON.stringify(
    (allProducts || []).map((p) => ({
      name: p.name,
      price: String(p.price),
      image: p.image || p.image_url || "",
      url: p.url,
      description: p.description || "",
      category: p.category || p.metadata?.type,
      brand: p.brand || p.metadata?.brand,
      metadata: p.metadata,
      variants: p.variants,
    })),
    null,
    2,
  );

  const reqsSummary = reqs
    ? Object.entries(reqs)
        .filter(([, v]) => v !== undefined && v !== null && v !== false)
        .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
        .join("\n")
    : "General browsing / shopping inquiry";

  return `You are an expert, confident, and consultative Sales Specialist for ${config.companyName}.
Your goal is to understand what the customer needs, recommend all relevant matching products from your catalog using complete product metadata, and provide consultative advice that helps them make a confident purchase.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ABOUT ${config.companyName.toUpperCase()}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${config.companyDescription}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TONE & STYLE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${
  tone === "friendly"
    ? "Warm, enthusiastic, consultative, conversational — like an attentive sales expert who knows the product catalog inside out."
    : "Professional, knowledgeable, refined, clear and precise."
}
${languageSection}

FORMATTING — CRITICAL, FOLLOW EXACTLY:
- Plain text ONLY. No markdown symbols whatsoever (no asterisks, no hash headers).
- NEVER use bullet points of any kind: no hyphens (-), no dots (•), no asterisks (*), no dashes
- Write in natural flowing prose and short paragraphs
- Use line breaks between paragraphs for readability
- Keep responses engaging, consultative, and concise (2 to 4 short paragraphs)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CUSTOMER REQUIREMENTS IDENTIFIED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${reqsSummary}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RANKED PRODUCT MATCHES & METADATA ANALYSIS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${recommendationsJson}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
COMPLETE PRODUCT CATALOG
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${fullCatalogJson}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SALES & RECOMMENDATION RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. UNDERSTAND & CONSULT: In your conversational response, introduce the available matching options and explain why they fit the customer's request. You can highlight key styles/colors/prints.

2. EXACT MATCHES: If exact matches are available for their requested attributes (e.g. material, category, style), present all matching options and highlight their benefits.

3. PARTIAL MATCHES & TRANSPARENT EXPLANATION: If an exact match is NOT available, present the closest matching options and CLEARLY EXPLAIN the difference in natural conversational prose.

4. CLARIFYING QUESTIONS: If the customer's request is broad (e.g. "Do you have cotton tshirts"), present all matching options in the carousel and ask 1 natural question to help them narrow down their choice (e.g. fit, style, or color preference).

5. COMPLETE VISUAL PRODUCT CAROUSEL: Whenever recommending products, YOU MUST OUTPUT A VISUAL PRODUCT CAROUSEL at the end of your pitch containing ALL matching products from the ranked list (or up to 10-12 matching products) using this exact XML format:
<product-carousel>
[
  {
    "name": "Product Name",
    "price": "Product Price",
    "image": "URL of product image",
    "url": "Product details checkout link"
  }
]
</product-carousel>

6. STRICT CATALOG GROUNDING: ONLY include products in the <product-carousel> that exist in the CATALOG above. NEVER make up products, prices, images, or links.

7. PROSE ONLY: Output the <product-carousel> block after your natural language response. Do not put markdown inside the block, only valid JSON.

${
  isContactPending
    ? `8. CONTACT COLLECTION: Contact collection is still pending (Still need: ${contactState?.missingFields.join(" then ")}). Answer their product questions, provide the recommendations with <product-carousel>, and naturally invite them to share their ${contactState?.missingFields[0]} so the team can follow up with exclusive discounts or order assistance.`
    : ""
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WEBSITE KNOWLEDGE CONTEXT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${context.websiteContext}
`;
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

/**
 * Runs the dedicated Sales Agent pipeline:
 * 1. Extracts customer requirements
 * 2. Matches & ranks products using deep metadata
 * 3. Builds sales prompt with match rationales and partial match explanations
 * 4. Streams Gemini response with live tools
 */
export async function runSalesAgent({
  messages,
  botConfig,
  leadDecision,
  websiteContext,
  isShopifyConnected = false,
}: SalesAgentOptions) {
  const contactState = leadDecision
    ? {
        collected: leadDecision.collectedInfo,
        missingFields: leadDecision.missingFields,
        isComplete: leadDecision.isComplete,
      }
    : undefined;

  const products = botConfig.ecommerce_products || [];

  // Step 1: Extract structured customer requirements
  const reqs = await extractCustomerRequirements(messages);

  // Step 2: Score and rank products with deep metadata matching
  const ranked = matchAndRankProducts(products, reqs);

  // Step 3: Build sales system prompt
  const systemPrompt = buildSalesSystemPrompt(
    {
      companyName: botConfig.name,
      companyDescription: botConfig.description || "",
      tone: botConfig.tone as "friendly" | "professional" | undefined,
      supportedLanguages: botConfig.supported_languages,
      ecommercePrompt: botConfig.ecommerce_prompt,
      shopifyEnabled: isShopifyConnected,
    },
    { websiteContext },
    contactState,
    reqs,
    ranked,
    products,
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
              const supabase = createClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.SUPABASE_SERVICE_ROLE_KEY!,
              );

              const { data: storeData, error: storeErr } = await supabase
                .from("shopify_stores")
                .select("shop, access_token")
                .eq("bot_id", botConfig.id)
                .single();

              if (storeErr || !storeData?.access_token || !storeData?.shop) {
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
                  },
                );

                if (!response.ok) return [];
                const resJson = await response.json();
                return resJson?.data?.orders?.edges ?? [];
              };

              let queryStr = `name:"${searchName}" OR name:"${rawNum}" OR "${rawNum}"`;
              if (targetEmail) queryStr += ` OR email:"${targetEmail}"`;

              let orderEdges = await fetchOrdersFromShopify(queryStr);
              if (orderEdges.length === 0) {
                orderEdges = await fetchOrdersFromShopify(rawNum);
              }
              if (orderEdges.length === 0) {
                orderEdges = await fetchOrdersFromShopify();
              }
              if (orderEdges.length === 0) {
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

                const hasAnyContact = Boolean(
                  orderTopEmail || orderCustomerEmail || orderTopPhone || orderCustomerPhone || orderShippingPhone,
                );

                let isContactMatch = false;
                if (!hasAnyContact) {
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
                  if (!targetEmail && !targetPhone) isContactMatch = true;
                }

                if (isContactMatch) {
                  matchedOrder = node;
                  break;
                }
              }

              if (!matchedOrder) {
                return {
                  error: "Verification failed. The provided email or phone does not match order records.",
                };
              }

              const journey = mapShopifyOrderToJourney(matchedOrder);
              const tagString = `[ORDER_JOURNEY_JSON:${JSON.stringify(journey)}]`;

              return {
                success: true,
                orderNumber: journey.orderNumber,
                statusBadge: journey.statusBadge,
                statusDescription: journey.statusDescription,
                tagPayload: tagString,
                instruction: `Write a warm, friendly 1-sentence status summary for order ${journey.orderNumber}.`,
              };
            } catch (err) {
              console.error("[lookup_shopify_order error]", err);
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
    ...(tools ? { tools, stopWhen: ({ steps }) => steps.length >= 5 } : {}),
  });
}
