import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Bot } from "lucide-react";
import { requireActiveOrg } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { classify, RISK_LABELS, ROLE_LABELS, type AIRisk, type AIRole } from "@/lib/aiact/classifier";
import { DeleteSystemButton } from "./delete";
import { formatDateTime } from "@/lib/utils";

export default async function AISystemPage({
  params,
}: {
  params: Promise<{ orgId: string; systemId: string }>;
}) {
  const { orgId, systemId } = await params;
  const { supabase } = await requireActiveOrg(orgId);

  const { data: system } = await supabase
    .from("ai_systems")
    .select("*")
    .eq("id", systemId)
    .eq("organization_id", orgId)
    .maybeSingle();

  if (!system) notFound();

  // Riclassifica al volo per ottenere obblighi aggiornati
  const result = classify((system.questionnaire as any) || {});
  const meta = RISK_LABELS[result.risk];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <Link href={`/dashboard/${orgId}/ai`}>
        <Button variant="ghost" size="sm">
          <ArrowLeft className="h-4 w-4" /> Tutti i sistemi AI
        </Button>
      </Link>

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-violet-100 text-violet-700 grid place-items-center">
            <Bot className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold">{system.name}</h1>
            <p className="text-muted-foreground">
              {system.vendor || "Fornitore non specificato"}
              {system.purpose ? ` · ${system.purpose}` : ""}
            </p>
          </div>
        </div>
        <DeleteSystemButton orgId={orgId} systemId={system.id} />
      </div>

      <div className={`rounded-xl border-2 p-5 ${meta.color}`}>
        <p className="text-sm font-semibold uppercase tracking-wide">Classificazione AI Act</p>
        <p className="text-2xl font-display font-bold mt-1">{meta.label}</p>
        <p className="text-sm mt-2">{meta.description}</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Identificazione</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Row label="Ruolo" value={ROLE_LABELS[system.org_role as AIRole]} />
            <Row label="Stato" value={system.status} />
            <Row label="Tratta dati personali" value={system.uses_personal_data ? "Sì" : "No"} />
            <Row label="Decisioni che impattano persone" value={system.affects_individuals ? "Sì" : "No"} />
            <Row label="Modello GPAI" value={system.is_gpai ? "Sì" : "No"} />
            <Row label="Aggiornato" value={formatDateTime(system.updated_at)} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Sorveglianza umana</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            {system.human_oversight ? (
              <p className="whitespace-pre-wrap">{system.human_oversight}</p>
            ) : (
              <p className="text-muted-foreground">Nessuna misura documentata.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Motivazione classificazione</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="text-sm space-y-1.5">
            {result.reasons.map((r, i) => (
              <li key={i} className="flex gap-2"><span className="text-muted-foreground">•</span><span>{r}</span></li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Obblighi applicabili</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="text-sm space-y-2">
            {result.obligations.map((o, i) => (
              <li key={i} className="flex gap-2"><span className="text-emerald-600 font-bold mt-0.5">✓</span><span>{o}</span></li>
            ))}
          </ul>
          {result.references.length > 0 && (
            <p className="text-xs text-muted-foreground mt-4 border-t pt-3">
              <strong>Riferimenti:</strong> {result.references.join(" · ")}
            </p>
          )}
        </CardContent>
      </Card>

      {(result.risk === "limited" || result.risk === "high") && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="pt-6">
            <p className="font-semibold mb-2">Hai bisogno di documenti di trasparenza per gli utenti?</p>
            <p className="text-sm text-muted-foreground mb-4">
              Genera l'<strong>AI Disclosure Notice</strong> da pubblicare sul sito (chatbot AI, contenuti AI-generated).
            </p>
            <Link href={`/dashboard/${orgId}/documents/new?type=ai_disclosure`}>
              <Button variant="gradient">Genera AI Disclosure Notice →</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="flex justify-between gap-4 py-1.5 border-b last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-right">{value || "—"}</span>
    </div>
  );
}
