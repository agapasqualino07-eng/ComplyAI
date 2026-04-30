export type DocumentType = "privacy" | "cookie" | "terms" | "eula";

export interface PolicyAnswers {
  controllerName: string;
  vatNumber?: string;
  address?: string;
  websiteUrl: string;
  contactEmail: string;
  dpoEmail?: string;
  purposes: string[];

  usesCloudflare?: boolean;
  usesGoogleAnalytics?: boolean;
  usesMetaPixel?: boolean;
  usesStripe?: boolean;
  usesMailchimp?: boolean;
  usesHotjar?: boolean;
  otherProcessors?: string;
}

export const PURPOSES = [
  { id: "contact_form", label: "Form di contatto" },
  { id: "newsletter", label: "Newsletter / email marketing" },
  { id: "analytics", label: "Analisi statistica del sito" },
  { id: "profiling", label: "Profilazione marketing" },
  { id: "ecommerce", label: "Vendita online (e-commerce)" },
  { id: "support", label: "Assistenza clienti" },
  { id: "legal_obligations", label: "Adempimenti fiscali / contabili" },
] as const;

export const PROCESSORS = [
  { key: "usesCloudflare", label: "Cloudflare (CDN/sicurezza)" },
  { key: "usesGoogleAnalytics", label: "Google Analytics" },
  { key: "usesMetaPixel", label: "Meta Pixel (Facebook/Instagram)" },
  { key: "usesStripe", label: "Stripe (pagamenti)" },
  { key: "usesMailchimp", label: "Mailchimp (newsletter)" },
  { key: "usesHotjar", label: "Hotjar (heatmap)" },
] as const;
