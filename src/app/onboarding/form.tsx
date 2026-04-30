"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

export function OnboardingForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const payload = Object.fromEntries(fd.entries());

    const res = await fetch("/api/orgs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setLoading(false);

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      toast.error(err.error || "Errore durante la creazione dell'azienda.");
      return;
    }
    const { organization_id } = await res.json();
    toast.success("Azienda creata. Benvenuto in ComplyAI.");
    router.push(`/dashboard/${organization_id}`);
    router.refresh();
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={onSubmit} className="space-y-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="name">Nome commerciale *</Label>
              <Input id="name" name="name" placeholder="Es. Acme S.r.l." required />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="legal_name">Ragione sociale completa</Label>
              <Input id="legal_name" name="legal_name" placeholder="Es. Acme Società a Responsabilità Limitata" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vat_number">Partita IVA</Label>
              <Input id="vat_number" name="vat_number" placeholder="IT01234567890" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tax_code">Codice fiscale</Label>
              <Input id="tax_code" name="tax_code" />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="address">Indirizzo sede legale</Label>
              <Input id="address" name="address" placeholder="Via, civico" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">Città</Label>
              <Input id="city" name="city" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="postal_code">CAP</Label>
              <Input id="postal_code" name="postal_code" />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="email">Email di contatto privacy</Label>
              <Input id="email" name="email" type="email" placeholder="privacy@azienda.it" />
            </div>
          </div>

          <div className="rounded-lg bg-muted/50 px-4 py-3 text-xs text-muted-foreground">
            ✨ La tua prova gratuita di 14 giorni inizia ora. Non ti chiediamo la carta finché non decidi di sottoscrivere un piano.
          </div>

          <Button type="submit" size="lg" className="w-full" variant="gradient" disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Crea azienda e inizia
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
