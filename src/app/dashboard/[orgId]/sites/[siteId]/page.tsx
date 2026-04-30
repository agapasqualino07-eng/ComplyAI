import Link from "next/link";
import { notFound } from "next/navigation";
import { Cookie, Code2, FileText, Globe } from "lucide-react";
import { requireActiveOrg } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CmpInstallSnippet } from "./install-snippet";

export default async function SiteDetailPage({
  params,
}: {
  params: Promise<{ orgId: string; siteId: string }>;
}) {
  const { orgId, siteId } = await params;
  const { supabase } = await requireActiveOrg(orgId);

  const { data: site } = await supabase
    .from("sites")
    .select("id, name, domain, public_id, created_at")
    .eq("id", siteId)
    .eq("organization_id", orgId)
    .maybeSingle();

  if (!site) notFound();

  const { data: docs } = await supabase
    .from("documents")
    .select("id, type, title, slug, published_at")
    .eq("organization_id", orgId)
    .eq("site_id", siteId)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 grid place-items-center text-white">
          <Globe className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-display font-bold">{site.name}</h1>
          <p className="text-muted-foreground">{site.domain}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code2 className="h-5 w-5" /> Installa ComplyAI sul tuo sito
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CmpInstallSnippet siteId={site.public_id} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" /> Documenti del sito
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {!docs || docs.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-muted-foreground mb-3">Nessun documento ancora generato per questo sito.</p>
              <Link href={`/dashboard/${orgId}/documents/new?type=privacy&siteId=${site.id}`}>
                <Button variant="gradient" size="sm">
                  <FileText className="h-4 w-4" /> Genera Privacy Policy
                </Button>
              </Link>
            </div>
          ) : (
            <ul className="divide-y">
              {docs.map((d) => (
                <li key={d.id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    {d.type === "cookie" ? <Cookie className="h-4 w-4 text-muted-foreground" /> : <FileText className="h-4 w-4 text-muted-foreground" />}
                    <div>
                      <p className="font-medium">{d.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {d.published_at ? `Pubblicato · /p/${d.slug}` : "Bozza"}
                      </p>
                    </div>
                  </div>
                  <Link href={`/dashboard/${orgId}/documents/${d.id}`}>
                    <Button variant="ghost" size="sm">Apri</Button>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
