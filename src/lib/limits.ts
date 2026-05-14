import { createAdminClient } from "@/lib/supabase/server";
import { PLANS, type PlanId } from "@/lib/plans";

/**
 * Recupera il piano effettivo di un'organizzazione.
 * - In trial: si applicano i limiti del piano "pro" (la prova gratuita dà accesso pro).
 * - Altrimenti: il piano effettivo della subscription (o "free" se nessuna sub).
 */
export async function getEffectivePlan(organizationId: string): Promise<PlanId> {
  const admin = createAdminClient();
  const { data: sub } = await admin
    .from("subscriptions")
    .select("plan, status, trial_end")
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (!sub) return "free";

  const now = Date.now();
  const trialActive =
    sub.status === "trialing" &&
    sub.trial_end &&
    new Date(sub.trial_end).getTime() > now;

  if (trialActive) return "pro";

  if (["active", "past_due"].includes(sub.status as string)) {
    return (sub.plan as PlanId) ?? "free";
  }

  return "free";
}

type LimitKey = "aiSystems" | "documents" | "teamMembers";

/**
 * Ritorna { allowed: true } o { allowed: false, reason } se la creazione
 * di una nuova entità eccede il limite del piano corrente.
 */
export async function enforceLimit(
  organizationId: string,
  resource: LimitKey,
): Promise<{ allowed: true } | { allowed: false; reason: string }> {
  const plan = await getEffectivePlan(organizationId);
  const planDef = PLANS[plan];
  const limit = planDef.limits[resource];

  const admin = createAdminClient();
  let count = 0;
  if (resource === "aiSystems") {
    const { count: c } = await admin
      .from("ai_systems")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", organizationId);
    count = c ?? 0;
  } else if (resource === "documents") {
    const { count: c } = await admin
      .from("documents")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", organizationId);
    count = c ?? 0;
  } else if (resource === "teamMembers") {
    const { count: c } = await admin
      .from("org_members")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", organizationId);
    count = c ?? 0;
  }

  if (count >= limit) {
    return {
      allowed: false,
      reason: `Hai raggiunto il limite del piano ${planDef.name} per ${resource} (${limit}). Effettua l'upgrade per continuare.`,
    };
  }
  return { allowed: true };
}

/**
 * Ritorna { allowed: true } se l'utente può creare una nuova org, false altrimenti.
 * Si basa sul piano dell'utente (somma su tutte le sue org owner): la prima
 * org viene sempre concessa (entry-flow). Quelle successive solo se il piano
 * più alto consente più di 1 org.
 */
export async function enforceOrgCreation(
  userId: string,
): Promise<{ allowed: true } | { allowed: false; reason: string }> {
  const admin = createAdminClient();
  const { count } = await admin
    .from("organizations")
    .select("id", { count: "exact", head: true })
    .eq("owner_id", userId);

  const owned = count ?? 0;
  if (owned === 0) return { allowed: true }; // Primo onboarding sempre OK

  // Per le org successive: trova il piano più alto fra le sue org
  const { data: orgs } = await admin
    .from("organizations")
    .select("id")
    .eq("owner_id", userId);

  let maxLimit = 0;
  for (const o of orgs ?? []) {
    const plan = await getEffectivePlan((o as { id: string }).id);
    maxLimit = Math.max(maxLimit, PLANS[plan].limits.organizations);
  }

  if (owned >= maxLimit) {
    return {
      allowed: false,
      reason: `Il tuo piano consente fino a ${maxLimit} organizzazione/i. Passa a Enterprise per gestirne di più.`,
    };
  }
  return { allowed: true };
}
