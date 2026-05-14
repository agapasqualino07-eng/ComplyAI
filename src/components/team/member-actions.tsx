"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type Role = "admin" | "editor" | "viewer";

export function MemberActions({
  orgId,
  userId,
  currentRole,
  canManage,
}: {
  orgId: string;
  userId: string;
  currentRole: "owner" | Role;
  canManage: boolean;
}) {
  const router = useRouter();
  const [role, setRole] = useState<Role>(currentRole === "owner" ? "editor" : currentRole);
  const [pending, startTransition] = useTransition();

  if (!canManage || currentRole === "owner") {
    return <span className="text-sm text-muted-foreground">—</span>;
  }

  async function changeRole(newRole: Role) {
    setRole(newRole);
    const res = await fetch(`/api/orgs/${orgId}/members/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: newRole }),
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      toast.error(j.error || "Errore aggiornamento ruolo");
      return;
    }
    toast.success("Ruolo aggiornato");
    startTransition(() => router.refresh());
  }

  async function remove() {
    if (!confirm("Rimuovere questo membro? Perderà accesso ai dati dell'azienda.")) return;
    const res = await fetch(`/api/orgs/${orgId}/members/${userId}`, { method: "DELETE" });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      toast.error(j.error || "Errore");
      return;
    }
    toast.success("Membro rimosso");
    startTransition(() => router.refresh());
  }

  return (
    <div className="flex items-center gap-2">
      <select
        value={role}
        disabled={pending}
        onChange={(e) => changeRole(e.target.value as Role)}
        className="h-9 rounded-md border border-input bg-background px-2 text-sm"
      >
        <option value="admin">Admin</option>
        <option value="editor">Editor</option>
        <option value="viewer">Viewer</option>
      </select>
      <Button size="icon" variant="ghost" onClick={remove} disabled={pending} aria-label="Rimuovi">
        <Trash2 className="h-4 w-4 text-destructive" />
      </Button>
    </div>
  );
}

export function RevokeInviteButton({ orgId, id }: { orgId: string; id: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  async function revoke() {
    if (!confirm("Revocare questo invito?")) return;
    const res = await fetch(`/api/orgs/${orgId}/invitations/${id}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("Errore");
      return;
    }
    toast.success("Invito revocato");
    startTransition(() => router.refresh());
  }

  return (
    <Button size="sm" variant="ghost" onClick={revoke} disabled={pending}>
      <Trash2 className="h-4 w-4 text-destructive" /> Revoca
    </Button>
  );
}
