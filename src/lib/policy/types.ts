export type DocumentType =
  | "ai_use_policy"
  | "ai_employee_notice"
  | "ai_disclosure"
  | "ai_registry_export";

export interface PolicyAnswers {
  controllerName: string;
  vatNumber?: string;
  address?: string;
  websiteUrl?: string;
  contactEmail: string;
  dpoEmail?: string;

  // Specifici AI Act
  sector?: string;
  approvedTools?: string;
  prohibitedUseCases?: string;
  hasHumanReviewProcess?: boolean;
  trainingProvided?: boolean;
  appliesToProfessions?: boolean;

  // Sistemi AI rilevanti
  aiSystemsList?: Array<{
    name: string;
    vendor?: string | null;
    purpose?: string | null;
    category?: string | null;
  }>;
}

export const DOC_LABELS: Record<DocumentType, { title: string; subtitle: string; audience: string }> = {
  ai_use_policy: {
    title: "Policy Interna sull'uso dell'IA",
    subtitle: "Regole interne per dipendenti e collaboratori",
    audience: "Documento interno aziendale",
  },
  ai_employee_notice: {
    title: "Informativa AI ai dipendenti",
    subtitle: "Art. 11 Legge 132/2025",
    audience: "Consegna scritta ai lavoratori",
  },
  ai_disclosure: {
    title: "Informativa Trasparenza AI ai clienti",
    subtitle: "Art. 50 AI Act",
    audience: "Pubblica, da pubblicare sul sito",
  },
  ai_registry_export: {
    title: "Registro formale Sistemi AI",
    subtitle: "Export audit-ready del registro IA",
    audience: "Documentazione interna / audit",
  },
};
