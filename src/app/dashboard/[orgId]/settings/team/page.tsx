import { requireActiveOrg } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { InviteForm } from "@/components/team/invite-form";
import { MemberActions, RevokeInviteButton } from "@/components/team/member-actions";

export default async function TeamSettingsPage({
  params,
}: {
  params: Promise<{ orgId: string }>;
}) {
  const { orgId } = await params;
  const { supabase, user } = await requireActiveOrg(orgId);

  const { data: members } = await supabase
    .from("org_members")
    .select("role, user_id, created_at, profile:profiles!inner(email, full_name)")
    .eq("organization_id", orgId);

  const { data: invitations } = await supabase
    .from("org_invitations")
    .select("id, email, role, expires_at, created_at")
    .eq("organization_id", orgId)
    .is("accepted_at", null)
    .order("created_at", { ascending: false });

  const myRole = members?.find((m: any) => m.user_id === user.id)?.role;
  const canManage = myRole === "owner" || myRole === "admin";

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Team</h1>
        <p className="text-muted-foreground">Gestisci utenti, ruoli e inviti pendenti.</p>
      </div>

      {canManage && (
        <Card>
          <CardContent className="pt-6 space-y-2">
            <h2 className="font-semibold">Invita un membro</h2>
            <p className="text-sm text-muted-foreground">
              Riceverà un'email con un link per accedere al workspace.
            </p>
            <InviteForm orgId={orgId} />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          <div className="border-b px-4 py-3 text-sm font-medium">Membri attivi</div>
          <ul className="divide-y">
            {(members || []).map((m: any) => (
              <li key={m.user_id} className="flex items-center justify-between gap-4 p-4">
                <div className="min-w-0">
                  <p className="font-medium truncate">{m.profile?.full_name || m.profile?.email}</p>
                  <p className="text-sm text-muted-foreground truncate">{m.profile?.email}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={m.role === "owner" ? "default" : "secondary"}>{m.role}</Badge>
                  <MemberActions
                    orgId={orgId}
                    userId={m.user_id}
                    currentRole={m.role}
                    canManage={canManage}
                  />
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {invitations && invitations.length > 0 && (
        <Card>
          <CardContent className="p-0">
            <div className="border-b px-4 py-3 text-sm font-medium">Inviti pendenti</div>
            <ul className="divide-y">
              {invitations.map((inv: any) => (
                <li key={inv.id} className="flex items-center justify-between gap-4 p-4">
                  <div className="min-w-0">
                    <p className="font-medium truncate">{inv.email}</p>
                    <p className="text-sm text-muted-foreground">
                      Ruolo {inv.role} — scade il{" "}
                      {new Date(inv.expires_at).toLocaleDateString("it-IT")}
                    </p>
                  </div>
                  {canManage && <RevokeInviteButton orgId={orgId} id={inv.id} />}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
