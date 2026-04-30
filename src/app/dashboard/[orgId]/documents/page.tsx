import Link from "next/link";
import { FileText, Cookie, ScrollText, Plus } from "lucide-react";
import { requireActiveOrg } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

const TYPE_META: Record<string, { label: string; icon: any; color: string }> = {
  privacy: { label: "Privacy Policy", icon: FileText, color: "text-violet-600" },
  cookie: { label: "Cookie Policy", icon: Cookie, color: "text-amber-600" },
  terms: { label: "Termini e Condizioni", icon: ScrollText, color: "text-blue-600" },
  eula: { label: "EULA", icon: ScrollText, color: "text-blue-600" },
};

export default async function DocumentsPage({ params }: { params: Promise<{ orgId: string }> }) {
  const { orgId } = await params;
  const { supabase } = await requireActiveOrg(orgId);

  const { data: docs } = await supabase
    .from("documents")
    .select("id, type, title, slug, language, version, published_at, updated_at")
    .eq("organization_id", orgId)
    .order("updated_at", { ascending: false });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">Documenti</h1>
          <p className="text-muted-foreground">Privacy Policy, Cookie Policy e altri documenti legali.</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { type: "privacy", label: "Privacy Policy", desc: "Informativa GDPR" },
          { type: "cookie", label: "Cookie Policy", desc: "Per banner cookie" },
          { type: "terms", label: "Termini e Condizioni", desc: "T&C del sito" },
          { type: "eula", label: "EULA", desc: "Software/SaaS" },
        ].map((t) => {
          const meta = TYPE_META[t.type];
          const Icon = meta.icon;
          return (
            <Link
              key={t.type}
              href={`/dashboard/${orgId}/documents/new?type=${t.type}`}
              className="group rounded-xl border bg-card p-4 hover:border-primary/40 hover:shadow-sm transition-all"
            >
              <Icon className={`h-6 w-6 ${meta.color}`} />
              <p className="mt-2 font-semibold group-hover:text-primary transition-colors">+ {t.label}</p>
              <p className="text-xs text-muted-foreground">{t.desc}</p>
            </Link>
          );
        })}
      </div>

      <div>
        <h2 className="font-semibold mb-3">Documenti esistenti</h2>
        {!docs || docs.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              Nessun documento creato. Inizia generando una Privacy Policy.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-2">
            {docs.map((d) => {
              const meta = TYPE_META[d.type] || TYPE_META.privacy;
              const Icon = meta.icon;
              return (
                <Link
                  key={d.id}
                  href={`/dashboard/${orgId}/documents/${d.id}`}
                  className="flex items-center justify-between gap-4 rounded-xl border bg-card p-4 hover:border-primary/40 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon className={`h-5 w-5 ${meta.color} shrink-0`} />
                    <div className="min-w-0">
                      <p className="font-medium truncate">{d.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {meta.label} · v{d.version} · {d.language.toUpperCase()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {d.published_at ? (
                      <Badge variant="success">Pubblicato</Badge>
                    ) : (
                      <Badge variant="secondary">Bozza</Badge>
                    )}
                    <span className="text-xs text-muted-foreground hidden sm:inline">{formatDate(d.updated_at)}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
