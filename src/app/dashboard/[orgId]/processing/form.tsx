"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Props {
  orgId: string;
  initial?: any;
}

export function ProcessingForm({ orgId, initial }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const payload: any = {
      organization_id: orgId,
      name: fd.get("name"),
      purpose: fd.get("purpose"),
      legal_basis: fd.get("legal_basis"),
      data_categories: String(fd.get("data_categories") || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      data_subjects: String(fd.get("data_subjects") || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      retention: fd.get("retention") || null,
      recipients: fd.get("recipients") || null,
      transfers_outside_eu: fd.get("transfers_outside_eu") === "on",
      security_measures: fd.get("security_measures") || null,
      dpo_notes: fd.get("dpo_notes") || null,
    };

    const url = initial?.id ? `/api/processing/${initial.id}` : `/api/processing`;
    const method = initial?.id ? "PATCH" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setLoading(false);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      toast.error(err.error || "Errore salvataggio");
      return;
    }
    toast.success("Salvato.");
    router.push(`/dashboard/${orgId}/processing`);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nome del trattamento *</Label>
        <Input id="name" name="name" defaultValue={initial?.name} placeholder="Es. Newsletter clienti" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="purpose">Finalità *</Label>
        <Textarea id="purpose" name="purpose" defaultValue={initial?.purpose} rows={3} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="legal_basis">Base giuridica *</Label>
        <select id="legal_basis" name="legal_basis" defaultValue={initial?.legal_basis} required className="w-full h-10 rounded-lg border bg-background px-3 text-sm">
          <option value="">Seleziona…</option>
          <option value="Art. 6.1.a (consenso)">Art. 6.1.a — Consenso</option>
          <option value="Art. 6.1.b (contratto)">Art. 6.1.b — Esecuzione di un contratto</option>
          <option value="Art. 6.1.c (obbligo legale)">Art. 6.1.c — Obbligo legale</option>
          <option value="Art. 6.1.d (interessi vitali)">Art. 6.1.d — Interessi vitali</option>
          <option value="Art. 6.1.e (interesse pubblico)">Art. 6.1.e — Interesse pubblico</option>
          <option value="Art. 6.1.f (legittimo interesse)">Art. 6.1.f — Legittimo interesse</option>
        </select>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="data_categories">Categorie di dati (separate da virgola)</Label>
          <Input id="data_categories" name="data_categories" defaultValue={initial?.data_categories?.join(", ")} placeholder="email, nome, ip" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="data_subjects">Categorie di interessati</Label>
          <Input id="data_subjects" name="data_subjects" defaultValue={initial?.data_subjects?.join(", ")} placeholder="clienti, prospect" />
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="retention">Conservazione</Label>
          <Input id="retention" name="retention" defaultValue={initial?.retention} placeholder="2 anni dall'ultimo contatto" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="recipients">Destinatari / Responsabili</Label>
          <Input id="recipients" name="recipients" defaultValue={initial?.recipients} placeholder="Mailchimp, AWS" />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="security_measures">Misure di sicurezza</Label>
        <Textarea id="security_measures" name="security_measures" defaultValue={initial?.security_measures} rows={2} placeholder="Cifratura at-rest, MFA, backup quotidiani…" />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="transfers_outside_eu" defaultChecked={initial?.transfers_outside_eu} />
        Trasferimento di dati al di fuori dell'UE
      </label>
      <div className="space-y-2">
        <Label htmlFor="dpo_notes">Note interne / DPO</Label>
        <Textarea id="dpo_notes" name="dpo_notes" defaultValue={initial?.dpo_notes} rows={2} />
      </div>
      <Button type="submit" disabled={loading} variant="gradient" className="w-full" size="lg">
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        Salva trattamento
      </Button>
    </form>
  );
}
