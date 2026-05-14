import { requireActiveOrg } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PLANS, PLAN_ORDER } from "@/lib/plans";
import { CheckoutButton } from "./checkout-button";
import { PortalButton } from "./portal-button";
import { CadenceSwitcher } from "./cadence-switcher";

export default async function BillingPage({
  params,
  searchParams,
}: {
  params: Promise<{ orgId: string }>;
  searchParams: Promise<{ cadence?: string; status?: string }>;
}) {
  const { orgId } = await params;
  const sp = await searchParams;
  const { supabase } = await requireActiveOrg(orgId);
  const cadence: "monthly" | "yearly" = sp.cadence === "monthly" ? "monthly" : "yearly";

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("plan, status, trial_end, current_period_end, cancel_at_period_end, cadence")
    .eq("organization_id", orgId)
    .maybeSingle();

  const currentPlan = subscription?.plan || "free";

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-display font-bold">Fatturazione & Piani</h1>
        <p className="text-muted-foreground">Gestisci il tuo abbonamento e i metodi di pagamento.</p>
      </div>

      {sp.status === "success" && (
        <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-4 text-sm text-emerald-800">
          Abbonamento attivato. Riceverai una conferma via email.
        </div>
      )}

      {/* Stato corrente */}
      <Card>
        <CardHeader>
          <CardTitle>Piano attivo</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-display font-bold">{PLANS[currentPlan].name}</p>
              <Badge variant={subscription?.status === "active" ? "success" : "secondary"}>
                {subscription?.status || "trialing"}
              </Badge>
            </div>
            {subscription?.trial_end && subscription.status === "trialing" && (
              <p className="text-sm text-muted-foreground mt-1">
                Trial fino al {new Date(subscription.trial_end).toLocaleDateString("it-IT")}.
              </p>
            )}
            {subscription?.current_period_end && (
              <p className="text-sm text-muted-foreground mt-1">
                Prossimo rinnovo: {new Date(subscription.current_period_end).toLocaleDateString("it-IT")}
                {subscription.cancel_at_period_end && " (cancellazione programmata)"}
              </p>
            )}
          </div>
          {subscription?.status && ["active", "trialing", "past_due"].includes(subscription.status) && (
            <PortalButton orgId={orgId} />
          )}
        </CardContent>
      </Card>

      {/* Piani */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Cambia piano</h2>
          <CadenceSwitcher orgId={orgId} value={cadence} />
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PLAN_ORDER.filter((p) => p !== "free").map((id) => {
            const plan = PLANS[id];
            const price = cadence === "yearly" ? plan.yearly : plan.monthly;
            const isCurrent = currentPlan === id;
            return (
              <div
                key={id}
                className={`rounded-xl border bg-card p-5 flex flex-col ${
                  plan.highlight ? "border-primary shadow-md ring-1 ring-primary/30" : ""
                }`}
              >
                {plan.highlight && (
                  <Badge className="self-start mb-2" variant="default">Più popolare</Badge>
                )}
                <h3 className="font-display font-bold text-lg">{plan.name}</h3>
                <p className="text-sm text-muted-foreground">{plan.tagline}</p>
                <div className="mt-3">
                  <span className="text-3xl font-display font-bold">{price ?? "—"}€</span>
                  <span className="text-sm text-muted-foreground">/{cadence === "yearly" ? "anno" : "mese"}</span>
                </div>
                <ul className="mt-4 space-y-1.5 text-sm flex-1">
                  {plan.features.slice(0, 5).map((f) => (
                    <li key={f} className="flex gap-2">
                      <span className="text-emerald-500 font-bold">✓</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-5">
                  {isCurrent ? (
                    <button disabled className="w-full h-10 rounded-lg border bg-muted text-muted-foreground text-sm cursor-default">
                      Piano attuale
                    </button>
                  ) : (
                    <CheckoutButton orgId={orgId} plan={id} cadence={cadence} highlight={plan.highlight} />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
