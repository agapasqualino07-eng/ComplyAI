export type PlanId = "free" | "solo" | "pro" | "business" | "enterprise";
export type Cadence = "monthly" | "yearly";

export interface Plan {
  id: PlanId;
  name: string;
  tagline: string;
  monthly: number | null;
  yearly: number | null;
  features: string[];
  highlight?: boolean;
  limits: {
    organizations: number;
    sites: number;
    documents: number;
    consentLogsPerMonth: number;
    customBranding: boolean;
    apiAccess: boolean;
    auditLog: boolean;
    teamMembers: number;
  };
}

export const PLANS: Record<PlanId, Plan> = {
  free: {
    id: "free",
    name: "Trial",
    tagline: "Prova ComplyAI per 14 giorni",
    monthly: 0,
    yearly: 0,
    features: [
      "1 sito con banner watermark",
      "Privacy & Cookie Policy con marchio ComplyAI",
      "Registro consensi (ultimi 7 giorni)",
      "Supporto email base",
    ],
    limits: {
      organizations: 1,
      sites: 1,
      documents: 2,
      consentLogsPerMonth: 1000,
      customBranding: false,
      apiAccess: false,
      auditLog: false,
      teamMembers: 1,
    },
  },
  solo: {
    id: "solo",
    name: "Solo",
    tagline: "Per freelance e piccoli professionisti",
    monthly: 14,
    yearly: 119,
    features: [
      "1 sito web",
      "Privacy + Cookie Policy + Termini",
      "CMP banner senza watermark",
      "Registro consensi illimitato",
      "Aggiornamenti normativi automatici",
      "Supporto email",
    ],
    limits: {
      organizations: 1,
      sites: 1,
      documents: 10,
      consentLogsPerMonth: 50000,
      customBranding: false,
      apiAccess: false,
      auditLog: false,
      teamMembers: 1,
    },
  },
  pro: {
    id: "pro",
    name: "Pro",
    tagline: "Per PMI e professionisti strutturati",
    monthly: 29,
    yearly: 249,
    highlight: true,
    features: [
      "Fino a 5 siti web",
      "Tutti i generatori (Privacy, Cookie, Termini, EULA)",
      "CMP banner personalizzabile",
      "Registro consensi + export CSV/PDF",
      "Registro trattamenti GDPR",
      "Cookie scanner automatico",
      "Supporto prioritario",
      "2 utenti team",
    ],
    limits: {
      organizations: 1,
      sites: 5,
      documents: 50,
      consentLogsPerMonth: 250000,
      customBranding: false,
      apiAccess: false,
      auditLog: true,
      teamMembers: 2,
    },
  },
  business: {
    id: "business",
    name: "Business",
    tagline: "Per e-commerce e SaaS in crescita",
    monthly: 59,
    yearly: 499,
    features: [
      "Siti illimitati su 1 azienda",
      "Tutto del piano Pro",
      "White-label parziale (rimuovi marchio)",
      "Audit log avanzato",
      "DPA fornitori",
      "Webhooks consensi",
      "Supporto telefonico",
      "5 utenti team",
    ],
    limits: {
      organizations: 1,
      sites: 9999,
      documents: 9999,
      consentLogsPerMonth: 2000000,
      customBranding: true,
      apiAccess: false,
      auditLog: true,
      teamMembers: 5,
    },
  },
  enterprise: {
    id: "enterprise",
    name: "Enterprise / Agency",
    tagline: "Per agenzie e commercialisti che gestiscono più clienti",
    monthly: 99,
    yearly: 899,
    features: [
      "Aziende illimitate (multi-tenant)",
      "Tutto del piano Business",
      "Accesso API completo",
      "Account manager dedicato",
      "SLA garantito 99.9%",
      "Onboarding personalizzato",
      "Utenti illimitati",
      "Fatturazione consolidata",
    ],
    limits: {
      organizations: 9999,
      sites: 9999,
      documents: 9999,
      consentLogsPerMonth: 99999999,
      customBranding: true,
      apiAccess: true,
      auditLog: true,
      teamMembers: 9999,
    },
  },
};

export const PLAN_ORDER: PlanId[] = ["free", "solo", "pro", "business", "enterprise"];

export function getStripePriceId(plan: PlanId, cadence: Cadence): string | null {
  if (plan === "free") return null;
  const key = `STRIPE_PRICE_${plan.toUpperCase()}_${cadence.toUpperCase()}`;
  return process.env[key] || null;
}

export function planFromPriceId(priceId: string): { plan: PlanId; cadence: Cadence } | null {
  for (const plan of PLAN_ORDER) {
    if (plan === "free") continue;
    for (const cadence of ["monthly", "yearly"] as Cadence[]) {
      if (process.env[`STRIPE_PRICE_${plan.toUpperCase()}_${cadence.toUpperCase()}`] === priceId) {
        return { plan, cadence };
      }
    }
  }
  return null;
}
