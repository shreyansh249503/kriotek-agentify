export type PlanId = "free" | "growth" | "business" | "agency";

export interface Plan {
  id: PlanId;
  name: string;
  price: number;
  bots: number;               // -1 = unlimited
  messages: number;           // -1 = unlimited
  messagesPeriod: "daily" | "monthly";
  pages: number;              // crawled KB pages, -1 = unlimited
  priceId: string | null;
}

export const PLANS: Record<PlanId, Plan> = {
  free: {
    id: "free",
    name: "Starter",
    price: 0,
    bots: 1,
    messages: 30,
    messagesPeriod: "daily",
    pages: 20,
    priceId: null,
  },
  growth: {
    id: "growth",
    name: "Growth",
    price: 29,
    bots: 3,
    messages: 2000,
    messagesPeriod: "monthly",
    pages: 100,
    priceId: process.env.STRIPE_PRICE_GROWTH ?? null,
  },
  business: {
    id: "business",
    name: "Business",
    price: 79,
    bots: 10,
    messages: 10000,
    messagesPeriod: "monthly",
    pages: -1,
    priceId: process.env.STRIPE_PRICE_BUSINESS ?? null,
  },
  agency: {
    id: "agency",
    name: "Agency",
    price: 199,
    bots: -1,
    messages: -1,
    messagesPeriod: "monthly",
    pages: -1,
    priceId: process.env.STRIPE_PRICE_AGENCY ?? null,
  },
};

/** Derive plan from a Stripe price ID */
export function planFromPriceId(priceId: string): PlanId {
  for (const [id, plan] of Object.entries(PLANS)) {
    if (plan.priceId === priceId) return id as PlanId;
  }
  return "free";
}
