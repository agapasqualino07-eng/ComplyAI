"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  orgId: string;
  plan: string;
  cadence: "monthly" | "yearly";
  highlight?: boolean;
}

export function CheckoutButton({ orgId, plan, cadence, highlight }: Props) {
  const [loading, setLoading] = useState(false);

  async function go() {
    setLoading(true);
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ organization_id: orgId, plan, cadence }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || !json.url) {
      setLoading(false);
      toast.error(json.error || "Errore avvio checkout.");
      return;
    }
    window.location.href = json.url;
  }

  return (
    <Button onClick={go} disabled={loading} className="w-full" variant={highlight ? "gradient" : "default"}>
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      Attiva con prova 14gg
    </Button>
  );
}
