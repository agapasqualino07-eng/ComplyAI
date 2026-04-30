import Link from "next/link";
import { Globe, Plus } from "lucide-react";
import { requireActiveOrg } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

export default async function SitesPage({ params }: { params: Promise<{ orgId: string }> }) {
  const { orgId } = await params;
  const { supabase } = await requireActiveOrg(orgId);

  const { data: sites } = await supabase
    .from("sites")
    .select("id, name, domain, public_id, created_at")
    .eq("organization_id", orgId)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">Siti</h1>
          <p className="text-muted-foreground">I domini per cui gestisci la compliance.</p>
        </div>
        <Link href={`/dashboard/${orgId}/sites/new`}>
          <Button variant="gradient">
            <Plus className="h-4 w-4" /> Aggiungi sito
          </Button>
        </Link>
      </div>

      {!sites || sites.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center space-y-4">
            <Globe className="h-12 w-12 text-muted-foreground/40 mx-auto" />
            <div>
              <h3 className="text-lg font-semibold">Nessun sito ancora</h3>
              <p className="text-muted-foreground">Aggiungi il tuo primo dominio per iniziare a generare documenti e installare il banner.</p>
            </div>
            <Link href={`/dashboard/${orgId}/sites/new`}>
              <Button variant="gradient">
                <Plus className="h-4 w-4" /> Aggiungi il primo sito
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {sites.map((site) => (
            <Link
              key={site.id}
              href={`/dashboard/${orgId}/sites/${site.id}`}
              className="block rounded-xl border bg-card p-4 hover:border-primary/40 hover:shadow-sm transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 grid place-items-center text-white shrink-0">
                    <Globe className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold truncate">{site.name}</h3>
                    <p className="text-sm text-muted-foreground truncate">{site.domain}</p>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground text-right shrink-0">
                  Aggiunto {formatDate(site.created_at)}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
