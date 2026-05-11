export type PlanId = "free" | "pro" | "enterprise";
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
    aiSystems: number;
    documents: number;
    teamMembers: number;
    auditTrail: boolean;
    whiteLabel: boolean;
    apiAccess: boolean;
  };
}

export const PLANS: Record<PlanId, Plan> = {
  free: {
    id: "free",
    name: "Free",
    tagline: "Quiz di compliance gratuito",
    monthly: 0,
    yearly: 0,
    features: [
      "Quiz 17 domande di compliance AI Act",
      "Report con score, sistemi rilevati, obblighi",
      "Calendario scadenze 2025-2027",
      "Newsletter aggiornamenti normativi",
    ],
    limits: {
      organizations: 0,
      aiSystems: 0,
      documents: 0,
      teamMembers: 0,
      auditTrail: false,
      whiteLabel: false,
      apiAccess: false,
    },
  },
  pro: {
    id: "pro",
    name: "Pro",
    tagline: "Per la tua PMI",
    monthly: 29,
    yearly: 290,
    highlight: true,
    features: [
      "1 azienda",
      "Registro sistemi IA illimitato + classificatore rischio",
      "Vendor Intelligence (ChatGPT, Copilot, Gemini, Claude, Midjourney…)",
      "4 documenti audit-ready (Policy interna, Informativa Art.11, Disclosure Art.50, Registro formale)",
      "Modulo formazione AI literacy con tracking",
      "Alert normativi AI Act + L.132/2025",
      "Aggiornamenti automatici delle scadenze",
      "Supporto email prioritario",
    ],
    limits: {
      organizations: 1,
      aiSystems: 9999,
      documents: 9999,
      teamMembers: 3,
      auditTrail: false,
      whiteLabel: false,
      apiAccess: false,
    },
  },
  enterprise: {
    id: "enterprise",
    name: "Enterprise",
    tagline: "Per studi commercialisti, legali e consulenziali",
    monthly: 199,
    yearly: 1990,
    features: [
      "Tutto del piano Pro",
      "Multi-azienda: gestisci fino a 10 clienti (slot aggiuntivi acquistabili)",
      "Workspace dedicato per ciascun cliente",
      "Audit trail completo delle azioni",
      "White-label: logo, colori, footer personalizzati",
      "Report attività per cliente",
      "Account manager dedicato",
      "Onboarding e formazione del tuo team",
    ],
    limits: {
      organizations: 10,
      aiSystems: 99999,
      documents: 99999,
      teamMembers: 10,
      auditTrail: true,
      whiteLabel: true,
      apiAccess: false,
    },
  },
};

export const PLAN_ORDER: PlanId[] = ["free", "pro", "enterprise"];

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
