import Link from "next/link";
import { FileText, Bot, Megaphone, ClipboardList, Plus } from "lucide-react";
import { requireActiveOrg } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { DOC_LABELS, type DocumentType } from "@/lib/policy/types";

const TYPE_META: Record<DocumentType, { icon: any; color: string }> = {
  ai_use_policy: { icon: Bot, color: "text-violet-600 bg-violet-100" },
  ai_employee_notice: { icon: FileText, color: "text-fuchsia-600 bg-fuchsia-100" },
  ai_disclosure: { icon: Megaphone, color: "text-indigo-600 bg-indigo-100" },
  ai_registry_export: { icon: ClipboardList, color: "text-blue-600 bg-blue-100" },
};

const TEMPLATES: DocumentType[] = [
  "ai_use_policy",
  "ai_employee_notice",
  "ai_disclosure",
  "ai_registry_export",
];

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
      <div>
        <h1 className="text-2xl font-display font-bold">Documenti audit-ready</h1>
        <p className="text-muted-foreground">
          Genera i documenti previsti dall'AI Act e dalla Legge italiana 132/2025.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        {TEMPLATES.map((t) => {
          const meta = TYPE_META[t];
          const label = DOC_LABELS[t];
          const Icon = meta.icon;
          return (
            <Link
              key={t}
              href={`/dashboard/${orgId}/documents/new?type=${t}`}
              className="group rounded-xl border bg-card p-5 hover:border-primary/40 hover:shadow-sm transition-all"
            >
              <div className={`h-10 w-10 rounded-lg grid place-items-center ${meta.color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <p className="mt-3 font-semibold group-hover:text-primary transition-colors">
                <Plus className="inline h-4 w-4 mr-0.5" /> {label.title}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{label.subtitle}</p>
              <p className="text-[11px] text-muted-foreground mt-2 italic">{label.audience}</p>
            </Link>
          );
        })}
      </div>

      <div>
        <h2 className="font-semibold mb-3">Documenti generati</h2>
        {!docs || docs.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              Nessun documento generato. Inizia dalla <strong>Policy interna</strong> o dall'<strong>Informativa Art. 11</strong> per i dipendenti.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-2">
            {docs.map((d) => {
              const meta = TYPE_META[d.type as DocumentType] || TYPE_META.ai_use_policy;
              const Icon = meta.icon;
              return (
                <Link
                  key={d.id}
                  href={`/dashboard/${orgId}/documents/${d.id}`}
                  className="flex items-center justify-between gap-4 rounded-xl border bg-card p-4 hover:border-primary/40 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`h-9 w-9 rounded-lg grid place-items-center ${meta.color} shrink-0`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium truncate">{d.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {DOC_LABELS[d.type as DocumentType]?.subtitle} · v{d.version} · {d.language.toUpperCase()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {d.published_at ? (
                      <Badge variant="success">Firmato</Badge>
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
