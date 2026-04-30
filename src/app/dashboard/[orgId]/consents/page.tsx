import Link from "next/link";
import { Download, ScrollText } from "lucide-react";
import { requireActiveOrg } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/utils";
import { SiteFilter } from "./site-filter";

export default async function ConsentsPage({
  params,
  searchParams,
}: {
  params: Promise<{ orgId: string }>;
  searchParams: Promise<{ siteId?: string }>;
}) {
  const { orgId } = await params;
  const sp = await searchParams;
  const { supabase } = await requireActiveOrg(orgId);

  const { data: sites } = await supabase
    .from("sites")
    .select("id, name, domain")
    .eq("organization_id", orgId);

  let query = supabase
    .from("consent_logs")
    .select("id, subject_id, consent_string, categories, page_url, user_agent, created_at, site_id")
    .eq("organization_id", orgId)
    .order("created_at", { ascending: false })
    .limit(200);

  if (sp.siteId) query = query.eq("site_id", sp.siteId);
  const { data: logs } = await query;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">Registro consensi</h1>
          <p className="text-muted-foreground">Storico dei consensi raccolti tramite il banner.</p>
        </div>
        <div className="flex items-center gap-2">
          <SiteFilter orgId={orgId} sites={sites || []} value={sp.siteId} />
          <Link
            href={`/api/consents/export${sp.siteId ? `?siteId=${sp.siteId}&orgId=${orgId}` : `?orgId=${orgId}`}`}
          >
            <Button variant="outline">
              <Download className="h-4 w-4" /> CSV
            </Button>
          </Link>
        </div>
      </div>

      {!logs || logs.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center space-y-2">
            <ScrollText className="h-10 w-10 text-muted-foreground/40 mx-auto" />
            <p className="text-muted-foreground">
              Nessun consenso registrato. Una volta installato il banner, i consensi appariranno qui in tempo reale.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="text-left px-4 py-3">Data</th>
                  <th className="text-left px-4 py-3">Soggetto</th>
                  <th className="text-left px-4 py-3">Categorie accettate</th>
                  <th className="text-left px-4 py-3 hidden md:table-cell">Pagina</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {logs.map((row) => (
                  <tr key={row.id} className="hover:bg-muted/20">
                    <td className="px-4 py-2.5 whitespace-nowrap">{formatDateTime(row.created_at)}</td>
                    <td className="px-4 py-2.5 font-mono text-xs">{row.subject_id.slice(0, 12)}…</td>
                    <td className="px-4 py-2.5">
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(row.categories || {}).map(([k, v]) =>
                          v ? (
                            <Badge key={k} variant="success" className="text-[10px]">{k}</Badge>
                          ) : (
                            <Badge key={k} variant="secondary" className="text-[10px] opacity-60">{k}</Badge>
                          ),
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground truncate max-w-[280px] hidden md:table-cell">
                      {row.page_url || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
