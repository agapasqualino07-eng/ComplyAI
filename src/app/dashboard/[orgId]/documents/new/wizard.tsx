"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DOC_LABELS, type DocumentType } from "@/lib/policy/types";

interface Props {
  orgId: string;
  type: DocumentType;
  organization: any;
  aiSystems: Array<{ name: string; vendor: string | null; purpose: string | null; category: string | null }>;
}

export function DocumentWizard({ orgId, type, organization, aiSystems }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const label = DOC_LABELS[type];

  const [form, setForm] = useState({
    controllerName: organization?.legal_name || organization?.name || "",
    vatNumber: organization?.vat_number || "",
    address: organization?.address || "",
    contactEmail: organization?.email || "",
    websiteUrl: "",
    sector: organization?.sector || "",
    approvedTools: aiSystems.map((s) => `${s.name}${s.vendor ? ` (${s.vendor})` : ""}`).join(", "),
    prohibitedUseCases: "",
    hasHumanReviewProcess: true,
    trainingProvided: false,
    appliesToProfessions: organization?.sector === "professional",
  });

  function update<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function generate(publish: boolean) {
    if (!form.controllerName || !form.contactEmail) {
      toast.error("Denominazione e email contatto sono obbligatori.");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/documents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        organization_id: orgId,
        type,
        language: "it",
        publish,
        answers: { ...form, aiSystemsList: aiSystems },
      }),
    });
    setLoading(false);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      toast.error(err.error || "Errore generazione documento.");
      return;
    }
    const { document_id } = await res.json();
    toast.success(publish ? "Documento generato." : "Bozza salvata.");
    router.push(`/dashboard/${orgId}/documents/${document_id}`);
    router.refresh();
  }

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <p className="text-sm text-muted-foreground">Generatore documento AI Act</p>
        <CardTitle className="font-display text-2xl">{label.title}</CardTitle>
        <p className="text-sm text-muted-foreground">{label.subtitle} · {label.audience}</p>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="controllerName">Denominazione azienda *</Label>
            <Input
              id="controllerName"
              value={form.controllerName}
              onChange={(e) => update("controllerName", e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="vatNumber">P.IVA</Label>
            <Input id="vatNumber" value={form.vatNumber} onChange={(e) => update("vatNumber", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Sede legale</Label>
            <Input id="address" value={form.address} onChange={(e) => update("address", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contactEmail">Email contatto *</Label>
            <Input
              id="contactEmail"
              type="email"
              value={form.contactEmail}
              onChange={(e) => update("contactEmail", e.target.value)}
              required
            />
          </div>
          {type === "ai_disclosure" && (
            <div className="space-y-2">
              <Label htmlFor="websiteUrl">URL sito (per disclosure)</Label>
              <Input id="websiteUrl" value={form.websiteUrl} onChange={(e) => update("websiteUrl", e.target.value)} />
            </div>
          )}
        </div>

        {type === "ai_use_policy" && (
          <>
            <div className="space-y-2">
              <Label htmlFor="approvedTools">Strumenti AI approvati (separati da virgola)</Label>
              <Textarea
                id="approvedTools"
                value={form.approvedTools}
                onChange={(e) => update("approvedTools", e.target.value)}
                rows={2}
                placeholder="ChatGPT Enterprise, Microsoft Copilot, ..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prohibitedUseCases">Casi d'uso ulteriormente vietati (oltre Art. 5)</Label>
              <Textarea
                id="prohibitedUseCases"
                value={form.prohibitedUseCases}
                onChange={(e) => update("prohibitedUseCases", e.target.value)}
                rows={2}
                placeholder="Es. uso di AI per analisi dati medici dei dipendenti..."
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <label className="flex items-start gap-3 rounded-lg border p-3 cursor-pointer hover:border-primary/40">
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={form.hasHumanReviewProcess}
                  onChange={(e) => update("hasHumanReviewProcess", e.target.checked)}
                />
                <span className="text-sm">Abbiamo processi di revisione umana sugli output AI</span>
              </label>
              <label className="flex items-start gap-3 rounded-lg border p-3 cursor-pointer hover:border-primary/40">
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={form.trainingProvided}
                  onChange={(e) => update("trainingProvided", e.target.checked)}
                />
                <span className="text-sm">Forniamo già formazione AI literacy</span>
              </label>
              <label className="flex items-start gap-3 rounded-lg border p-3 cursor-pointer hover:border-primary/40 sm:col-span-2">
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={form.appliesToProfessions}
                  onChange={(e) => update("appliesToProfessions", e.target.checked)}
                />
                <span className="text-sm">Siamo un'attività professionale intellettuale (Art. 13 L.132/2025)</span>
              </label>
            </div>
          </>
        )}

        <div className="rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground">
          {aiSystems.length > 0
            ? <>Il documento includerà automaticamente i <strong>{aiSystems.length}</strong> sistemi AI registrati nella tua dashboard.</>
            : <>Hai 0 sistemi nel Registro IA. Vai prima alla sezione <strong>Registro IA</strong> per registrarli: il documento li includerà automaticamente.</>}
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t">
          <Button type="button" variant="outline" onClick={() => generate(false)} disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Salva bozza
          </Button>
          <Button type="button" variant="gradient" onClick={() => generate(true)} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            Genera documento
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
