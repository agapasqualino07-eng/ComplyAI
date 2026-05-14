"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TRAINING_MODULES } from "@/lib/aiact/training-modules";

export function TrainingForm({ orgId }: { orgId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const moduleId = String(fd.get("module_id") || "");
    const moduleInfo = TRAINING_MODULES.find((m) => m.id === moduleId);

    const res = await fetch("/api/training", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        organization_id: orgId,
        employee_name: fd.get("employee_name"),
        employee_email: fd.get("employee_email") || null,
        topic: moduleInfo?.title || fd.get("topic"),
        module_id: moduleId || null,
        duration_hours: Number(fd.get("duration_hours") || moduleInfo?.durationHours || 1),
        completed_at: fd.get("completed_at"),
        notes: fd.get("notes") || null,
      }),
    });
    setLoading(false);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      toast.error(err.error || "Errore salvataggio.");
      return;
    }
    toast.success("Formazione registrata.");
    (e.currentTarget as HTMLFormElement).reset();
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="grid sm:grid-cols-2 gap-4">
      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor="employee_name">Nome dipendente *</Label>
        <Input id="employee_name" name="employee_name" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="employee_email">Email (opzionale)</Label>
        <Input id="employee_email" name="employee_email" type="email" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="completed_at">Data formazione *</Label>
        <Input
          id="completed_at"
          name="completed_at"
          type="date"
          defaultValue={new Date().toISOString().split("T")[0]}
          required
        />
      </div>
      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor="module_id">Modulo seguito *</Label>
        <select
          id="module_id"
          name="module_id"
          required
          className="w-full h-10 rounded-lg border bg-background px-3 text-sm"
        >
          {TRAINING_MODULES.map((m) => (
            <option key={m.id} value={m.id}>
              {m.title} — {m.durationHours * 60} min
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="duration_hours">Ore effettive</Label>
        <Input id="duration_hours" name="duration_hours" type="number" step="0.25" min="0" placeholder="Auto" />
      </div>
      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor="notes">Note</Label>
        <Textarea id="notes" name="notes" rows={2} />
      </div>
      <div className="sm:col-span-2">
        <Button type="submit" disabled={loading} variant="gradient">
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Registra formazione
        </Button>
      </div>
    </form>
  );
}
