import Link from "next/link";
import { Bot, Plus, AlertTriangle, ShieldCheck } from "lucide-react";
import { requireActiveOrg } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RISK_LABELS, type AIRisk } from "@/lib/aiact/classifier";
import { formatDate } from "@/lib/utils";

export default async function AIRegistryPage({
  params,
}: {
  params: Promise<{ orgId: string }>;
}) {
  const { orgId } = await params;
  const { supabase } = await requireActiveOrg(orgId);

  const { data: systems } = await supabase
    .from("ai_systems")
    .select("id, name, vendor, purpose, org_role, risk_class, status, updated_at, is_gpai")
    .eq("organization_id", orgId)
    .order("updated_at", { ascending: false });

  const counts = {
    prohibited: 0,
    high: 0,
    limited: 0,
    minimal: 0,
    gpai: 0,
  } as Record<AIRisk, number>;
  for (const s of systems || []) if (s.risk_class) counts[s.risk_class as AIRisk]++;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Bot className="h-6 w-6 text-violet-600" />
            <h1 className="text-2xl font-display font-bold">AI Act</h1>
          </div>
          <p className="text-muted-foreground">
            Inventario dei sistemi AI utilizzati e classificazione del rischio (Reg. UE 2024/1689).
          </p>
        </div>
        <Link href={`/dashboard/${orgId}/ai/new`}>
          <Button variant="gradient">
            <Plus className="h-4 w-4" /> Aggiungi sistema AI
          </Button>
        </Link>
      </div>

      {/* Alert per sistemi vietati */}
      {counts.prohibited > 0 && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-900">
              {counts.prohibited} {counts.prohibited === 1 ? "sistema rientra" : "sistemi rientrano"} tra le pratiche vietate (Art. 5).
            </p>
            <p className="text-sm text-red-800 mt-0.5">
              L'uso di questi sistemi è vietato nell'UE. Devono essere dismessi o riprogettati.
            </p>
          </div>
        </div>
      )}

      {/* Conteggi per rischio */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {(["prohibited", "high", "limited", "minimal", "gpai"] as const).map((r) => (
          <div key={r} className={`rounded-xl border p-4 ${RISK_LABELS[r].color}`}>
            <p className="text-2xl font-display font-bold">{counts[r]}</p>
            <p className="text-xs font-semibold uppercase tracking-wide mt-1">{RISK_LABELS[r].label}</p>
          </div>
        ))}
      </div>

      {/* Lista */}
      {!systems || systems.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center space-y-3">
            <Bot className="h-10 w-10 text-muted-foreground/40 mx-auto" />
            <p className="text-muted-foreground">
              Nessun sistema AI ancora registrato. Aggiungi il primo per iniziare la valutazione del rischio.
            </p>
            <Link href={`/dashboard/${orgId}/ai/new`}>
              <Button variant="gradient" size="sm">
                <Plus className="h-4 w-4" /> Aggiungi sistema AI
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {systems.map((s) => {
            const meta = s.risk_class ? RISK_LABELS[s.risk_class as AIRisk] : null;
            return (
              <Link
                key={s.id}
                href={`/dashboard/${orgId}/ai/${s.id}`}
                className="rounded-xl border bg-card p-4 hover:border-primary/40 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="h-10 w-10 rounded-lg bg-violet-100 text-violet-700 grid place-items-center shrink-0">
                      <Bot className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold truncate">{s.name}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {s.vendor ? `${s.vendor} · ` : ""}{s.purpose || "Nessuna finalità descritta"}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    {meta ? (
                      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${meta.color}`}>
                        {meta.label}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">Da classificare</span>
                    )}
                    <span className="text-xs text-muted-foreground">
                      Agg. {formatDate(s.updated_at)}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <div className="rounded-lg border bg-violet-50/40 p-4 flex items-start gap-3 text-sm">
        <ShieldCheck className="h-4 w-4 text-violet-600 shrink-0 mt-0.5" />
        <p className="text-muted-foreground">
          <strong className="text-foreground">Nota legale:</strong> il classificatore di AIComply fornisce un orientamento basato sulle risposte fornite. La valutazione finale, in particolare per sistemi ad alto rischio, richiede una revisione legale specialistica.
        </p>
      </div>
    </div>
  );
}
