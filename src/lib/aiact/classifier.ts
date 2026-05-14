// Classificatore rischio AI Act (Regolamento UE 2024/1689).
// NOTA: fornisce un orientamento; valutazioni finali su sistemi high-risk
// richiedono comunque un legal review specialistico.

export type AIRisk = "prohibited" | "high" | "limited" | "minimal" | "gpai";
export type AIRole = "provider" | "deployer" | "distributor" | "importer";

export interface ClassifierAnswers {
  // Pratiche vietate (Art. 5)
  usesSubliminalTechniques?: boolean;
  exploitsVulnerabilities?: boolean;
  socialScoring?: boolean;
  predictivePolicingNatural?: boolean;
  emotionRecognitionAtWorkOrSchool?: boolean;
  biometricCategorizationSensitive?: boolean;
  realtimeRBIPublic?: boolean;
  untargetedFacialScraping?: boolean;

  // Annex III (high-risk areas)
  isSafetyComponentRegulated?: boolean; // Annex I
  domain?:
    | "biometrics"
    | "critical_infrastructure"
    | "education"
    | "employment_hr"
    | "essential_services"
    | "law_enforcement"
    | "migration_asylum"
    | "justice_democracy"
    | "none";

  // Limited risk / trasparenza (Art. 50)
  interactsWithUsers?: boolean; // chatbot, voice assistant
  generatesContent?: boolean; // testi, immagini, audio, video
  deepfake?: boolean;
  emotionRecognitionOther?: boolean;
  biometricCategorizationOther?: boolean;

  // GPAI
  isGeneralPurposeModel?: boolean;
  trainingComputeFlops?: number;
}

export interface ClassifierResult {
  risk: AIRisk;
  reasons: string[];
  obligations: string[];
  references: string[];
}

const HIGH_RISK_DOMAINS: Record<string, string> = {
  biometrics: "Annex III §1 — Biometria (identificazione, categorizzazione, riconoscimento emozioni in contesti regolati)",
  critical_infrastructure: "Annex III §2 — Gestione infrastrutture critiche (acqua, gas, elettricità, traffico)",
  education: "Annex III §3 — Istruzione e formazione professionale (ammissione, valutazione, monitoraggio)",
  employment_hr: "Annex III §4 — Lavoro e gestione del personale (selezione, valutazione, allocazione task)",
  essential_services: "Annex III §5 — Accesso a servizi essenziali pubblici/privati (credito, welfare, assicurazioni)",
  law_enforcement: "Annex III §6 — Forze dell'ordine",
  migration_asylum: "Annex III §7 — Gestione migrazione, asilo e controllo frontiere",
  justice_democracy: "Annex III §8 — Amministrazione della giustizia e processi democratici",
};

export function classify(a: ClassifierAnswers): ClassifierResult {
  const reasons: string[] = [];
  const refs: string[] = [];

  // 1. Verifica pratiche VIETATE (Art. 5)
  const prohibitedFlags: Array<[boolean | undefined, string]> = [
    [a.usesSubliminalTechniques, "Tecniche subliminali o manipolative oltre la consapevolezza"],
    [a.exploitsVulnerabilities, "Sfruttamento di vulnerabilità (età, disabilità, status socio-economico)"],
    [a.socialScoring, "Social scoring di persone fisiche da parte di autorità pubbliche o per loro conto"],
    [a.predictivePolicingNatural, "Predictive policing su persone fisiche basato su profilazione"],
    [a.emotionRecognitionAtWorkOrSchool, "Riconoscimento emozioni in luoghi di lavoro o istituti scolastici"],
    [a.biometricCategorizationSensitive, "Categorizzazione biometrica per attributi sensibili (etnia, religione, orientamento)"],
    [a.realtimeRBIPublic, "Identificazione biometrica remota in tempo reale in spazi pubblici"],
    [a.untargetedFacialScraping, "Scraping non mirato di immagini facciali da internet o CCTV"],
  ];
  const prohibited = prohibitedFlags.filter(([v]) => v).map(([, r]) => r);
  if (prohibited.length > 0) {
    return {
      risk: "prohibited",
      reasons: prohibited,
      obligations: [
        "Il sistema rientra tra le pratiche vietate dall'AI Act (Art. 5).",
        "L'uso, l'immissione sul mercato o la messa in servizio di questo sistema è VIETATO nell'UE.",
        "Devi cessare immediatamente l'uso o riprogettare il sistema escludendo le caratteristiche vietate.",
      ],
      references: ["AI Act, Art. 5 — Pratiche di IA vietate"],
    };
  }

  // 2. GPAI (general-purpose AI)
  if (a.isGeneralPurposeModel) {
    const isSystemic = (a.trainingComputeFlops || 0) >= 1e25;
    const obligations = [
      "Documentazione tecnica del modello (Art. 53).",
      "Policy di rispetto del copyright sui dati di training (Art. 53(1)(c)).",
      "Sintesi pubblica dei contenuti usati per l'addestramento (Art. 53(1)(d)).",
      "Cooperazione con AI Office e autorità nazionali.",
    ];
    if (isSystemic) {
      obligations.push(
        "Obblighi rafforzati per modelli con rischio sistemico (Art. 55): valutazione modelli, mitigazione rischi sistemici, cybersecurity, incident reporting.",
      );
    }
    refs.push("AI Act, Capo V — Modelli di IA per finalità generali");
    return {
      risk: "gpai",
      reasons: [
        isSystemic
          ? "Modello GPAI con rischio sistemico (training compute ≥ 10^25 FLOPs)"
          : "Modello GPAI (general-purpose AI)",
      ],
      obligations,
      references: refs,
    };
  }

  // 3. Verifica HIGH-RISK
  if (a.isSafetyComponentRegulated) {
    refs.push("AI Act, Art. 6(1) e Annex I");
    reasons.push("Il sistema è componente di sicurezza di un prodotto regolato (Annex I)");
  }
  if (a.domain && a.domain !== "none" && HIGH_RISK_DOMAINS[a.domain]) {
    refs.push(`AI Act, Art. 6(2) e ${HIGH_RISK_DOMAINS[a.domain]}`);
    reasons.push(`Il sistema opera in un'area ad alto rischio (Annex III): ${HIGH_RISK_DOMAINS[a.domain]}`);
  }

  if (reasons.length > 0) {
    return {
      risk: "high",
      reasons,
      obligations: [
        "Sistema di gestione del rischio documentato (Art. 9).",
        "Data governance: dataset di training/test rappresentativi, accurati, privi di bias (Art. 10).",
        "Documentazione tecnica completa (Annex IV) e log automatici (Art. 11-12).",
        "Trasparenza e istruzioni d'uso al deployer (Art. 13).",
        "Misure di sorveglianza umana effettive (Art. 14).",
        "Accuratezza, robustezza e cybersecurity adeguate (Art. 15).",
        "Sistema di gestione qualità (Art. 17) — per Provider.",
        "Conformity assessment + marcatura CE + dichiarazione di conformità — per Provider.",
        "Registrazione nel database EU dei sistemi high-risk (Art. 49) — per Provider.",
        "FRIA (Fundamental Rights Impact Assessment) — per Deployer pubblici o di servizi essenziali (Art. 27).",
        "Monitoraggio post-immissione in commercio + segnalazione incidenti gravi (Art. 72-73).",
      ],
      references: refs,
    };
  }

  // 4. Verifica RISCHIO LIMITATO (obblighi di trasparenza, Art. 50)
  const limitedReasons: string[] = [];
  const limitedObligations: string[] = [];
  if (a.interactsWithUsers) {
    limitedReasons.push("Il sistema interagisce direttamente con persone fisiche");
    limitedObligations.push(
      "Informare l'utente che sta interagendo con un sistema AI (chatbot, voice assistant), salvo che sia evidente dal contesto. (Art. 50(1))",
    );
  }
  if (a.generatesContent || a.deepfake) {
    limitedReasons.push("Il sistema genera o manipola contenuti sintetici");
    limitedObligations.push(
      "Marcare in modo machine-readable i contenuti AI-generated/AI-modified, abilitando rilevamento. (Art. 50(2))",
    );
    if (a.deepfake) {
      limitedObligations.push(
        "Per deepfake: dichiarazione visibile/udibile che il contenuto è artificiale. (Art. 50(4))",
      );
    }
  }
  if (a.emotionRecognitionOther) {
    limitedReasons.push("Sistema di riconoscimento emozioni (in contesti non vietati)");
    limitedObligations.push(
      "Informare la persona esposta del funzionamento del sistema. (Art. 50(3))",
    );
  }
  if (a.biometricCategorizationOther) {
    limitedReasons.push("Categorizzazione biometrica (in contesti non vietati)");
    limitedObligations.push(
      "Informare la persona del funzionamento del sistema. (Art. 50(3))",
    );
  }
  if (limitedReasons.length > 0) {
    return {
      risk: "limited",
      reasons: limitedReasons,
      obligations: [
        ...limitedObligations,
        "Tieni evidenza documentale delle informative fornite agli utenti.",
      ],
      references: ["AI Act, Art. 50 — Obblighi di trasparenza"],
    };
  }

  // 5. Default: rischio MINIMO
  return {
    risk: "minimal",
    reasons: ["Il sistema non rientra nelle categorie a rischio specifico dell'AI Act"],
    obligations: [
      "Nessun obbligo specifico AI Act.",
      "Adempi comunque alle norme generali (GDPR, sicurezza prodotto, responsabilità civile).",
      "Garantisci AI literacy ai dipendenti che usano il sistema (Art. 4 — applicabile a tutti i livelli di rischio dal 2/2/2025).",
    ],
    references: ["AI Act, Art. 4 — Alfabetizzazione in materia di IA"],
  };
}

export const RISK_LABELS: Record<AIRisk, { label: string; color: string; description: string }> = {
  prohibited: {
    label: "VIETATO",
    color: "bg-red-100 text-red-800 border-red-200",
    description: "Pratica di IA vietata dall'AI Act (Art. 5). Uso non consentito nell'UE.",
  },
  high: {
    label: "ALTO RISCHIO",
    color: "bg-orange-100 text-orange-800 border-orange-200",
    description: "Sistema ad alto rischio. Soggetto a obblighi stringenti (Capo III).",
  },
  limited: {
    label: "RISCHIO LIMITATO",
    color: "bg-amber-100 text-amber-800 border-amber-200",
    description: "Soggetto a obblighi di trasparenza (Art. 50).",
  },
  minimal: {
    label: "RISCHIO MINIMO",
    color: "bg-emerald-100 text-emerald-800 border-emerald-200",
    description: "Nessun obbligo specifico AI Act, oltre all'alfabetizzazione (Art. 4).",
  },
  gpai: {
    label: "GPAI",
    color: "bg-violet-100 text-violet-800 border-violet-200",
    description: "Modello di IA per finalità generali. Obblighi specifici al Capo V.",
  },
};

export const ROLE_LABELS: Record<AIRole, string> = {
  provider: "Provider (sviluppi/immetti sul mercato il sistema)",
  deployer: "Deployer (usi un sistema AI fornito da terzi)",
  distributor: "Distributor (rendi disponibile sul mercato senza sviluppo)",
  importer: "Importer (immetti sul mercato UE sistemi da paesi extra-UE)",
};
