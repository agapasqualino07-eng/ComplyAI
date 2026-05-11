export interface TrainingModule {
  id: string;
  title: string;
  description: string;
  durationHours: number;
  topics: string[];
  legalBasis: string;
}

export const TRAINING_MODULES: TrainingModule[] = [
  {
    id: "intro_ai_act",
    title: "Introduzione all'AI Act",
    description:
      "Quadro normativo, approccio basato sul rischio, distinzione Provider/Deployer, calendario delle scadenze.",
    durationHours: 1,
    topics: [
      "Cos'è il Regolamento UE 2024/1689",
      "Provider vs Deployer: il tuo ruolo",
      "I 4 livelli di rischio",
      "Calendario scadenze 2025-2027",
    ],
    legalBasis: "Art. 4 AI Act — Alfabetizzazione in materia di IA",
  },
  {
    id: "prohibited_high_risk",
    title: "Pratiche vietate e sistemi ad alto rischio",
    description:
      "Le 8 pratiche vietate (Art. 5), i sistemi alto rischio (Annex III), obblighi e sanzioni.",
    durationHours: 0.75,
    topics: [
      "Le 8 pratiche vietate dall'AI Act",
      "Sistemi alto rischio (HR, credito, education, sanità)",
      "Obblighi per Deployer di alto rischio",
      "Sanzioni: fino a 35M€ o 7% del fatturato",
    ],
    legalBasis: "AI Act Artt. 5, 6, 26 e Annex III",
  },
  {
    id: "responsible_use",
    title: "Uso responsabile dell'AI in azienda",
    description:
      "Linee guida operative per dipendenti che usano ChatGPT, Copilot, Gemini e altri strumenti.",
    durationHours: 0.75,
    topics: [
      "Cosa si può e non si può inserire negli strumenti AI",
      "Riservatezza, segreti aziendali, dati personali",
      "Verifica degli output e supervisione umana",
      "Trasparenza verso clienti e colleghi",
    ],
    legalBasis: "AI Act Art. 26 (obblighi Deployer) + Policy interna aziendale",
  },
  {
    id: "italian_law_132",
    title: "Legge italiana 132/2025: diritti del lavoratore",
    description:
      "Informativa scritta, intervento umano, divieto di discriminazione, professioni intellettuali.",
    durationHours: 0.5,
    topics: [
      "Art. 11: informativa AI nel rapporto di lavoro",
      "Diritto all'intervento umano",
      "Divieto di discriminazione",
      "Art. 13: AI nelle professioni intellettuali",
    ],
    legalBasis: "Legge 23/9/2025 n. 132, in vigore dal 10/10/2025",
  },
];
