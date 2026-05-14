import { AlertTriangle, Bell, Info } from "lucide-react";
import { requireActiveOrg } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

const SEVERITY_META: Record<string, { label: string; color: string; icon: any }> = {
  critical: { label: "Critico", color: "border-red-200 bg-red-50 text-red-900", icon: AlertTriangle },
  warning: { label: "Attenzione", color: "border-amber-200 bg-amber-50 text-amber-900", icon: AlertTriangle },
  info: { label: "Informativa", color: "border-blue-200 bg-blue-50 text-blue-900", icon: Info },
};

export default async function AlertsPage({ params }: { params: Promise<{ orgId: string }> }) {
  const { orgId } = await params;
  const { supabase } = await requireActiveOrg(orgId);

  const { data: alerts } = await supabase
    .from("alerts")
    .select("id, title, content, severity, impact, source, published_at")
    .order("published_at", { ascending: false });

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <div className="flex items-center gap-2">
          <Bell className="h-6 w-6 text-violet-600" />
          <h1 className="text-2xl font-display font-bold">Alert normativi</h1>
        </div>
        <p className="text-muted-foreground">
          Aggiornamenti sull'AI Act, sulla Legge 132/2025 e sulle scadenze applicabili alla tua azienda.
        </p>
      </div>

      {!alerts || alerts.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            Nessun alert al momento.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {alerts.map((a) => {
            const meta = SEVERITY_META[a.severity] || SEVERITY_META.info;
            const Icon = meta.icon;
            return (
              <div key={a.id} className={`rounded-xl border p-5 ${meta.color}`}>
                <div className="flex items-start gap-3">
                  <Icon className="h-5 w-5 mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <h3 className="font-semibold">{a.title}</h3>
                      <span className="text-xs opacity-70">{formatDate(a.published_at)}</span>
                    </div>
                    <p className="text-sm">{a.content}</p>
                    {(a.impact || a.source) && (
                      <div className="text-xs opacity-80 space-y-0.5 pt-2 border-t border-current/10">
                        {a.impact && <p><strong>Impatta:</strong> {a.impact}</p>}
                        {a.source && <p><strong>Fonte:</strong> {a.source}</p>}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
