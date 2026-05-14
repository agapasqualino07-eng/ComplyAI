import { createAdminClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertForm, DeleteAlertButton } from "./alert-actions";

export default async function AdminAlertsPage() {
  const admin = createAdminClient();
  const { data: alerts } = await admin
    .from("alerts")
    .select("id, title, content, severity, impact, source, published_at, created_at")
    .order("published_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Alert normativi</h1>
        <p className="text-muted-foreground">
          Gestisci il feed normativo mostrato a tutti gli utenti.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-3">
          <h2 className="font-semibold">Nuovo alert</h2>
          <AlertForm />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="border-b px-4 py-3 text-sm font-medium">
            {alerts?.length ?? 0} alert pubblicati
          </div>
          <ul className="divide-y">
            {(alerts || []).map((a: any) => (
              <li key={a.id} className="flex items-start justify-between gap-4 p-4">
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge
                      variant={
                        a.severity === "critical"
                          ? "destructive"
                          : a.severity === "warning"
                            ? "secondary"
                            : "default"
                      }
                    >
                      {a.severity}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(a.published_at).toLocaleDateString("it-IT")}
                    </span>
                  </div>
                  <p className="font-medium">{a.title}</p>
                  <p className="text-sm text-muted-foreground">{a.content}</p>
                  {a.source && (
                    <p className="text-xs text-muted-foreground italic">{a.source}</p>
                  )}
                </div>
                <DeleteAlertButton id={a.id} />
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
