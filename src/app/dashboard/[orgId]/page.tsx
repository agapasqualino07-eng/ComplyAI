import Link from "next/link";
import {
  ArrowRight,
  Bot,
  FileText,
  GraduationCap,
  Bell,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
} from "lucide-react";
import { requireActiveOrg } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default async function OverviewPage({ params }: { params: Promise<{ orgId: string }> }) {
  const { orgId } = await params;
  const { org, supabase } = await requireActiveOrg(orgId);

  const [
    { count: aiCount },
    { count: prohibitedCount },
    { count: highRiskCount },
    { count: docsCount },
    { count: signedDocsCount },
    { count: trainingCount },
    { count: alertsCount },
  ] = await Promise.all([
    supabase.from("ai_systems").select("id", { count: "exact", head: true }).eq("organization_id", orgId),
    supabase.from("ai_systems").select("id", { count: "exact", head: true }).eq("organization_id", orgId).eq("category", "vietato"),
    supabase.from("ai_systems").select("id", { count: "exact", head: true }).eq("organization_id", orgId).eq("category", "alto"),
    supabase.from("documents").select("id", { count: "exact", head: true }).eq("organization_id", orgId),
    supabase.from("documents").select("id", { count: "exact", head: true }).eq("organization_id", orgId).not("published_at", "is", null),
    supabase.from("training_records").select("id", { count: "exact", head: true }).eq("organization_id", orgId),
    supabase.from("alerts").select("id", { count: "exact", head: true }),
  ]);

  // Score calculation (semplificato lato client per ora; il DB ha la function recompute_compliance_score)
  const base = 30;
  const bonusSystems = Math.min((aiCount ?? 0) * 4, 20);
  const penaltyHigh = Math.min((highRiskCount ?? 0) * 12, 36);
  const penaltyProhibited = (prohibitedCount ?? 0) * 25;
  const bonusTraining = Math.min((trainingCount ?? 0) * 5, 20);
  const bonusDocs = (docsCount ?? 0) > 0 ? Math.round(((signedDocsCount ?? 0) / (docsCount ?? 1)) * 30) : 0;
  const score = Math.max(0, Math.min(100, base + bonusSystems + bonusTraining + bonusDocs - penaltyHigh - penaltyProhibited));

  const setupSteps = [
    { done: (aiCount ?? 0) > 0, label: "Mappa i sistemi AI usati in azienda", href: `/dashboard/${orgId}/ai/new` },
    { done: (signedDocsCount ?? 0) > 0, label: "Genera e firma l'Informativa Art. 11 ai dipendenti", href: `/dashboard/${orgId}/documents/new?type=ai_employee_notice` },
    { done: (docsCount ?? 0) >= 2, label: "Genera la Policy interna sull'uso dell'IA", href: `/dashboard/${orgId}/documents/new?type=ai_use_policy` },
    { done: (trainingCount ?? 0) > 0, label: "Registra almeno una formazione AI literacy", href: `/dashboard/${orgId}/training` },
  ];
  const doneSteps = setupSteps.filter((s) => s.done).length;
  const progress = Math.round((doneSteps / setupSteps.length) * 100);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <p className="text-sm text-muted-foreground">Benvenuto</p>
        <h1 className="text-2xl sm:text-3xl font-display font-bold">{org.name}</h1>
        <p className="text-muted-foreground mt-1">Stato di compliance AI Act + L. 132/2025</p>
      </div>

      {/* Compliance score */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-700 text-white p-6 grid sm:grid-cols-2 gap-4 items-center">
          <div>
            <p className="text-sm opacity-80 uppercase tracking-wide">Score di compliance</p>
            <p className="text-6xl font-display font-bold mt-1">{score}<span className="text-2xl opacity-70">/100</span></p>
            <p className="text-sm opacity-90 mt-2">
              {score >= 70 ? "Buon livello — mantieni gli aggiornamenti" : score >= 40 ? "Attenzione: completa i passi mancanti" : "Critico: agisci subito sui passi qui sotto"}
            </p>
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
              Sanzione fino a 35M€ o 7% del fatturato. Dismetti o riprogetta subito.
            </p>
            <Link href={`/dashboard/${orgId}/ai`} className="inline-block mt-2 text-sm font-medium text-red-700 underline">
              Vai al registro IA →
            </Link>
          </div>
        </div>
      )}

      {/* Setup checklist */}
      {progress < 100 && (
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

function QuickAction({ icon: Icon, title, desc, href }: { icon: any; title: string; desc: string; href: string }) {
  return (
    <Link href={href} className="group rounded-xl border bg-card p-5 hover:border-primary/40 hover:shadow-sm transition-all">
      <Icon className="h-6 w-6 text-primary" />
      <h3 className="font-semibold mt-3 group-hover:text-primary transition-colors">{title}</h3>
      <p className="text-sm text-muted-foreground mt-0.5">{desc}</p>
    </Link>
  );
}
