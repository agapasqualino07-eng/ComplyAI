import { requireActiveOrg } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { ProcessingForm } from "../form";

export default async function NewProcessingPage({
  params,
}: {
  params: Promise<{ orgId: string }>;
}) {
  const { orgId } = await params;
  await requireActiveOrg(orgId);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Nuovo trattamento</h1>
        <p className="text-muted-foreground">Documenta una nuova finalità di trattamento dati.</p>
      </div>
      <Card>
        <CardContent className="pt-6">
          <ProcessingForm orgId={orgId} />
        </CardContent>
      </Card>
    </div>
  );
}
