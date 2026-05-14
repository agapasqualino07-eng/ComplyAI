import { requireActiveOrg } from "@/lib/auth";
import { AIWizard } from "./wizard";

export default async function NewAISystemPage({
  params,
}: {
  params: Promise<{ orgId: string }>;
}) {
  const { orgId } = await params;
  await requireActiveOrg(orgId);
  return (
    <div className="max-w-3xl mx-auto">
      <AIWizard orgId={orgId} />
    </div>
  );
}
