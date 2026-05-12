import { createAdminClient, createClient } from "@/lib/supabase/server";

// GET /api/account/export
// Esporta tutti i dati personali dell'utente in JSON (GDPR art. 20 — portabilità).
// Include: profilo, organizzazioni di cui è membro (con relativi sistemi AI,
// documenti, formazione, audit log).
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return new Response(JSON.stringify({ error: "Non autenticato" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const admin = createAdminClient();

  const [profile, memberships] = await Promise.all([
    admin.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    admin
      .from("org_members")
      .select("role, created_at, organization_id, organization:organizations!inner(*)")
      .eq("user_id", user.id),
  ]);

  const orgIds = (memberships.data ?? []).map((m: any) => m.organization_id);

  const [aiSystems, documents, training, auditLogs] = await Promise.all([
    orgIds.length
      ? admin.from("ai_systems").select("*").in("organization_id", orgIds)
      : Promise.resolve({ data: [] }),
    orgIds.length
      ? admin.from("documents").select("*").in("organization_id", orgIds)
      : Promise.resolve({ data: [] }),
    orgIds.length
      ? admin.from("training_records").select("*").in("organization_id", orgIds)
      : Promise.resolve({ data: [] }),
    orgIds.length
      ? admin.from("audit_logs").select("*").eq("actor_id", user.id).in("organization_id", orgIds)
      : Promise.resolve({ data: [] }),
  ]);

  const payload = {
    exported_at: new Date().toISOString(),
    notice:
      "Esportazione GDPR art. 20 (portabilità). Contiene tutti i dati personali identificati come tuoi all'interno di AIComply.",
    user: {
      id: user.id,
      email: user.email,
      created_at: user.created_at,
      metadata: user.user_metadata,
    },
    profile: profile.data,
    organizations: memberships.data,
    ai_systems: aiSystems.data,
    documents: documents.data,
    training_records: training.data,
    audit_logs: auditLogs.data,
  };

  const filename = `aicomply-export-${user.id.slice(0, 8)}-${new Date().toISOString().slice(0, 10)}.json`;

  return new Response(JSON.stringify(payload, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
