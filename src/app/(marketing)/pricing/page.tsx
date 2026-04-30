import Link from "next/link";
import { CheckCircle2, Sparkles } from "lucide-react";
import { PLANS, PLAN_ORDER } from "@/lib/plans";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Prezzi" };

export default async function PricingPage({
  searchParams,
}: {
  searchParams: Promise<{ cadence?: string }>;
}) {
  const sp = await searchParams;
  const cadence: "monthly" | "yearly" = sp.cadence === "monthly" ? "monthly" : "yearly";

  return (
    <div className="container-wide py-16 sm:py-24">
      <div className="text-center max-w-2xl mx-auto space-y-3 mb-10">
        <Badge variant="secondary">
          <Sparkles className="h-3 w-3 mr-1.5 text-violet-600" />
          14 giorni di prova gratuita su tutti i piani
        </Badge>
        <h1 className="text-4xl sm:text-5xl font-display font-bold">
          <span className="gradient-text">Un piano</span> per ogni esigenza.
        </h1>
        <p className="text-muted-foreground">
          GDPR + AI Act inclusi in ogni piano. Inizia gratis, paghi solo se decidi di restare. Nessun vincolo.
        </p>
        <div className="inline-flex rounded-lg border p-0.5 bg-card text-sm mt-4">
          <Link
            href="/pricing?cadence=yearly"
            className={`px-4 py-1.5 rounded-md ${cadence === "yearly" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
          >
            Annuale <span className="opacity-80 text-xs">(–17%)</span>
          </Link>
          <Link
            href="/pricing?cadence=monthly"
            className={`px-4 py-1.5 rounded-md ${cadence === "monthly" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
          >
            Mensile
          </Link>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-7xl mx-auto">
        {PLAN_ORDER.filter((p) => p !== "free").map((id) => {
          const plan = PLANS[id];
          const price = cadence === "yearly" ? plan.yearly : plan.monthly;
          return (
            <div
              key={id}
              className={`rounded-2xl border bg-card p-6 flex flex-col ${
                plan.highlight ? "border-primary shadow-xl ring-1 ring-primary/30 lg:scale-105 relative z-10" : ""
              }`}
            >
              {plan.highlight && <Badge className="self-start mb-2">Più popolare</Badge>}
              <h2 className="text-xl font-display font-bold">{plan.name}</h2>
              <p className="text-sm text-muted-foreground mt-1">{plan.tagline}</p>
              <div className="mt-5">
                <span className="text-4xl font-display font-bold">{price}€</span>
                <span className="text-sm text-muted-foreground">/{cadence === "yearly" ? "anno" : "mese"}</span>
                {cadence === "yearly" && plan.monthly !== null && (
                  <p className="text-xs text-muted-foreground mt-1">Equivalente {(plan.yearly! / 12).toFixed(2)}€/mese</p>
                )}
              </div>
              <ul className="mt-5 space-y-2 text-sm flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Link href="/signup" className="mt-6">
                <Button className="w-full" size="lg" variant={plan.highlight ? "gradient" : "default"}>
                  Inizia 14 giorni gratis
                </Button>
              </Link>
            </div>
          );
        })}
      </div>

      <div className="mt-16 max-w-3xl mx-auto text-center space-y-3">
        <h3 className="font-display font-semibold text-xl">Hai un'agenzia o gestisci tanti clienti?</h3>
        <p className="text-muted-foreground">
          Il piano <strong>Enterprise / Agency</strong> ti consente di gestire aziende illimitate, con utenti multipli e un account manager dedicato. Scrivici per uno sconto su volumi grandi.
        </p>
        <Link href="mailto:vendite@aicomplyonline.it">
          <Button variant="outline" size="lg">Parla con un consulente</Button>
        </Link>
      </div>
    </div>
  );
}
