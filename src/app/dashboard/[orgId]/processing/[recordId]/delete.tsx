"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

export function DeleteRecordButton({ orgId, recordId }: { orgId: string; recordId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onDelete() {
    if (!confirm("Sicuro di voler eliminare questo trattamento? L'azione è irreversibile.")) return;
    setLoading(true);
    const res = await fetch(`/api/processing/${recordId}`, { method: "DELETE" });
    setLoading(false);
    if (!res.ok) {
      toast.error("Errore");
      return;
    }
    toast.success("Eliminato.");
    router.push(`/dashboard/${orgId}/processing`);
    router.refresh();
  }
  return (
    <Button variant="ghost" size="sm" onClick={onDelete} disabled={loading} className="text-destructive">
      <Trash2 className="h-4 w-4" /> Elimina
    </Button>
  );
}
