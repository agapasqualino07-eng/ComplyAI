"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Severity = "info" | "warning" | "critical";

export function AlertForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [severity, setSeverity] = useState<Severity>("info");
  const [impact, setImpact] = useState("");
  const [source, setSource] = useState("");
  const [publishedAt, setPublishedAt] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/admin/alerts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content, severity, impact, source, published_at: publishedAt }),
    });
    setLoading(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      toast.error(j.error || "Errore");
      return;
    }
    toast.success("Alert pubblicato.");
    setTitle("");
    setContent("");
    setImpact("");
    setSource("");
    setSeverity("info");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div className="grid sm:grid-cols-2 gap-3">
        <div className="space-y-1 sm:col-span-2">
          <Label htmlFor="alert-title">Titolo</Label>
          <Input id="alert-title" required value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="space-y-1 sm:col-span-2">
          <Label htmlFor="alert-content">Contenuto</Label>
          <Textarea
            id="alert-content"
            required
            rows={3}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="alert-severity">Severità</Label>
          <select
            id="alert-severity"
            value={severity}
            onChange={(e) => setSeverity(e.target.value as Severity)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="critical">Critical</option>
          </select>
        </div>
        <div className="space-y-1">
          <Label htmlFor="alert-published">Data pubblicazione</Label>
          <Input
            id="alert-published"
            type="date"
            value={publishedAt}
            onChange={(e) => setPublishedAt(e.target.value)}
          />
        </div>
        <div className="space-y-1 sm:col-span-2">
          <Label htmlFor="alert-impact">Impatto (opzionale)</Label>
          <Input id="alert-impact" value={impact} onChange={(e) => setImpact(e.target.value)} placeholder="Es. Tutte le aziende che usano AI" />
        </div>
        <div className="space-y-1 sm:col-span-2">
          <Label htmlFor="alert-source">Fonte (opzionale)</Label>
          <Input id="alert-source" value={source} onChange={(e) => setSource(e.target.value)} placeholder="Es. AI Act, Art. 5" />
        </div>
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
        Pubblica alert
      </Button>
    </form>
  );
}

export function DeleteAlertButton({ id }: { id: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  async function remove() {
    if (!confirm("Eliminare questo alert?")) return;
    const res = await fetch(`/api/admin/alerts/${id}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("Errore");
      return;
    }
    toast.success("Alert eliminato");
    startTransition(() => router.refresh());
  }

  return (
    <Button size="icon" variant="ghost" onClick={remove} disabled={pending} aria-label="Elimina">
      <Trash2 className="h-4 w-4 text-destructive" />
    </Button>
  );
}
