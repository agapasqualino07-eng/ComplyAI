import { createAdminClient } from "@/lib/supabase/server";

/**
 * Scrive un audit log applicativo. Best-effort: errori loggati e ignorati.
 * Usa l'admin client perché il chiamante può non avere un ruolo specifico
 * sull'org (es. nei webhook); la funzione SQL log_audit valida la membership.
 */
export async function audit(params: {
  organizationId: string;
  actorId: string;
  action: string;
  targetType?: string;
  targetId?: string;
  metadata?: Record<string, any>;
}): Promise<void> {
  try {
    const admin = createAdminClient();
    await admin.from("audit_logs").insert({
      organization_id: params.organizationId,
      actor_id: params.actorId,
      action: params.action,
      target_type: params.targetType ?? null,
      target_id: params.targetId ?? null,
      metadata: params.metadata ?? {},
    });
  } catch (err) {
    console.error("[audit] failed", { action: params.action, err });
  }
}
