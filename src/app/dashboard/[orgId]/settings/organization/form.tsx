"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function OrgSettingsForm({ org }: { org: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const payload = Object.fromEntries(fd.entries());
    const res = await fetch(`/api/orgs/${org.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setLoading(false);
    if (!res.ok) {
      toast.error("Errore salvataggio.");
      return;
    }
    toast.success("Salvato.");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="name">Nome commerciale</Label>
          <Input id="name" name="name" defaultValue={org.name} required />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="legal_name">Ragione sociale</Label>
          <Input id="legal_name" name="legal_name" defaultValue={org.legal_name || ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="vat_number">P.IVA</Label>
          <Input id="vat_number" name="vat_number" defaultValue={org.vat_number || ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tax_code">Codice fiscale</Label>
          <Input id="tax_code" name="tax_code" defaultValue={org.tax_code || ""} />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="address">Indirizzo</Label>
          <Input id="address" name="address" defaultValue={org.address || ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="city">Città</Label>
          <Input id="city" name="city" defaultValue={org.city || ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="postal_code">CAP</Label>
          <Input id="postal_code" name="postal_code" defaultValue={org.postal_code || ""} />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="email">Email contatto privacy</Label>
          <Input id="email" name="email" type="email" defaultValue={org.email || ""} />
        </div>
      </div>
      <Button type="submit" disabled={loading} variant="gradient">
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        Salva modifiche
      </Button>
    </form>
  );
}
