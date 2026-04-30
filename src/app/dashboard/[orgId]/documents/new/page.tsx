import { requireActiveOrg } from "@/lib/auth";
import { DocumentWizard } from "./wizard";

export default async function NewDocumentPage({
  params,
  searchParams,
}: {
  params: Promise<{ orgId: string }>;
  searchParams: Promise<{ type?: string; siteId?: string }>;
}) {
  const { orgId } = await params;
  const sp = await searchParams;
  const { org, supabase } = await requireActiveOrg(orgId);

  const { data: sites } = await supabase
    .from("sites")
    .select("id, name, domain")
    .eq("organization_id", orgId)
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-3xl mx-auto">
      <DocumentWizard
        orgId={orgId}
        defaultType={(sp.type as any) || "privacy"}
        defaultSiteId={sp.siteId}
        sites={sites || []}
        organization={org}
      />
    </div>
  );
}
