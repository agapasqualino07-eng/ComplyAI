import Link from "next/link";
import {
  ArrowRight,
  Bot,
  FileText,
  GraduationCap,
  Bell,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";
import { requireActiveOrg } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { recomputeScore } from "@/lib/compliance";

type Breakdown = {
  final?: number;
  reason?: string;
  message?: string;
  prohibited_systems?: number;
  areas?: {
    a_identification?: { score: number; max: number; systems: number };
    c_literacy?: { score: number; max: number; trained: number; declared_employees: number; ratio: number };
    d_transparency?: { score: number; max: number; requiring: number; covered: number };
    e_high_risk?: { score: number; max: number; requiring: number; with_oversight: number };
    f_law_132?: { score: number; max: number; employee_notice_published: boolean };
    g_governance?: { score: number; max: number; policy_published: boolean; registry_published: boolean };
  };
};

export default async function OverviewPage({ params }: { params: Promise<{ orgId: string }> }) {
  const { orgId } = await params;
  const { org, supabase } = await requireActiveOrg(orgId);

  // Se il breakdown è vuoto (es. dopo migration 0008), forza un primo ricalcolo
  if (!org.compliance_breakdown || Object.keys(org.compliance_breakdown).length === 0) {
    await recomputeScore(orgId);
  }

  // Rileggi gli ultimi valori (compliance_score + breakdown) dopo l'eventuale ricalcolo
  const { data: fresh } = await supabase
    .from("organizations")
    .select("compliance_score, compliance_breakdown")
    .eq("id", orgId)
    .single();

  const score: number = fresh?.compliance_score ?? org.compliance_score ?? 0;
  const breakdown: Breakdown = (fresh?.compliance_breakdown as Breakdown) ?? {};
  const isProhibited = breakdown.reason === "prohibited_practice_detected";

  const [
    { count: aiCount },
    { count: prohibitedCount },
    { count: signedDocsCount },
    { count: docsCount },
    { count: trainingCount },
    { count: alertsCount },
  ] = await Promise.all([
    supabase.from("ai_systems").select("id", { count: "exact", head: true }).eq("organization_id", orgId),
    supabase.from("ai_systems").select("id", { count: "exact", head: true }).eq("organization_id", orgId).eq("category", "vietato"),
    supabase.from("documents").select("id", { count: "exact", head: true }).eq("organization_id", orgId).not("published_at", "is", null),
    supabase.from("documents").select("id", { count: "exact", head: true }).eq("organization_id", orgId),
    supabase.from("training_records").select("id", { count: "exact", head: true }).eq("organization_id", orgId),
    supabase.from("alerts").select("id", { count: "exact", head: true }),
  ]);

  const setupSteps = [
    { done: (aiCount ?? 0) > 0, label: "Mappa i sistemi AI usati in azienda", href: `/dashboard/${orgId}/ai/new` },
    {
      done: (breakdown.areas?.f_law_132?.score ?? 0) === 20,
      label: "Genera e firma l'Informativa Art. 11 ai dipendenti",
      href: `/dashboard/${orgId}/documents/new?type=ai_employee_notice`,
    },
    {
      done: (breakdown.areas?.g_governance?.policy_published ?? false),
      label: "Genera la Policy interna sull'uso dell'IA",
      href: `/dashboard/${orgId}/documents/new?type=ai_use_policy`,
    },
    {
      done: (breakdown.areas?.c_literacy?.ratio ?? 0) >= 0.5,
      label: "Forma almeno metà dei dipendenti (AI Literacy Art. 4)",
      href: `/dashboard/${orgId}/training`,
    },
  ];
  const doneSteps = setupSteps.filter((s) => s.done).length;
  const progress = Math.round((doneSteps / setupSteps.length) * 100);

  const scoreLabel =
    isProhibited ? "Critico: pratica vietata rilevata" :
    score >= 80 ? "Eccellente — sei a norma" :
    score >= 60 ? "Buon livello — qualche passo manca" :
    score >= 30 ? "Attenzione: lacune importanti" :
    "Critico: agisci subito sui passi qui sotto";

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <p className="text-sm text-muted-foreground">Benvenuto</p>
        <h1 className="text-2xl sm:text-3xl font-display font-bold">{org.name}</h1>
        <p className="text-muted-foreground mt-1">Stato di compliance AI Act + L. 132/2025</p>
      </div>

      {/* Compliance score */}
      <Card className="overflow-hidden">
        <div className={`text-white p-6 grid sm:grid-cols-2 gap-4 items-center ${isProhibited ? "bg-gradient-to-br from-red-700 via-red-600 to-rose-700" : "bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-700"}`}>
          <div>
            <p className="text-sm opacity-80 uppercase tracking-wide">Score di compliance</p>
            <p className="text-6xl font-display font-bold mt-1">
              {score}
              <span className="text-2xl opacity-70">/100</span>
            </p>
            <p className="text-sm opacity-90 mt-2">{scoreLabel}</p>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <Stat label="Sistemi AI" value={aiCount ?? 0} />
            <Stat label="Documenti firmati" value={`${signedDocsCount ?? 0} / ${docsCount ?? 0}`} />
            <Stat label="Formazioni" value={trainingCount ?? 0} />
            <Stat label="Alert attivi" value={alertsCount ?? 0} />
          </div>
        </div>
      </Card>

      {/* Critical: prohibited */}
      {(prohibitedCount ?? 0) > 0 && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-900">
              {prohibitedCount} {prohibitedCount === 1 ? "sistema rientra" : "sistemi rientrano"} tra le pratiche vietate (Art. 5 AI Act)
            </p>
            <p className="text-sm text-red-800 mt-0.5">
              Sanzione fino a 35M€ o 7% del fatturato. Dismetti o riprogetta subito. Lo score resta a 0 finché il sistema vietato è registrato.
            </p>
            <Link href={`/dashboard/${orgId}/ai`} className="inline-block mt-2 text-sm font-medium text-red-700 underline">
              Vai al registro IA →
            </Link>
          </div>
        </div>
      )}

      {/* Breakdown per area — solo se non in stato "prohibited" */}
      {!isProhibited && breakdown.areas && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Punteggio per area AI Act</CardTitle>
            <CardDescription>
              Ogni area ha un peso massimo. Clicca le voci per agire sui punti aperti.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="divide-y">
              <AreaRow
                title="Identificazione sistemi AI"
                ref_="Reg. UE 2024/1689, registro art. 50/Annex VIII"
                score={breakdown.areas.a_identification?.score ?? 0}
                max={breakdown.areas.a_identification?.max ?? 10}
                detail={`${breakdown.areas.a_identification?.systems ?? 0} sistemi mappati`}
                href={`/dashboard/${orgId}/ai`}
              />
              <AreaRow
                title="AI Literacy dei dipendenti"
                ref_="AI Act Art. 4 — Alfabetizzazione AI"
                score={breakdown.areas.c_literacy?.score ?? 0}
                max={breakdown.areas.c_literacy?.max ?? 20}
                detail={`${breakdown.areas.c_literacy?.trained ?? 0} formati / ${breakdown.areas.c_literacy?.declared_employees ?? 0} dipendenti dichiarati (${Math.round((breakdown.areas.c_literacy?.ratio ?? 0) * 100)}%)`}
                href={`/dashboard/${orgId}/training`}
              />
              <AreaRow
                title="Trasparenza per chatbot/contenuti AI"
                ref_="AI Act Art. 50 — Obblighi di trasparenza"
                score={breakdown.areas.d_transparency?.score ?? 0}
                max={breakdown.areas.d_transparency?.max ?? 15}
                detail={
                  (breakdown.areas.d_transparency?.requiring ?? 0) === 0
                    ? "Non applicabile (nessun sistema limited/gpai)"
                    : `${breakdown.areas.d_transparency?.covered ?? 0} di ${breakdown.areas.d_transparency?.requiring} sistemi con disclosure pubblicata`
                }
                href={`/dashboard/${orgId}/documents/new?type=ai_disclosure`}
              />
              <AreaRow
                title="Obblighi sistemi alto rischio"
                ref_="AI Act Capo III — Annex III"
                score={breakdown.areas.e_high_risk?.score ?? 0}
                max={breakdown.areas.e_high_risk?.max ?? 25}
                detail={
                  (breakdown.areas.e_high_risk?.requiring ?? 0) === 0
                    ? "Non applicabile (nessun sistema alto rischio)"
                    : `${breakdown.areas.e_high_risk?.with_oversight ?? 0} di ${breakdown.areas.e_high_risk?.requiring} sistemi alto rischio con human oversight definito`
                }
                href={`/dashboard/${orgId}/ai`}
              />
              <AreaRow
                title="Legge 132/2025 — Informativa dipendenti"
                ref_="L. 132/2025 Art. 11"
                score={breakdown.areas.f_law_132?.score ?? 0}
                max={breakdown.areas.f_law_132?.max ?? 20}
                detail={
                  breakdown.areas.f_law_132?.employee_notice_published
                    ? "Informativa pubblicata"
                    : "Informativa non ancora pubblicata"
                }
                href={`/dashboard/${orgId}/documents/new?type=ai_employee_notice`}
              />
              <AreaRow
                title="Governance interna"
                ref_="Policy uso AI + registro formale"
                score={breakdown.areas.g_governance?.score ?? 0}
                max={breakdown.areas.g_governance?.max ?? 10}
                detail={`${breakdown.areas.g_governance?.policy_published ? "Policy ✓" : "Policy ✗"} · ${breakdown.areas.g_governance?.registry_published ? "Registro ✓" : "Registro ✗"}`}
                href={`/dashboard/${orgId}/documents`}
              />
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Setup checklist */}
      {progress < 100 && !isProhibited && (
        <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-primary" /> Setup compliance AI Act
                </CardTitle>
                <CardDescription>Completa i passi essenziali per essere a norma.</CardDescription>
              </div>
              <Badge variant="secondary">{progress}% completato</Badge>
            </div>
            <div className="mt-3 h-2 w-full rounded-full bg-secondary overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-violet-600 to-indigo-600 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </CardHeader>
          <CardContent>
            <ul className="divide-y">
              {setupSteps.map((s) => (
                <li key={s.label} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <span
                      className={
                        s.done
                          ? "h-6 w-6 rounded-full bg-emerald-500 text-white grid place-items-center text-xs"
                          : "h-6 w-6 rounded-full border-2 border-muted-foreground/30 grid place-items-center text-xs text-muted-foreground"
                      }
                    >
                      {s.done ? "✓" : ""}
                    </span>
                    <span className={s.done ? "text-muted-foreground line-through" : ""}>{s.label}</span>
                  </div>
                  {!s.done && (
                    <Link href={s.href}>
                      <Button size="sm" variant="ghost">
                        Vai <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Quick actions */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Azioni rapide</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickAction icon={Bot} title="Aggiungi sistema AI" desc="Classificatore rischio guidato." href={`/dashboard/${orgId}/ai/new`} />
          <QuickAction icon={FileText} title="Informativa Art. 11" desc="Per i dipendenti, L. 132/2025." href={`/dashboard/${orgId}/documents/new?type=ai_employee_notice`} />
          <QuickAction icon={GraduationCap} title="Registra formazione" desc="AI literacy Art. 4." href={`/dashboard/${orgId}/training`} />
          <QuickAction icon={Bell} title="Alert normativi" desc="Scadenze e novità AI Act." href={`/dashboard/${orgId}/alerts`} />
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="bg-white/10 rounded-lg p-3 backdrop-blur">
      <p className="text-2xl font-display font-bold">{value}</p>
      <p className="text-xs opacity-80">{label}</p>
    </div>
  );
}

function AreaRow({
  title,
  ref_,
  score,
  max,
  detail,
  href,
}: {
  title: string;
  ref_: string;
  score: number;
  max: number;
  detail: string;
  href: string;
}) {
  const pct = max > 0 ? Math.round((score / max) * 100) : 0;
  const color = pct >= 80 ? "bg-emerald-500" : pct >= 50 ? "bg-amber-500" : "bg-red-500";
  return (
    <li className="py-3 flex flex-col sm:flex-row sm:items-center gap-3">
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium">{title}</span>
          <Badge variant="outline" className="text-[10px] font-normal">{ref_}</Badge>
        </div>
        <p className="text-xs text-muted-foreground">{detail}</p>
        <div className="h-1.5 w-full max-w-xs rounded-full bg-muted overflow-hidden">
          <div className={`h-full ${color}`} style={{ width: `${pct}%` }} />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="font-mono text-sm tabular-nums">
          {score}<span className="text-muted-foreground">/{max}</span>
        </span>
        <Link href={href}>
          <Button size="sm" variant="ghost">
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </div>
    </li>
  );
}

function QuickAction({ icon: Icon, title, desc, href }: { icon: any; title: string; desc: string; href: string }) {
  return (
    <Link href={href} className="group rounded-xl border bg-card p-5 hover:border-primary/40 hover:shadow-sm transition-all">
      <Icon className="h-6 w-6 text-primary" />
      <h3 className="font-semibold mt-3 group-hover:text-primary transition-colors">{title}</h3>
      <p className="text-sm text-muted-foreground mt-0.5">{desc}</p>
    </Link>
  );
}
