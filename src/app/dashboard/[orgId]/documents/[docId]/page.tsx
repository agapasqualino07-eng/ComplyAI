import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, Pencil } from "lucide-react";
import { requireActiveOrg } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PublishToggle } from "./publish-toggle";

export default async function DocumentDetailPage({
  params,
}: {
  params: Promise<{ orgId: string; docId: string }>;
}) {
  const { orgId, docId } = await params;
  const { supabase } = await requireActiveOrg(orgId);

  const { data: doc } = await supabase
    .from("documents")
    .select("*")
    .eq("id", docId)
    .eq("organization_id", orgId)
    .maybeSingle();

  if (!doc) notFound();

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-2">
        <Link href={`/dashboard/${orgId}/documents`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" /> Documenti
          </Button>
        </Link>
      </div>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            {doc.published_at ? <Badge variant="success">Pubblicato</Badge> : <Badge variant="secondary">Bozza</Badge>}
            <span className="text-sm text-muted-foreground">v{doc.version} · {doc.language.toUpperCase()}</span>
          </div>
          <h1 className="mt-1 text-2xl font-display font-bold">{doc.title}</h1>
        </div>
        <div className="flex items-center gap-2">
          <PublishToggle docId={doc.id} initial={!!doc.published_at} />
          <Link href={`/dashboard/${orgId}/documents/new?type=${doc.type}${doc.site_id ? `&siteId=${doc.site_id}` : ""}`}>
            <Button variant="outline">
              <Pencil className="h-4 w-4" /> Nuova versione
            </Button>
          </Link>
          {doc.published_at && (
            <Link href={`/p/${doc.slug}`} target="_blank">
              <Button variant="gradient">
                <ExternalLink className="h-4 w-4" /> Visualizza
              </Button>
            </Link>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Anteprima documento</CardTitle>
        </CardHeader>
        <CardContent>
          <article className="policy-prose" dangerouslySetInnerHTML={{ __html: doc.rendered_html }} />
        </CardContent>
      </Card>
    </div>
  );
}
