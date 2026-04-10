import Stripe from "stripe";
import { getDb } from "../../lib/db";
import { Subscription } from "../../lib/entities";
import { planFromPriceId } from "../../lib/plans";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return Response.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch {
    return Response.json({ error: "Webhook signature verification failed" }, { status: 400 });
  }

  const db = await getDb();
  const repo = db.getRepository(Subscription);

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.mode !== "subscription") break;

      const userId = session.metadata?.user_id;
      const planId = session.metadata?.plan_id;
      if (!userId || !planId) break;

      await repo.upsert(
        {
          user_id: userId,
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: session.subscription as string,
          plan: planId,
          status: "active",
        },
        ["user_id"],
      );
      break;
    }

    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      const userId = sub.metadata?.user_id;
      if (!userId) break;

      const priceId = sub.items.data[0]?.price.id;
      const plan = priceId ? planFromPriceId(priceId) : undefined;

      await repo.update(
        { user_id: userId },
        {
          stripe_subscription_id: sub.id,
          status: sub.status,
          ...(plan ? { plan } : {}),
        },
      );
      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const userId = sub.metadata?.user_id;
      if (!userId) break;

      await repo.update(
        { user_id: userId },
        {
          plan: "free",
          status: "canceled",
          stripe_subscription_id: undefined,
          period_end: undefined,
        },
      );
      break;
    }

    case "invoice.paid": {
      // New billing period started — reset monthly message counter
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = invoice.customer as string;

      const sub = await repo.findOne({ where: { stripe_customer_id: customerId } });
      if (sub) {
        await repo.update(sub.id, {
          messages_this_period: 0,
          // invoice.period_end is the Unix timestamp of the end of this billing period
          period_end: new Date(invoice.period_end * 1000),
        });
      }
      break;
    }
  }

  return Response.json({ received: true });
}
