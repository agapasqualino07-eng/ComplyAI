import { redirect } from "next/navigation";
import { requireActiveOrg } from "@/lib/auth";
import { DocumentWizard } from "./wizard";
import type { DocumentType } from "@/lib/policy/types";

const VALID_TYPES: DocumentType[] = [
  "ai_use_policy",
  "ai_employee_notice",
  "ai_disclosure",
  "ai_registry_export",
];

export default async function NewDocumentPage({
  params,
  searchParams,
}: {
  params: Promise<{ orgId: string }>;
  searchParams: Promise<{ type?: string }>;
}) {
  const { orgId } = await params;
  const sp = await searchParams;
  const { org, supabase } = await requireActiveOrg(orgId);

  const type = (sp.type && VALID_TYPES.includes(sp.type as DocumentType)
    ? (sp.type as DocumentType)
    : "ai_use_policy") as DocumentType;

  // Pre-carica i sistemi AI dell'organizzazione per il documento
  const { data: aiSystems } = await supabase
    .from("ai_systems")
    .select("name, vendor, purpose, category")
    .eq("organization_id", orgId)
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-3xl mx-auto">
      <DocumentWizard
        orgId={orgId}
        type={type}
        organization={org}
        aiSystems={aiSystems || []}
      />
    </div>
  );
}
