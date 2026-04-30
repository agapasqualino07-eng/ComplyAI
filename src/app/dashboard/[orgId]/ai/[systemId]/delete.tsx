"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DeleteSystemButton({ orgId, systemId }: { orgId: string; systemId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onDelete() {
    if (!confirm("Eliminare questo sistema AI dal registro? L'azione è irreversibile.")) return;
    setLoading(true);
    const res = await fetch(`/api/ai-systems/${systemId}`, { method: "DELETE" });
    setLoading(false);
    if (!res.ok) return toast.error("Errore");
    toast.success("Eliminato.");
    router.push(`/dashboard/${orgId}/ai`);
    router.refresh();
  }

  return (
    <Button variant="ghost" size="sm" onClick={onDelete} disabled={loading} className="text-destructive">
      <Trash2 className="h-4 w-4" /> Elimina
    </Button>
  );
}
