import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe";
import { getStripePriceId, type PlanId, type Cadence } from "@/lib/plans";

const schema = z.object({
  organization_id: z.string().uuid(),
  plan: z.enum(["pro", "enterprise"]),
  cadence: z.enum(["monthly", "yearly"]),
});

export async function POST(req: Request) {
  // Validazione environment a monte: meglio un errore chiaro che un crash
  // opaco quando la SECRET key non è settata o è il dummy di sviluppo.
  if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY === "sk_test_dummy") {
    return NextResponse.json(
      { error: "STRIPE_SECRET_KEY non configurata su Vercel. Aggiungi la secret key di Stripe (Settings → API → Secret key) e ridepoia." },
      { status: 500 },
    );
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non autenticato" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Dati non validi" }, { status: 400 });

  const { organization_id, plan, cadence } = parsed.data;

  // Verifica membership owner/admin
  const { data: member } = await supabase
    .from("org_members")
    .select("role")
    .eq("organization_id", organization_id)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!member || (member.role !== "owner" && member.role !== "admin")) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 403 });
  }

  const priceId = getStripePriceId(plan as PlanId, cadence as Cadence);
  if (!priceId) {
    return NextResponse.json(
      { error: `Price ID Stripe non configurato per ${plan}/${cadence}. Imposta STRIPE_PRICE_${plan.toUpperCase()}_${cadence.toUpperCase()} su Vercel.` },
      { status: 500 },
    );
  }
  if (!priceId.startsWith("price_")) {
    return NextResponse.json(
      { error: `Price ID malformato per ${plan}/${cadence}: deve iniziare con "price_". Valore attuale: "${priceId.slice(0, 20)}...". Controlla che su Vercel sia stato copiato solo l'ID (es. price_1ABC...) senza il prefisso "STRIPE_PRICE_xxx=".` },
      { status: 500 },
    );
  }

  try {
    // Recupera o crea customer
    const admin = createAdminClient();
    const { data: existingSub } = await admin
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("organization_id", organization_id)
      .maybeSingle();

    let customerId = existingSub?.stripe_customer_id || null;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email || undefined,
        metadata: { organization_id, user_id: user.id },
      });
      customerId = customer.id;
      await admin
        .from("subscriptions")
        .upsert(
          { organization_id, stripe_customer_id: customerId, plan: "free", status: "trialing" },
          { onConflict: "organization_id" },
        );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://aicomplyonline.it";
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      subscription_data: {
        trial_period_days: 14,
        metadata: { organization_id },
      },
      payment_method_collection: "always",
      allow_promotion_codes: true,
      success_url: `${appUrl}/dashboard/${organization_id}/settings/billing?status=success`,
      cancel_url: `${appUrl}/dashboard/${organization_id}/settings/billing?status=cancel`,
      metadata: { organization_id, plan, cadence },
      locale: "it",
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    // Logga l'errore completo per Vercel logs e ritorna un messaggio utile al client
    console.error("[stripe/checkout] failed", {
      organization_id,
      plan,
      cadence,
      priceId,
      type: err?.type,
      code: err?.code,
      message: err?.message,
    });

    const stripeMsg = err?.raw?.message || err?.message || "Errore sconosciuto";
    return NextResponse.json(
      { error: `Stripe: ${stripeMsg}` },
      { status: 500 },
    );
  }
}
