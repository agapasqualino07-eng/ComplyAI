"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AcceptInviteButton({ token }: { token: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function accept() {
    setLoading(true);
    const res = await fetch("/api/invitations/accept", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || !json.ok) {
      setLoading(false);
      toast.error(json.error || "Impossibile accettare l'invito.");
      return;
    }
    toast.success("Invito accettato. Benvenuto.");
    router.push(`/dashboard/${json.organization_id}`);
    router.refresh();
  }

  return (
    <Button onClick={accept} disabled={loading} size="lg" variant="gradient" className="w-full">
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      Accetta invito
    </Button>
  );
}
