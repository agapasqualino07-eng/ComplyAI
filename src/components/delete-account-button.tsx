"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DeleteAccountButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onDelete() {
    const phrase = window.prompt(
      "Questa operazione è irreversibile. Scrivi ELIMINA per confermare la cancellazione del tuo account e di tutti i dati associati.",
    );
    if (phrase !== "ELIMINA") return;

    setLoading(true);
    const res = await fetch("/api/account", { method: "DELETE" });
    setLoading(false);

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      toast.error(err.error || "Impossibile eliminare l'account.");
      return;
    }
    toast.success("Account eliminato. Arrivederci.");
    router.push("/");
    router.refresh();
  }

  return (
    <Button variant="destructive" onClick={onDelete} disabled={loading}>
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
      Elimina account
    </Button>
  );
}
