import { createAdminClient } from "@/lib/supabase/server";

/**
 * Invoca la funzione SQL `recompute_compliance_score(org)` per aggiornare
 * il campo `compliance_score` su organizations dopo mutations rilevanti
 * (creazione/eliminazione di ai_systems, documents, training_records).
 *
 * Best-effort: errori non vengono propagati (loggati e ignorati) per non
 * far fallire l'operazione principale.
 */
export async function recomputeScore(organizationId: string): Promise<void> {
  try {
    const admin = createAdminClient();
    await admin.rpc("recompute_compliance_score", { org: organizationId });
  } catch (err) {
    console.error("[recomputeScore] failed", { organizationId, err });
  }
}
