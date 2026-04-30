import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireActiveOrg } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { CmpEditor } from "./editor";
import { CmpInstallSnippet } from "../../sites/[siteId]/install-snippet";

export default async function CmpConfigPage({
  params,
}: {
  params: Promise<{ orgId: string; siteId: string }>;
}) {
  const { orgId, siteId } = await params;
  const { supabase } = await requireActiveOrg(orgId);

  const { data: site } = await supabase
    .from("sites")
    .select("id, name, domain, public_id")
    .eq("id", siteId)
    .eq("organization_id", orgId)
    .maybeSingle();
  if (!site) notFound();

  let { data: cfg } = await supabase
    .from("cmp_configs")
    .select("*")
    .eq("site_id", siteId)
    .maybeSingle();

  if (!cfg) {
    const { data: created } = await supabase
      .from("cmp_configs")
      .insert({ organization_id: orgId, site_id: siteId })
      .select("*")
      .single();
    cfg = created;
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <Link href={`/dashboard/${orgId}/cmp`}>
        <Button variant="ghost" size="sm">
          <ArrowLeft className="h-4 w-4" /> Tutti i siti
        </Button>
      </Link>
      <div>
        <h1 className="text-2xl font-display font-bold">{site.name}</h1>
        <p className="text-muted-foreground">{site.domain}</p>
      </div>
      <CmpEditor orgId={orgId} siteId={siteId} initial={cfg} />
      <CmpInstallSnippet siteId={site.public_id} />
    </div>
  );
}
