import { requireActiveOrg } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { NewSiteForm } from "./form";

export default async function NewSitePage({ params }: { params: Promise<{ orgId: string }> }) {
  const { orgId } = await params;
  await requireActiveOrg(orgId);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Aggiungi un sito</h1>
        <p className="text-muted-foreground">
          Inserisci il dominio per cui vuoi generare documenti e installare il banner cookie.
        </p>
      </div>
      <Card>
        <CardContent className="pt-6">
          <NewSiteForm orgId={orgId} />
        </CardContent>
      </Card>
    </div>
  );
}
