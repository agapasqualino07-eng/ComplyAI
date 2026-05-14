import { requireActiveOrg } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { OrgSettingsForm } from "./form";

export default async function OrgSettingsPage({
  params,
}: {
  params: Promise<{ orgId: string }>;
}) {
  const { orgId } = await params;
  const { org } = await requireActiveOrg(orgId);
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Impostazioni azienda</h1>
        <p className="text-muted-foreground">Modifica i dati anagrafici dell'azienda.</p>
      </div>
      <Card>
        <CardContent className="pt-6">
          <OrgSettingsForm org={org} />
        </CardContent>
      </Card>
    </div>
  );
}
