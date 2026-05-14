import { GraduationCap, BookOpen, Plus } from "lucide-react";
import { requireActiveOrg } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TRAINING_MODULES } from "@/lib/aiact/training-modules";
import { formatDate } from "@/lib/utils";
import { TrainingForm } from "./form";

export default async function TrainingPage({ params }: { params: Promise<{ orgId: string }> }) {
  const { orgId } = await params;
  const { supabase } = await requireActiveOrg(orgId);

  const { data: records } = await supabase
    .from("training_records")
    .select("id, employee_name, employee_email, topic, module_id, duration_hours, completed_at, notes")
    .eq("organization_id", orgId)
    .order("completed_at", { ascending: false });

  const totalEmployees = new Set((records || []).map((r) => r.employee_name)).size;
  const totalHours = (records || []).reduce((sum, r) => sum + (r.duration_hours || 0), 0);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <div className="flex items-center gap-2">
          <GraduationCap className="h-6 w-6 text-violet-600" />
          <h1 className="text-2xl font-display font-bold">Formazione AI literacy</h1>
        </div>
        <p className="text-muted-foreground">
          Adempi all'obbligo di alfabetizzazione AI (Art. 4 AI Act). Registra le formazioni effettuate dai tuoi dipendenti.
        </p>
      </div>

      <div className="grid sm:grid-cols-3 gap-3">
        <Card>
          <CardContent className="pt-5">
            <p className="text-3xl font-display font-bold">{records?.length || 0}</p>
            <p className="text-sm text-muted-foreground">Sessioni registrate</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-3xl font-display font-bold">{totalEmployees}</p>
            <p className="text-sm text-muted-foreground">Persone formate</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-3xl font-display font-bold">{totalHours.toFixed(1)}h</p>
            <p className="text-sm text-muted-foreground">Ore totali</p>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="font-semibold mb-3">Moduli formativi consigliati</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {TRAINING_MODULES.map((m) => (
            <Card key={m.id} className="border-primary/15">
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-violet-600" />
                    {m.title}
                  </CardTitle>
                  <Badge variant="secondary">{m.durationHours * 60} min</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{m.description}</p>
              </CardHeader>
              <CardContent>
                <ul className="text-xs text-muted-foreground space-y-1 mb-3">
                  {m.topics.map((t) => (
                    <li key={t} className="flex gap-2"><span>•</span><span>{t}</span></li>
                  ))}
                </ul>
                <p className="text-[11px] text-muted-foreground italic mb-3">{m.legalBasis}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Card className="border-primary/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Plus className="h-4 w-4" /> Registra una sessione di formazione
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TrainingForm orgId={orgId} />
        </CardContent>
      </Card>

      <div>
        <h2 className="font-semibold mb-3">Storico formazioni</h2>
        {!records || records.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">
              Nessuna formazione registrata.
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="text-left px-4 py-3">Persona</th>
                    <th className="text-left px-4 py-3">Argomento</th>
                    <th className="text-left px-4 py-3">Durata</th>
                    <th className="text-left px-4 py-3">Data</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {records.map((r) => (
                    <tr key={r.id} className="hover:bg-muted/20">
                      <td className="px-4 py-2.5 font-medium">{r.employee_name}</td>
                      <td className="px-4 py-2.5">{r.topic}</td>
                      <td className="px-4 py-2.5">{r.duration_hours}h</td>
                      <td className="px-4 py-2.5 text-muted-foreground">{formatDate(r.completed_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
