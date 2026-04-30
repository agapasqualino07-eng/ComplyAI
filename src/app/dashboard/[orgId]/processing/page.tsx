import Link from "next/link";
import { ClipboardList, Plus } from "lucide-react";
import { requireActiveOrg } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function ProcessingRecordsPage({
  params,
}: {
  params: Promise<{ orgId: string }>;
}) {
  const { orgId } = await params;
  const { supabase } = await requireActiveOrg(orgId);

  const { data: records } = await supabase
    .from("processing_records")
    .select("id, name, purpose, legal_basis, updated_at")
    .eq("organization_id", orgId)
    .order("updated_at", { ascending: false });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">Registro trattamenti</h1>
          <p className="text-muted-foreground">Adempi all'art. 30 GDPR documentando i tuoi trattamenti.</p>
        </div>
        <Link href={`/dashboard/${orgId}/processing/new`}>
          <Button variant="gradient">
            <Plus className="h-4 w-4" /> Aggiungi trattamento
          </Button>
        </Link>
      </div>

      {!records || records.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center space-y-3">
            <ClipboardList className="h-10 w-10 text-muted-foreground/40 mx-auto" />
            <p className="text-muted-foreground">
              Nessun trattamento registrato. Inizia documentando le finalità per cui tratti dati personali.
            </p>
            <Link href={`/dashboard/${orgId}/processing/new`}>
              <Button variant="gradient" size="sm">
                <Plus className="h-4 w-4" /> Aggiungi il primo
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {records.map((r) => (
            <Link
              key={r.id}
              href={`/dashboard/${orgId}/processing/${r.id}`}
              className="rounded-xl border bg-card p-4 hover:border-primary/40 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold">{r.name}</p>
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">{r.purpose}</p>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">{r.legal_basis}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
