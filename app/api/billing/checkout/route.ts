import Stripe from "stripe";
import { getUserFromRequest } from "../../lib/auth";
import { getOrCreateSubscription } from "../../lib/subscription";
import { PLANS, PlanId } from "../../lib/plans";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

export async function POST(req: Request) {
  const user = await getUserFromRequest(req);
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401, headers: corsHeaders });
  }

  const { planId } = await req.json();
  const plan = PLANS[planId as PlanId];

  if (!plan || plan.id === "free" || !plan.priceId) {
    return Response.json({ error: "Invalid plan" }, { status: 400, headers: corsHeaders });
  }

  const sub = await getOrCreateSubscription(user.id);

  // Reuse existing Stripe customer or create one
  let customerId = sub.stripe_customer_id;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email!,
      metadata: { user_id: user.id },
    });
    customerId = customer.id;
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: plan.priceId, quantity: 1 }],
    success_url: `${appUrl}/admin/billing?success=true`,
    cancel_url: `${appUrl}/admin/billing?canceled=true`,
    metadata: { user_id: user.id, plan_id: planId },
    subscription_data: { metadata: { user_id: user.id, plan_id: planId } },
  });

  return Response.json({ url: session.url }, { headers: corsHeaders });
}
