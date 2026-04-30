"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export function PublishToggle({ docId, initial }: { docId: string; initial: boolean }) {
  const router = useRouter();
  const [published, setPublished] = useState(initial);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    const res = await fetch(`/api/documents/${docId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ publish: !published }),
    });
    setLoading(false);
    if (!res.ok) {
      toast.error("Errore aggiornamento");
      return;
    }
    setPublished(!published);
    toast.success(!published ? "Documento pubblicato." : "Documento ritirato.");
    router.refresh();
  }

  return (
    <Button variant={published ? "outline" : "default"} onClick={toggle} disabled={loading}>
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {published ? "Ritira" : "Pubblica"}
    </Button>
  );
}
