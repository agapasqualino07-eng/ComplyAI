// Quiz di compliance AI Act (17 domande) — lead magnet.
// L'output produce: score 0-100, sistemi AI rilevati, classificazione rischio,
// obblighi applicabili. Allineato a AI Act (Reg. UE 2024/1689) + L. 132/2025.

export type AnswerValue = string | string[] | boolean | null;

export interface QuizQuestion {
  id: string;
  type: "single" | "multi" | "yesno";
  title: string;
  help?: string;
  options?: { value: string; label: string; flagsSystem?: string }[];
  // Punteggio: -X riduce, +X aumenta.
  scoreYes?: number;
  scoreNo?: number;
}

export const QUIZ: QuizQuestion[] = [
  {
    id: "sector",
    type: "single",
    title: "In quale settore opera la tua azienda?",
    options: [
      { value: "sanita", label: "Sanità e benessere" },
      { value: "education", label: "Istruzione e formazione" },
      { value: "finance", label: "Finanza, credito, assicurazioni" },
      { value: "hr_recruitment", label: "HR / Recruiting" },
      { value: "manufacturing", label: "Manifattura, industria" },
      { value: "retail_ecommerce", label: "Retail / E-commerce" },
      { value: "professional", label: "Professioni intellettuali (avvocati, commercialisti, ingegneri)" },
      { value: "marketing", label: "Marketing, comunicazione, agenzie" },
      { value: "tech", label: "Software / Tech / Sviluppo prodotto" },
      { value: "pa", label: "Pubblica Amministrazione" },
      { value: "altro", label: "Altro" },
    ],
  },
  {
    id: "employees",
    type: "single",
    title: "Quanti dipendenti ha la tua azienda?",
    options: [
      { value: "1-9", label: "1-9 (micro impresa)" },
      { value: "10-49", label: "10-49 (piccola)" },
      { value: "50-249", label: "50-249 (media)" },
      { value: "250+", label: "250+ (grande)" },
    ],
  },
  {
    id: "uses_chatgpt",
    type: "yesno",
    title: "Tu o i tuoi dipendenti usate ChatGPT, Claude o Gemini per email, contenuti o documenti?",
    help: "Anche solo per riassumere, tradurre, generare bozze",
    scoreYes: -8,
    scoreNo: 0,
  },
  {
    id: "uses_copilot",
    type: "yesno",
    title: "Usate Microsoft 365 Copilot o GitHub Copilot in azienda?",
    help: "Copilot M365 è spesso attivo di default sui tenant aziendali",
    scoreYes: -8,
    scoreNo: 0,
  },
  {
    id: "uses_chatbot",
    type: "yesno",
    title: "Avete un chatbot AI sul sito web, app o WhatsApp clienti?",
    scoreYes: -6,
    scoreNo: 0,
  },
  {
    id: "uses_image_gen",
    type: "yesno",
    title: "Usate AI per generare immagini, video o audio (Midjourney, DALL-E, ElevenLabs, Runway)?",
    scoreYes: -6,
    scoreNo: 0,
  },
  {
    id: "uses_crm_ai",
    type: "yesno",
    title: "Il vostro CRM o gestionale ha funzioni AI (lead scoring, suggerimenti, email automatiche AI)?",
    scoreYes: -4,
    scoreNo: 0,
  },
  {
    id: "uses_hr_ai",
    type: "yesno",
    title: "Usate AI per screening CV, valutazione candidati o scoring dei dipendenti?",
    help: "ATTENZIONE: questo è considerato ALTO RISCHIO dall'AI Act (Annex III §4)",
    scoreYes: -15,
    scoreNo: 0,
  },
  {
    id: "uses_credit_scoring",
    type: "yesno",
    title: "Usate AI per valutare l'accesso a credito, assicurazioni o decidere prezzi personalizzati su clienti?",
    help: "Anche questo è considerato ALTO RISCHIO (Annex III §5)",
    scoreYes: -15,
    scoreNo: 0,
  },
  {
    id: "uses_biometric",
    type: "yesno",
    title: "Usate riconoscimento facciale, vocale o di emozioni in qualsiasi contesto?",
    help: "Il riconoscimento emozioni al lavoro o a scuola è VIETATO (Art. 5)",
    scoreYes: -20,
    scoreNo: 0,
  },
  {
    id: "info_employees",
    type: "yesno",
    title: "Hai dato un'informativa SCRITTA ai dipendenti sull'uso di AI in azienda?",
    help: "Obbligatorio per legge italiana 132/2025, Art. 11, dal 10 ottobre 2025",
    scoreYes: 12,
    scoreNo: -10,
  },
  {
    id: "training_done",
    type: "yesno",
    title: "Hai formato i dipendenti sull'uso responsabile dell'AI (AI literacy)?",
    help: "Obbligatorio dall'AI Act Art. 4, dal 2 febbraio 2025",
    scoreYes: 10,
    scoreNo: -8,
  },
  {
    id: "has_registry",
    type: "yesno",
    title: "Hai un registro interno dei sistemi AI usati dalla tua azienda?",
    scoreYes: 10,
    scoreNo: -5,
  },
  {
    id: "policy_internal",
    type: "yesno",
    title: "Hai una policy interna scritta che regola come i dipendenti possono usare l'AI?",
    scoreYes: 8,
    scoreNo: -6,
  },
  {
    id: "info_clients",
    type: "yesno",
    title: "Se usate AI verso clienti (chatbot, contenuti AI), avete una disclosure pubblica?",
    help: "Obbligatorio dall'Art. 50 AI Act (operativo da agosto 2026, ma consigliato già ora)",
    scoreYes: 8,
    scoreNo: -5,
  },
  {
    id: "knows_role",
    type: "yesno",
    title: "Sai distinguere se la tua azienda è 'Provider' o 'Deployer' secondo l'AI Act?",
    help: "Deployer = usi AI di terzi (la maggior parte delle PMI). Provider = sviluppi AI",
    scoreYes: 5,
    scoreNo: -3,
  },
  {
    id: "knows_deadlines",
    type: "yesno",
    title: "Conosci le scadenze AI Act applicabili (2/2/2025, 2/8/2025, 2/8/2026)?",
    scoreYes: 5,
    scoreNo: -3,
  },
];

export interface QuizResult {
  score: number;
  riskLevel: "critical" | "warning" | "info";
  systemsDetected: string[];
  prohibitedSuspected: boolean;
  highRiskSuspected: boolean;
  obligations: string[];
  recommendations: string[];
}

export function evaluate(answers: Record<string, AnswerValue>): QuizResult {
  let score = 30; // base
  const systemsDetected: string[] = [];
  const obligations: string[] = [];
  const recommendations: string[] = [];

  for (const q of QUIZ) {
    const a = answers[q.id];
    if (q.type === "yesno") {
      if (a === true || a === "yes") {
        score += q.scoreYes ?? 0;
      } else if (a === false || a === "no") {
        score += q.scoreNo ?? 0;
      }
    }
  }

  // Rilevamento sistemi
  if (answers.uses_chatgpt === true) systemsDetected.push("ChatGPT / Claude / Gemini");
  if (answers.uses_copilot === true) systemsDetected.push("Microsoft Copilot");
  if (answers.uses_chatbot === true) systemsDetected.push("Chatbot clienti");
  if (answers.uses_image_gen === true) systemsDetected.push("Generatori immagini/video/audio AI");
  if (answers.uses_crm_ai === true) systemsDetected.push("CRM/gestionale con AI");
  if (answers.uses_hr_ai === true) systemsDetected.push("Screening CV / scoring HR AI");
  if (answers.uses_credit_scoring === true) systemsDetected.push("Scoring credito/assicurazioni AI");
  if (answers.uses_biometric === true) systemsDetected.push("Riconoscimento biometrico");

  const prohibitedSuspected = answers.uses_biometric === true;
  const highRiskSuspected =
    answers.uses_hr_ai === true || answers.uses_credit_scoring === true || answers.sector === "sanita" || answers.sector === "education";

  // Obblighi
  obligations.push(
    "AI literacy: garantire formazione adeguata a chi usa AI (Art. 4 AI Act, in vigore dal 2/2/2025).",
  );
  if (systemsDetected.length > 0) {
    obligations.push(
      "Mantenere un registro interno dei sistemi AI usati, con finalità, ruolo (Provider/Deployer), classificazione rischio.",
    );
  }
  if (answers.uses_chatgpt === true || answers.uses_copilot === true) {
    obligations.push(
      "Informativa scritta ai dipendenti sull'uso dell'AI (Art. 11 L.132/2025, dal 10/10/2025).",
    );
  }
  if (answers.uses_chatbot === true) {
    obligations.push("Dichiarare agli utenti del chatbot che stanno interagendo con un'AI (Art. 50.1 AI Act).");
  }
  if (answers.uses_image_gen === true) {
    obligations.push("Marcare i contenuti AI-generated (Art. 50.2 AI Act, watermarking obbligatorio dal 2/11/2026).");
  }
  if (highRiskSuspected) {
    obligations.push(
      "Il tuo settore/uso ricade probabilmente nell'alto rischio (Annex III). Da 2/8/2026: sistema gestione rischio, documentazione tecnica, supervisione umana, registrazione UE.",
    );
  }
  if (prohibitedSuspected) {
    obligations.push(
      "ATTENZIONE: il riconoscimento emozioni in luoghi di lavoro o scuola è VIETATO (Art. 5). Verifica subito che l'uso non rientri tra le pratiche vietate.",
    );
  }
  if (answers.sector === "professional") {
    obligations.push(
      "Professioni intellettuali: informativa al cliente con linguaggio chiaro e semplice (Art. 13 L.132/2025). Il lavoro umano deve prevalere.",
    );
  }
  if (answers.sector === "sanita") {
    obligations.push(
      "Sanità: l'AI è supporto, non sostituisce il giudizio clinico (Artt. 7, 10 L.132/2025). Paziente informato.",
    );
  }

  // Raccomandazioni
  if (answers.info_employees === false) recommendations.push("Redigi e firma l'informativa AI per i dipendenti.");
  if (answers.training_done === false) recommendations.push("Pianifica un percorso di AI literacy per i dipendenti.");
  if (answers.has_registry === false) recommendations.push("Crea il registro interno dei sistemi AI in uso.");
  if (answers.policy_internal === false) recommendations.push("Adotta una policy aziendale scritta sull'uso dell'AI.");
  if (answers.info_clients === false && (answers.uses_chatbot === true || answers.uses_image_gen === true)) {
    recommendations.push("Pubblica un'informativa di trasparenza ai clienti sull'uso dell'AI.");
  }

  const finalScore = Math.max(0, Math.min(100, score));
  let riskLevel: "critical" | "warning" | "info" = "info";
  if (prohibitedSuspected || finalScore < 40) riskLevel = "critical";
  else if (highRiskSuspected || finalScore < 70) riskLevel = "warning";

  return {
    score: finalScore,
    riskLevel,
    systemsDetected,
    prohibitedSuspected,
    highRiskSuspected,
    obligations,
    recommendations,
  };
}
