import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/server";
import { planFromPriceId, type PlanId } from "@/lib/plans";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!sig || !secret) {
    return NextResponse.json({ error: "Webhook non configurato" }, { status: 400 });
  }

  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, secret);
  } catch (err: any) {
    return NextResponse.json({ error: `Signature invalid: ${err.message}` }, { status: 400 });
  }

  const supabase = createAdminClient();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const orgId = session.metadata?.organization_id;
        if (orgId && session.subscription) {
          const sub = await stripe.subscriptions.retrieve(session.subscription as string);
          await upsertSubscription(supabase, orgId, sub);
        }
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const orgId = sub.metadata?.organization_id;
        if (orgId) {
          await upsertSubscription(supabase, orgId, sub);
        }
        break;
      }
      case "invoice.payment_failed": {
        const inv = event.data.object as Stripe.Invoice;
        const customerId = inv.customer as string;
        await supabase
          .from("subscriptions")
          .update({ status: "past_due" })
          .eq("stripe_customer_id", customerId);
        break;
      }
    }
  } catch (err: any) {
    console.error("[stripe webhook] handler error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

async function upsertSubscription(supabase: any, orgId: string, sub: Stripe.Subscription) {
  const item = sub.items.data[0];
  const priceId = item?.price?.id;
  const mapped = priceId ? planFromPriceId(priceId) : null;

  const planId: PlanId = mapped?.plan || "free";
  const cadence = mapped?.cadence || null;

  await supabase
    .from("subscriptions")
    .upsert(
      {
        organization_id: orgId,
        stripe_customer_id: sub.customer as string,
        stripe_subscription_id: sub.id,
        stripe_price_id: priceId || null,
        plan: planId,
        cadence,
        status: sub.status as any,
        trial_end: sub.trial_end ? new Date(sub.trial_end * 1000).toISOString() : null,
        current_period_end: sub.current_period_end ? new Date(sub.current_period_end * 1000).toISOString() : null,
        cancel_at_period_end: sub.cancel_at_period_end ?? false,
      },
      { onConflict: "organization_id" },
    );
}
