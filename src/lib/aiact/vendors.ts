// Catalogo vendor pre-configurato (Vendor Intelligence).
// Aiuta l'utente a riconoscere strumenti AI comuni e a comprendere
// i rischi specifici di ognuno.

export interface VendorInfo {
  key: string;
  name: string;
  provider: string;
  vendorUrl: string;
  category: "vietato" | "alto" | "trasparenza" | "gpai" | "minimo";
  description: string;
  riskNotes: string;
  defaultObligation: string;
  defaultPurpose: string;
  icon: string; // emoji o lettera per UI semplice
}

export const VENDOR_CATALOG: Record<string, VendorInfo> = {
  chatgpt: {
    key: "chatgpt",
    name: "ChatGPT",
    provider: "OpenAI",
    vendorUrl: "https://openai.com",
    category: "gpai",
    description: "Modello linguistico generativo per testo, traduzioni, riassunti, supporto operativo.",
    riskNotes:
      "I dati inseriti possono essere usati per l'addestramento sui piani Free/Plus. Su piano Team/Enterprise i dati sono esclusi da training (con DPA firmato). Verifica sempre il piano in uso.",
    defaultObligation:
      "Stipulare DPA con OpenAI, disabilitare data sharing per training, informare i dipendenti per iscritto sull'uso (Art. 11 L.132/2025), istruire sul divieto di inserire dati riservati.",
    defaultPurpose: "Assistenza alla scrittura, analisi documenti, supporto operativo dipendenti",
    icon: "🤖",
  },
  gemini: {
    key: "gemini",
    name: "Gemini",
    provider: "Google",
    vendorUrl: "https://gemini.google.com",
    category: "gpai",
    description: "Assistente AI integrato in Google Workspace (Docs, Gmail, Sheets) e disponibile come app autonoma.",
    riskNotes:
      "Su Workspace business i dati restano nel tenant del cliente e non sono usati per il training. Sul consumer (gemini.google.com gratuito) lo sono.",
    defaultObligation:
      "Assicurarsi che l'uso sia su un account Workspace business (non personale), DPA tramite Google Workspace, informativa scritta ai dipendenti.",
    defaultPurpose: "Produttività in Workspace: riassunti email, supporto documenti, analisi fogli",
    icon: "✨",
  },
  copilot_m365: {
    key: "copilot_m365",
    name: "Microsoft 365 Copilot",
    provider: "Microsoft",
    vendorUrl: "https://www.microsoft.com/copilot",
    category: "gpai",
    description: "Assistente AI integrato in M365 (Word, Excel, Outlook, Teams) — usa GPT-4 dietro le quinte.",
    riskNotes:
      "ATTENZIONE: spesso attivo automaticamente nei tenant M365 a insaputa dei dipendenti. Accede a tutti i dati cui ha accesso l'utente (email, file SharePoint).",
    defaultObligation:
      "Audit dei permessi: Copilot eredita gli accessi dell'utente. Configurare data protection, DPA Microsoft, informativa scritta ai dipendenti, formazione sull'uso responsabile.",
    defaultPurpose: "Produttività in Microsoft 365: riassunti, generazione contenuti, analisi",
    icon: "🅼",
  },
  copilot_github: {
    key: "copilot_github",
    name: "GitHub Copilot",
    provider: "GitHub (Microsoft)",
    vendorUrl: "https://github.com/features/copilot",
    category: "gpai",
    description: "Assistente AI per la scrittura di codice integrato in IDE.",
    riskNotes:
      "Può suggerire codice derivato da repo pubblici, con potenziali implicazioni di licenza. Piano Business/Enterprise esclude i dati dal training.",
    defaultObligation:
      "Piano Business minimo, policy interna sull'uso (review obbligatoria dei suggerimenti), divieto di inserire credenziali/segreti, formazione developer.",
    defaultPurpose: "Supporto sviluppo software: completamento codice, refactoring",
    icon: "🐙",
  },
  claude: {
    key: "claude",
    name: "Claude",
    provider: "Anthropic",
    vendorUrl: "https://claude.ai",
    category: "gpai",
    description: "Modello linguistico generativo orientato a sicurezza e ragionamento complesso.",
    riskNotes:
      "Su piano Team/Enterprise: nessun uso dei dati per training (DPA disponibile). Server in UE disponibili tramite AWS Bedrock.",
    defaultObligation:
      "Piano Team/Enterprise, DPA firmato, hosting UE se i dati sono sensibili, informativa scritta ai dipendenti.",
    defaultPurpose: "Analisi documenti complessi, supporto operativo, redazione",
    icon: "🧠",
  },
  midjourney: {
    key: "midjourney",
    name: "Midjourney",
    provider: "Midjourney Inc.",
    vendorUrl: "https://midjourney.com",
    category: "trasparenza",
    description: "Generazione immagini AI.",
    riskNotes:
      "Sui piani Basic/Standard le immagini generate sono PUBBLICHE e visibili nella community. Solo il piano Pro consente generazioni private.",
    defaultObligation:
      "Piano Pro per uso commerciale con immagini private, dichiarazione che le immagini sono AI-generated (Art. 50 AI Act), watermarking dal 2/8/2026.",
    defaultPurpose: "Generazione asset visivi marketing",
    icon: "🎨",
  },
  elevenlabs: {
    key: "elevenlabs",
    name: "ElevenLabs",
    provider: "ElevenLabs Inc.",
    vendorUrl: "https://elevenlabs.io",
    category: "trasparenza",
    description: "Generazione voce sintetica e cloning vocale AI.",
    riskNotes:
      "Voice cloning può integrare il riconoscimento biometrico. Se usato per impersonare persone reali può ricadere nei deepfake (Art. 50 + Art. 5 se manipolativo).",
    defaultObligation:
      "Dichiarazione esplicita che il contenuto è AI-generated (Art. 50.4), divieto cloning senza consenso, watermarking dal 2/8/2026.",
    defaultPurpose: "Audio sintetico per video, podcast, contenuti",
    icon: "🔊",
  },
  hr_screening: {
    key: "hr_screening",
    name: "Software HR con screening AI",
    provider: "Vario (Workday, LinkedIn Talent Insights, ecc.)",
    vendorUrl: "",
    category: "alto",
    description: "Strumenti che fanno scoring/ranking automatico di CV o candidati.",
    riskNotes:
      "ALTO RISCHIO (Annex III §4). Decisioni che impattano persone in ambito lavorativo. Obblighi pieni dal 2/8/2026, ma già oggi richiede informativa dipendenti Art. 11 L.132/2025.",
    defaultObligation:
      "Sistema di gestione del rischio, supervisione umana obbligatoria, dataset privi di bias, documentazione tecnica, registrazione database UE (entro 2/8/2026). Informativa lavoratori subito.",
    defaultPurpose: "Selezione e valutazione personale",
    icon: "👔",
  },
  credit_scoring: {
    key: "credit_scoring",
    name: "AI scoring credito/assicurazioni",
    provider: "Vario",
    vendorUrl: "",
    category: "alto",
    description: "Sistemi che valutano automaticamente l'accesso a credito, assicurazioni, rateizzazioni.",
    riskNotes: "ALTO RISCHIO (Annex III §5). Decisioni su accesso a servizi essenziali.",
    defaultObligation:
      "Conformity assessment, sistema gestione rischio, supervisione umana, informativa al cliente sull'uso AI nella decisione (Art. 13 AI Act + Art. 50).",
    defaultPurpose: "Valutazione automatica accesso credito",
    icon: "💳",
  },
  customer_chatbot: {
    key: "customer_chatbot",
    name: "Chatbot clienti (Intercom, Drift, custom)",
    provider: "Vario",
    vendorUrl: "",
    category: "trasparenza",
    description: "Chatbot AI che assiste clienti sul sito o WhatsApp.",
    riskNotes: "RISCHIO LIMITATO (Art. 50.1). Va dichiarato che il cliente sta parlando con AI.",
    defaultObligation:
      "Disclosure all'inizio della conversazione: 'Stai parlando con un assistente AI'. Opzione di chiedere operatore umano.",
    defaultPurpose: "Assistenza clienti automatizzata",
    icon: "💬",
  },
};

export const VENDOR_LIST = Object.values(VENDOR_CATALOG);
