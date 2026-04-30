import Link from "next/link";
import { ArrowRight, FileText, Globe, ScrollText, ShieldCheck, ClipboardList } from "lucide-react";
import { requireActiveOrg } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default async function OverviewPage({ params }: { params: Promise<{ orgId: string }> }) {
  const { orgId } = await params;
  const { org, supabase } = await requireActiveOrg(orgId);

  const [
    { count: sitesCount },
    { count: docsCount },
    { count: prCount },
    { count: consentsCount },
  ] = await Promise.all([
    supabase.from("sites").select("id", { count: "exact", head: true }).eq("organization_id", orgId),
    supabase.from("documents").select("id", { count: "exact", head: true }).eq("organization_id", orgId),
    supabase.from("processing_records").select("id", { count: "exact", head: true }).eq("organization_id", orgId),
    supabase.from("consent_logs").select("id", { count: "exact", head: true }).eq("organization_id", orgId),
  ]);

  const setupSteps = [
    { done: (sitesCount ?? 0) > 0, label: "Aggiungi il primo sito", href: `/dashboard/${orgId}/sites` },
    { done: (docsCount ?? 0) > 0, label: "Genera Privacy & Cookie Policy", href: `/dashboard/${orgId}/documents` },
    { done: (sitesCount ?? 0) > 0 && (docsCount ?? 0) > 0, label: "Configura il banner cookie", href: `/dashboard/${orgId}/cmp` },
    { done: (prCount ?? 0) > 0, label: "Compila il registro trattamenti", href: `/dashboard/${orgId}/processing` },
  ];
  const doneSteps = setupSteps.filter((s) => s.done).length;
  const progress = Math.round((doneSteps / setupSteps.length) * 100);

  const stats = [
    { label: "Siti gestiti", value: sitesCount ?? 0, icon: Globe },
    { label: "Documenti generati", value: docsCount ?? 0, icon: FileText },
    { label: "Consensi tracciati", value: consentsCount ?? 0, icon: ScrollText },
    { label: "Trattamenti registrati", value: prCount ?? 0, icon: ClipboardList },
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <p className="text-sm text-muted-foreground">Benvenuto</p>
        <h1 className="text-2xl sm:text-3xl font-display font-bold">{org.name}</h1>
      </div>

      {/* Setup checklist */}
      {progress < 100 && (
        <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-primary" /> Setup compliance
                </CardTitle>
                <CardDescription>Completa la configurazione iniziale per essere a norma.</CardDescription>
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

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <Icon className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-3xl font-display font-bold mt-2">{value}</p>
              <p className="text-sm text-muted-foreground mt-1">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Azioni rapide</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6 space-y-3">
              <FileText className="h-6 w-6 text-primary" />
              <div>
                <h3 className="font-semibold">Genera Privacy Policy</h3>
                <p className="text-sm text-muted-foreground">Questionario guidato in 5 minuti.</p>
              </div>
              <Link href={`/dashboard/${orgId}/documents/new?type=privacy`}>
                <Button size="sm" variant="outline" className="w-full">Inizia</Button>
              </Link>
            </CardContent>
          </Card>
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6 space-y-3">
              <Globe className="h-6 w-6 text-primary" />
              <div>
                <h3 className="font-semibold">Aggiungi sito</h3>
                <p className="text-sm text-muted-foreground">Collega un nuovo dominio.</p>
              </div>
              <Link href={`/dashboard/${orgId}/sites/new`}>
                <Button size="sm" variant="outline" className="w-full">Aggiungi</Button>
              </Link>
            </CardContent>
          </Card>
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6 space-y-3">
              <ClipboardList className="h-6 w-6 text-primary" />
              <div>
                <h3 className="font-semibold">Registro trattamenti</h3>
                <p className="text-sm text-muted-foreground">Adempi all'art. 30 GDPR.</p>
              </div>
              <Link href={`/dashboard/${orgId}/processing`}>
                <Button size="sm" variant="outline" className="w-full">Apri</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
