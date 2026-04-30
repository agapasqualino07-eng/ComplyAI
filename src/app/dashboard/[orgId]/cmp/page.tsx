import Link from "next/link";
import { Cookie, Settings2 } from "lucide-react";
import { requireActiveOrg } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";

export default async function CmpListPage({ params }: { params: Promise<{ orgId: string }> }) {
  const { orgId } = await params;
  const { supabase } = await requireActiveOrg(orgId);

  const { data: sites } = await supabase
    .from("sites")
    .select("id, name, domain, public_id")
    .eq("organization_id", orgId)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-display font-bold">Cookie & CMP</h1>
        <p className="text-muted-foreground">Gestisci i banner cookie e i consensi per ciascun sito.</p>
      </div>

      {!sites || sites.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center space-y-3">
            <Cookie className="h-10 w-10 text-muted-foreground/40 mx-auto" />
            <p className="text-muted-foreground">Aggiungi prima un sito per configurare il banner.</p>
            <Link href={`/dashboard/${orgId}/sites/new`} className="text-primary hover:underline text-sm">
              Aggiungi sito →
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {sites.map((s) => (
            <Link
              key={s.id}
              href={`/dashboard/${orgId}/cmp/${s.id}`}
              className="flex items-center justify-between gap-4 rounded-xl border bg-card p-4 hover:border-primary/40 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-amber-100 text-amber-700 grid place-items-center">
                  <Cookie className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium">{s.name}</p>
                  <p className="text-xs text-muted-foreground">{s.domain}</p>
                </div>
              </div>
              <Settings2 className="h-4 w-4 text-muted-foreground" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
