"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PURPOSES, PROCESSORS, type DocumentType } from "@/lib/policy/types";

const TYPE_LABEL: Record<DocumentType, string> = {
  privacy: "Privacy Policy",
  cookie: "Cookie Policy",
  terms: "Termini e Condizioni",
  eula: "EULA",
};

interface Site {
  id: string;
  name: string;
  domain: string;
}

interface Props {
  orgId: string;
  defaultType: DocumentType;
  defaultSiteId?: string;
  sites: Site[];
  organization: any;
}

export function DocumentWizard({ orgId, defaultType, defaultSiteId, sites, organization }: Props) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [type] = useState<DocumentType>(defaultType);
  const [siteId, setSiteId] = useState<string | undefined>(defaultSiteId || sites[0]?.id);
  const [answers, setAnswers] = useState({
    controllerName: organization?.legal_name || organization?.name || "",
    vatNumber: organization?.vat_number || "",
    address: organization?.address || "",
    websiteUrl: sites.find((s) => s.id === (defaultSiteId || sites[0]?.id))?.domain || "",
    contactEmail: organization?.email || "",
    dpoEmail: "",
    purposes: [] as string[],
    usesCloudflare: false,
    usesGoogleAnalytics: false,
    usesMetaPixel: false,
    usesStripe: false,
    usesMailchimp: false,
    usesHotjar: false,
    otherProcessors: "",
  });

  const totalSteps = type === "terms" || type === "eula" ? 2 : 4;

  function update<K extends keyof typeof answers>(k: K, v: (typeof answers)[K]) {
    setAnswers((a) => ({ ...a, [k]: v }));
  }

  function togglePurpose(id: string) {
    setAnswers((a) => ({
      ...a,
      purposes: a.purposes.includes(id) ? a.purposes.filter((p) => p !== id) : [...a.purposes, id],
    }));
  }

  async function generate(publish: boolean) {
    if (!answers.controllerName || !answers.contactEmail || !answers.websiteUrl) {
      toast.error("Compila i campi obbligatori (denominazione, email contatto, sito).");
      setStep(1);
      return;
    }
    setLoading(true);
    const res = await fetch("/api/documents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        organization_id: orgId,
        site_id: siteId,
        type,
        language: "it",
        answers,
        publish,
      }),
    });
    setLoading(false);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      toast.error(err.error || "Errore nella generazione del documento.");
      return;
    }
    const { document_id } = await res.json();
    toast.success(publish ? "Documento generato e pubblicato." : "Bozza salvata.");
    router.push(`/dashboard/${orgId}/documents/${document_id}`);
    router.refresh();
  }

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Generatore</p>
            <CardTitle className="font-display text-2xl">{TYPE_LABEL[type]}</CardTitle>
          </div>
          <span className="text-sm text-muted-foreground">
            Passo {step + 1} di {totalSteps}
          </span>
        </div>
        <div className="mt-3 h-1.5 w-full rounded-full bg-secondary overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-violet-600 to-indigo-600 transition-all"
            style={{ width: `${((step + 1) / totalSteps) * 100}%` }}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {step === 0 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Per quale sito stai generando il documento? *</Label>
              <select
                className="w-full h-10 rounded-lg border bg-background px-3 text-sm"
                value={siteId || ""}
                onChange={(e) => {
                  setSiteId(e.target.value);
                  const s = sites.find((s) => s.id === e.target.value);
                  if (s) update("websiteUrl", s.domain);
                }}
                required
              >
                <option value="">Seleziona un sito…</option>
                {sites.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} — {s.domain}
                  </option>
                ))}
              </select>
              {sites.length === 0 && (
                <p className="text-sm text-amber-600">
                  Non hai ancora aggiunto siti. Vai in <em>Siti</em> e aggiungine uno prima di continuare.
                </p>
              )}
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="controllerName">Denominazione del Titolare del trattamento *</Label>
              <Input
                id="controllerName"
                value={answers.controllerName}
                onChange={(e) => update("controllerName", e.target.value)}
                required
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vatNumber">P.IVA</Label>
                <Input id="vatNumber" value={answers.vatNumber} onChange={(e) => update("vatNumber", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Indirizzo sede legale</Label>
                <Input id="address" value={answers.address} onChange={(e) => update("address", e.target.value)} />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contactEmail">Email contatto privacy *</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={answers.contactEmail}
                  onChange={(e) => update("contactEmail", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dpoEmail">Email DPO (se nominato)</Label>
                <Input
                  id="dpoEmail"
                  type="email"
                  value={answers.dpoEmail}
                  onChange={(e) => update("dpoEmail", e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="websiteUrl">URL sito web *</Label>
              <Input
                id="websiteUrl"
                value={answers.websiteUrl}
                onChange={(e) => update("websiteUrl", e.target.value)}
                placeholder="esempio.it"
                required
              />
            </div>
          </div>
        )}

        {step === 2 && (type === "privacy" || type === "cookie") && (
          <div className="space-y-3">
            <Label>Per quali finalità tratti dati personali? (selezionane almeno una)</Label>
            <div className="grid sm:grid-cols-2 gap-2">
              {PURPOSES.map((p) => {
                const active = answers.purposes.includes(p.id);
                return (
                  <button
                    type="button"
                    key={p.id}
                    onClick={() => togglePurpose(p.id)}
                    className={`text-left rounded-lg border px-3 py-2.5 text-sm transition-all ${
                      active ? "border-primary bg-primary/5 text-primary" : "hover:border-primary/40"
                    }`}
                  >
                    <span className="block font-medium">{p.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 3 && (type === "privacy" || type === "cookie") && (
          <div className="space-y-3">
            <Label>Quali strumenti/servizi terzi usi sul sito?</Label>
            <p className="text-sm text-muted-foreground -mt-2">
              Servono per dichiarare correttamente i Responsabili del trattamento (art. 28 GDPR).
            </p>
            <div className="grid sm:grid-cols-2 gap-2">
              {PROCESSORS.map((p) => {
                const k = p.key as keyof typeof answers;
                const active = !!answers[k];
                return (
                  <button
                    type="button"
                    key={p.key}
                    onClick={() => update(k, !active as any)}
                    className={`text-left rounded-lg border px-3 py-2.5 text-sm transition-all ${
                      active ? "border-primary bg-primary/5 text-primary" : "hover:border-primary/40"
                    }`}
                  >
                    <span className="block font-medium">{p.label}</span>
                  </button>
                );
              })}
            </div>
            <div className="space-y-2 pt-2">
              <Label htmlFor="otherProcessors">Altri responsabili / fornitori (testo libero)</Label>
              <Input
                id="otherProcessors"
                value={answers.otherProcessors}
                onChange={(e) => update("otherProcessors", e.target.value)}
                placeholder="Es. AWS Inc. (hosting), HubSpot (CRM)…"
              />
            </div>
          </div>
        )}

        <div className="flex items-center justify-between gap-3 pt-2 border-t">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0 || loading}
          >
            <ArrowLeft className="h-4 w-4" /> Indietro
          </Button>
          {step < totalSteps - 1 ? (
            <Button
              type="button"
              variant="gradient"
              onClick={() => setStep((s) => s + 1)}
              disabled={loading || (step === 0 && !siteId)}
            >
              Avanti <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" onClick={() => generate(false)} disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Salva bozza
              </Button>
              <Button type="button" variant="gradient" onClick={() => generate(true)} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Genera e pubblica
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
