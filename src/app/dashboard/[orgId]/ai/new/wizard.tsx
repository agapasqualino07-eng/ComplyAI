"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Loader2, Sparkles, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { classify, RISK_LABELS, type ClassifierAnswers } from "@/lib/aiact/classifier";

interface Props {
  orgId: string;
}

const DOMAIN_OPTIONS = [
  { value: "none", label: "Nessuna delle aree elencate" },
  { value: "biometrics", label: "Biometria (identificazione, riconoscimento emozioni in contesti regolati)" },
  { value: "critical_infrastructure", label: "Infrastrutture critiche (acqua, energia, traffico)" },
  { value: "education", label: "Istruzione (ammissione, valutazione, monitoraggio studenti)" },
  { value: "employment_hr", label: "Lavoro / HR (selezione, valutazione, allocazione task)" },
  { value: "essential_services", label: "Servizi essenziali (credito, welfare, assicurazioni, emergenze)" },
  { value: "law_enforcement", label: "Forze dell'ordine" },
  { value: "migration_asylum", label: "Migrazione, asilo, controllo frontiere" },
  { value: "justice_democracy", label: "Giustizia / processi democratici" },
];

export function AIWizard({ orgId }: Props) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [vendor, setVendor] = useState("");
  const [vendorUrl, setVendorUrl] = useState("");
  const [purpose, setPurpose] = useState("");
  const [orgRole, setOrgRole] = useState<"deployer" | "provider" | "distributor" | "importer">("deployer");
  const [a, setA] = useState<ClassifierAnswers>({ domain: "none" });
  const [usesPersonalData, setUsesPersonalData] = useState(false);
  const [affectsIndividuals, setAffectsIndividuals] = useState(false);
  const [humanOversight, setHumanOversight] = useState("");

  const totalSteps = 5;

  function update<K extends keyof ClassifierAnswers>(k: K, v: ClassifierAnswers[K]) {
    setA((s) => ({ ...s, [k]: v }));
  }

  const result = useMemo(() => classify(a), [a]);

  async function save() {
    if (!name) {
      toast.error("Indica un nome per il sistema AI.");
      setStep(0);
      return;
    }
    setLoading(true);
    const res = await fetch("/api/ai-systems", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        organization_id: orgId,
        name,
        vendor: vendor || null,
        vendor_url: vendorUrl || null,
        purpose: purpose || null,
        org_role: orgRole,
        is_gpai: !!a.isGeneralPurposeModel,
        uses_personal_data: usesPersonalData,
        affects_individuals: affectsIndividuals,
        risk_class: result.risk,
        questionnaire: a,
        human_oversight: humanOversight || null,
      }),
    });
    setLoading(false);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      toast.error(err.error || "Errore salvataggio.");
      return;
    }
    const { id } = await res.json();
    toast.success("Sistema AI registrato.");
    router.push(`/dashboard/${orgId}/ai/${id}`);
    router.refresh();
  }

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Wizard AI Act</p>
            <CardTitle className="font-display text-2xl">Classifica un sistema AI</CardTitle>
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
            <h3 className="font-semibold">1. Identifica il sistema</h3>
            <div className="space-y-2">
              <Label htmlFor="name">Nome del sistema *</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Es. ChatGPT Enterprise, GitHub Copilot, chatbot interno…" required />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vendor">Fornitore</Label>
                <Input id="vendor" value={vendor} onChange={(e) => setVendor(e.target.value)} placeholder="OpenAI, Microsoft…" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vendor_url">URL fornitore</Label>
                <Input id="vendor_url" value={vendorUrl} onChange={(e) => setVendorUrl(e.target.value)} placeholder="https://openai.com" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="purpose">Finalità d'uso</Label>
              <Textarea id="purpose" value={purpose} onChange={(e) => setPurpose(e.target.value)} placeholder="Es. assistenza clienti via chatbot, generazione contenuti marketing, supporto coding…" rows={3} />
            </div>
            <div className="space-y-2">
              <Label>Il tuo ruolo rispetto a questo sistema</Label>
              <div className="grid sm:grid-cols-2 gap-2">
                {(
                  [
                    { id: "deployer", label: "Deployer", desc: "Lo uso (più comune)" },
                    { id: "provider", label: "Provider", desc: "Lo sviluppo/immetto sul mercato" },
                    { id: "distributor", label: "Distributor", desc: "Lo distribuisco" },
                    { id: "importer", label: "Importer", desc: "Lo importo da extra-UE" },
                  ] as const
                ).map((r) => (
                  <button
                    type="button"
                    key={r.id}
                    onClick={() => setOrgRole(r.id)}
                    className={`text-left rounded-lg border px-3 py-2.5 text-sm transition-all ${
                      orgRole === r.id ? "border-primary bg-primary/5 text-primary" : "hover:border-primary/40"
                    }`}
                  >
                    <span className="block font-medium">{r.label}</span>
                    <span className="block text-xs text-muted-foreground">{r.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <h3 className="font-semibold">2. Pratiche vietate (Art. 5)</h3>
            <p className="text-sm text-muted-foreground">
              Rispondi onestamente: se anche una sola di queste è vera, il sistema è VIETATO nell'UE.
            </p>
            {(
              [
                { k: "usesSubliminalTechniques", l: "Usa tecniche subliminali o manipolative oltre la consapevolezza dell'utente" },
                { k: "exploitsVulnerabilities", l: "Sfrutta vulnerabilità di età/disabilità/status socio-economico" },
                { k: "socialScoring", l: "Effettua social scoring di persone (per autorità pubbliche o per loro conto)" },
                { k: "predictivePolicingNatural", l: "Predictive policing su persone fisiche basato solo su profilazione" },
                { k: "emotionRecognitionAtWorkOrSchool", l: "Riconoscimento emozioni in luoghi di lavoro o istituti scolastici" },
                { k: "biometricCategorizationSensitive", l: "Categorizzazione biometrica per attributi sensibili (etnia, religione, orientamento)" },
                { k: "realtimeRBIPublic", l: "Identificazione biometrica remota in tempo reale in spazi pubblici" },
                { k: "untargetedFacialScraping", l: "Scraping non mirato di immagini facciali da internet o CCTV" },
              ] as const
            ).map((q) => {
              const v = (a as any)[q.k] as boolean | undefined;
              return (
                <label key={q.k} className="flex items-start gap-3 rounded-lg border p-3 cursor-pointer hover:border-primary/40">
                  <input
                    type="checkbox"
                    className="mt-1"
                    checked={!!v}
                    onChange={(e) => update(q.k as any, e.target.checked as any)}
                  />
                  <span className="text-sm">{q.l}</span>
                </label>
              );
            })}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h3 className="font-semibold">3. Aree ad alto rischio (Annex III)</h3>
            <div className="space-y-2">
              <Label>In quale area opera principalmente il sistema?</Label>
              <select
                className="w-full h-10 rounded-lg border bg-background px-3 text-sm"
                value={a.domain || "none"}
                onChange={(e) => update("domain", e.target.value as any)}
              >
                {DOMAIN_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <label className="flex items-start gap-3 rounded-lg border p-3 cursor-pointer hover:border-primary/40">
              <input
                type="checkbox"
                className="mt-1"
                checked={!!a.isSafetyComponentRegulated}
                onChange={(e) => update("isSafetyComponentRegulated", e.target.checked)}
              />
              <span className="text-sm">
                Il sistema è componente di sicurezza di un prodotto regolato da normative UE elencate nell'Annex I (es. macchine, dispositivi medici, giocattoli, veicoli, ascensori)
              </span>
            </label>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h3 className="font-semibold">4. Trasparenza & GPAI</h3>
            {(
              [
                { k: "interactsWithUsers", l: "Il sistema interagisce direttamente con utenti finali (chatbot, voice assistant, NPC)" },
                { k: "generatesContent", l: "Il sistema genera contenuti sintetici (testo, immagini, audio, video)" },
                { k: "deepfake", l: "Genera deepfake o contenuti che possono essere scambiati per autentici" },
                { k: "emotionRecognitionOther", l: "Riconoscimento emozioni (in contesti diversi da lavoro/scuola)" },
                { k: "biometricCategorizationOther", l: "Categorizzazione biometrica (in contesti non vietati)" },
                { k: "isGeneralPurposeModel", l: "Si tratta di un modello di IA per finalità generali (GPAI), es. LLM, diffusion model" },
              ] as const
            ).map((q) => {
              const v = (a as any)[q.k] as boolean | undefined;
              return (
                <label key={q.k} className="flex items-start gap-3 rounded-lg border p-3 cursor-pointer hover:border-primary/40">
                  <input
                    type="checkbox"
                    className="mt-1"
                    checked={!!v}
                    onChange={(e) => update(q.k as any, e.target.checked as any)}
                  />
                  <span className="text-sm">{q.l}</span>
                </label>
              );
            })}
            <div className="grid sm:grid-cols-2 gap-4 pt-2">
              <label className="flex items-start gap-3 rounded-lg border p-3 cursor-pointer hover:border-primary/40">
                <input type="checkbox" className="mt-1" checked={usesPersonalData} onChange={(e) => setUsesPersonalData(e.target.checked)} />
                <span className="text-sm">Tratta dati personali</span>
              </label>
              <label className="flex items-start gap-3 rounded-lg border p-3 cursor-pointer hover:border-primary/40">
                <input type="checkbox" className="mt-1" checked={affectsIndividuals} onChange={(e) => setAffectsIndividuals(e.target.checked)} />
                <span className="text-sm">Le sue decisioni impattano persone (assunzioni, valutazioni, accesso servizi)</span>
              </label>
            </div>
            <div className="space-y-2">
              <Label htmlFor="oversight">Misure di sorveglianza umana attive</Label>
              <Textarea
                id="oversight"
                value={humanOversight}
                onChange={(e) => setHumanOversight(e.target.value)}
                rows={2}
                placeholder="Es. revisione umana di ogni output prima della pubblicazione, possibilità di disattivare il sistema, audit log…"
              />
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <h3 className="font-semibold">5. Esito e obblighi</h3>
            <div className={`rounded-xl border-2 p-5 ${RISK_LABELS[result.risk].color}`}>
              <p className="text-sm font-semibold uppercase tracking-wide">Classificazione</p>
              <p className="text-2xl font-display font-bold mt-1">{RISK_LABELS[result.risk].label}</p>
              <p className="text-sm mt-2">{RISK_LABELS[result.risk].description}</p>
            </div>

            {result.risk === "prohibited" && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-4 flex gap-2 items-start">
                <AlertTriangle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                <p className="text-sm text-red-900">
                  Questo sistema rientra tra le pratiche vietate dall'AI Act. Il suo uso, immissione sul mercato o messa in servizio è VIETATO nell'UE.
                </p>
              </div>
            )}

            <div>
              <p className="font-semibold text-sm mb-2">Motivazione</p>
              <ul className="text-sm space-y-1.5">
                {result.reasons.map((r, i) => (
                  <li key={i} className="flex gap-2"><span className="text-muted-foreground">•</span><span>{r}</span></li>
                ))}
              </ul>
            </div>

            <div>
              <p className="font-semibold text-sm mb-2">Obblighi applicabili</p>
              <ul className="text-sm space-y-1.5">
                {result.obligations.map((o, i) => (
                  <li key={i} className="flex gap-2"><span className="text-emerald-600 font-bold">✓</span><span>{o}</span></li>
                ))}
              </ul>
            </div>

            {result.references.length > 0 && (
              <div className="text-xs text-muted-foreground border-t pt-3">
                <strong>Riferimenti:</strong> {result.references.join(" · ")}
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between gap-3 pt-2 border-t">
          <Button type="button" variant="ghost" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0 || loading}>
            <ArrowLeft className="h-4 w-4" /> Indietro
          </Button>
          {step < totalSteps - 1 ? (
            <Button type="button" variant="gradient" onClick={() => setStep((s) => s + 1)} disabled={loading}>
              Avanti <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button type="button" variant="gradient" onClick={save} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              Registra il sistema
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
