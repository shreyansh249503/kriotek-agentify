import { tool } from "ai";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import { lookupVerifiedOrder, MIN_PHONE_DIGITS } from "@/lib/shopify/orderLookup";
import type { OrderJourneyData } from "@/lib/shopify/shopifyOrderMapper";
import { decryptToken } from "../crypto";

/**
 * The lookup_shopify_order tool shared by the chat agents. Order details are only returned
 * when the customer's email or phone matches the order (see lookupVerifiedOrder).
 */
export function createOrderLookupTool(botId: string, successInstruction: (journey: OrderJourneyData) => string) {
  return tool({
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
          .eq("bot_id", botId)
          .single();

        if (storeErr || !storeData?.access_token || !storeData?.shop) {
          console.error("[lookup_shopify_order] Store not found for bot:", botId);
          return {
            error: "Shopify store integration is not configured for this assistant.",
          };
        }

        const result = await lookupVerifiedOrder({
          shop: storeData.shop,
          accessToken: decryptToken(storeData.access_token),
          orderNumber: order_number,
          email,
          phone,
        });

        switch (result.status) {
          case "verification_required":
            return {
              error: `Verification required. Ask the customer for the email address or phone number (at least ${MIN_PHONE_DIGITS} digits) used on the order, then call this tool again with it.`,
              requiresVerification: true,
            };
          case "not_found":
            return { error: `Order ${order_number} was not found.` };
          case "verification_failed":
            return {
              error: "Verification failed. The provided email or phone does not match order records.",
            };
          case "found": {
            const { journey } = result;
            return {
              success: true,
              orderNumber: journey.orderNumber,
              statusBadge: journey.statusBadge,
              statusDescription: journey.statusDescription,
              tagPayload: `[ORDER_JOURNEY_JSON:${JSON.stringify(journey)}]`,
              instruction: successInstruction(journey),
            };
          }
        }
      } catch (err) {
        console.error("[lookup_shopify_order] Unexpected error:", err);
        return {
          error: "An unexpected error occurred while fetching order details.",
        };
      }
    },
  });
}
