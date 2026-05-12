"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Download, LogOut, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ExportDataButton() {
  return (
    <Button asChild variant="outline">
      <a href="/api/account/export" download>
        <Download className="h-4 w-4" />
        Esporta i miei dati (JSON)
      </a>
    </Button>
  );
}

export function GlobalSignoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function signOutAll() {
    if (!confirm("Uscire da tutti i dispositivi su cui sei attualmente loggato?")) return;
    setLoading(true);
    const res = await fetch("/api/account/sessions", { method: "POST" });
    setLoading(false);
    if (!res.ok) {
      toast.error("Errore durante il logout.");
      return;
    }
    toast.success("Sessioni terminate su tutti i device.");
    router.push("/login");
    router.refresh();
  }

  return (
    <Button onClick={signOutAll} disabled={loading} variant="outline">
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
      Esci da tutti i device
    </Button>
  );
}
