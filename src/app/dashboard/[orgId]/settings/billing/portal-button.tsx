"use client";

import { useState } from "react";
import { toast } from "sonner";
import { CreditCard, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PortalButton({ orgId }: { orgId: string }) {
  const [loading, setLoading] = useState(false);
  async function go() {
    setLoading(true);
    const res = await fetch("/api/stripe/portal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ organization_id: orgId }),
    });
    const json = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok || !json.url) {
      toast.error(json.error || "Errore apertura portale.");
      return;
    }
    window.location.href = json.url;
  }
  return (
    <Button variant="outline" onClick={go} disabled={loading}>
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
      Gestisci pagamenti
    </Button>
  );
}
