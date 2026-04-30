"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function NewSiteForm({ orgId }: { orgId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const res = await fetch(`/api/sites`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        organization_id: orgId,
        name: fd.get("name"),
        domain: fd.get("domain"),
      }),
    });
    setLoading(false);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      toast.error(err.error || "Errore nella creazione del sito.");
      return;
    }
    const { site_id } = await res.json();
    toast.success("Sito creato.");
    router.push(`/dashboard/${orgId}/sites/${site_id}`);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nome del sito *</Label>
        <Input id="name" name="name" placeholder="Es. Sito principale" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="domain">Dominio *</Label>
        <Input id="domain" name="domain" placeholder="esempio.it" required pattern="[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}" />
        <p className="text-xs text-muted-foreground">Senza https:// e senza barre. Es. <code className="text-foreground">tuosito.it</code></p>
      </div>
      <Button type="submit" disabled={loading} className="w-full" size="lg" variant="gradient">
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        Aggiungi sito
      </Button>
    </form>
  );
}
