import Stripe from "stripe";
import { getUserFromRequest } from "../../lib/auth";
import { getOrCreateSubscription } from "../../lib/subscription";

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

  const sub = await getOrCreateSubscription(user.id);

  if (!sub.stripe_customer_id) {
    return Response.json(
      { error: "No active subscription found" },
      { status: 400, headers: corsHeaders },
    );
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const session = await stripe.billingPortal.sessions.create({
    customer: sub.stripe_customer_id,
    return_url: `${appUrl}/admin/billing`,
  });

  return Response.json({ url: session.url }, { headers: corsHeaders });
}
