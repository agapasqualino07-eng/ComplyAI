import { requireActiveOrg } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function TeamSettingsPage({
  params,
}: {
  params: Promise<{ orgId: string }>;
}) {
  const { orgId } = await params;
  const { supabase } = await requireActiveOrg(orgId);

  const { data: members } = await supabase
    .from("org_members")
    .select("role, user_id, created_at, profile:profiles!inner(email, full_name)")
    .eq("organization_id", orgId);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Team</h1>
        <p className="text-muted-foreground">Gestisci utenti e ruoli all'interno dell'azienda.</p>
      </div>
      <Card>
        <CardContent className="p-0">
          <ul className="divide-y">
            {(members || []).map((m: any) => (
              <li key={m.user_id} className="flex items-center justify-between gap-4 p-4">
                <div>
                  <p className="font-medium">{m.profile?.full_name || m.profile?.email}</p>
                  <p className="text-sm text-muted-foreground">{m.profile?.email}</p>
                </div>
                <Badge variant={m.role === "owner" ? "default" : "secondary"}>{m.role}</Badge>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
      <p className="text-sm text-muted-foreground">
        L'invito di nuovi membri sarà disponibile a breve. Nel frattempo possono registrarsi e tu li potrai aggiungere all'azienda.
      </p>
    </div>
  );
}
