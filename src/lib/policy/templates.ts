import type { DocumentType, PolicyAnswers } from "./types";
import { DOC_LABELS } from "./types";

function escape(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function today() {
  return new Date().toLocaleDateString("it-IT", { day: "2-digit", month: "long", year: "numeric" });
}

function aiSystemsTable(a: PolicyAnswers): string {
  const items = a.aiSystemsList || [];
  if (items.length === 0) return "<p><em>Nessun sistema AI registrato. Compila il Registro IA per popolare automaticamente questo elenco.</em></p>";
  const rows = items
    .map(
      (s) =>
        `<tr><td><strong>${escape(s.name)}</strong></td><td>${escape(s.vendor || "—")}</td><td>${escape(s.purpose || "—")}</td><td>${escape(s.category || "—")}</td></tr>`,
    )
    .join("");
  return `
<table>
  <thead><tr><th>Sistema</th><th>Fornitore</th><th>Finalità</th><th>Categoria rischio</th></tr></thead>
  <tbody>${rows}</tbody>
</table>`;
}

// ============================================================================
// 1. POLICY INTERNA SULL'USO DELL'IA
// ============================================================================
export function renderAIUsePolicy(a: PolicyAnswers): string {
  const tools = (a.approvedTools || "").split(",").map((t) => t.trim()).filter(Boolean);
  const prohibited = (a.prohibitedUseCases || "").split(",").map((t) => t.trim()).filter(Boolean);

  return `
<header>
  <h1>Policy Interna sull'uso dell'Intelligenza Artificiale</h1>
  <p><strong>${escape(a.controllerName)}</strong> · Documento interno · Aggiornata al ${today()}</p>
  <p><em>Rif. normativi: Reg. UE 2024/1689 (AI Act) · Legge 23/9/2025 n. 132</em></p>
</header>

<h2>1. Scopo e ambito</h2>
<p>La presente policy disciplina l'utilizzo di sistemi di Intelligenza Artificiale (di seguito "IA") all'interno di ${escape(a.controllerName)}, in conformità all'AI Act (Reg. UE 2024/1689) e alla Legge italiana 23 settembre 2025 n. 132. Si applica a tutti i dipendenti, collaboratori, consulenti e fornitori che utilizzano sistemi IA nell'ambito di prestazioni rese in favore dell'azienda.</p>

<h2>2. Ruolo dell'azienda e classificazione</h2>
<p>${escape(a.controllerName)} agisce, di norma, in qualità di <strong>Deployer</strong> ai sensi dell'art. 3 punto 4 dell'AI Act, in quanto utilizzatore di sistemi IA forniti da terzi sotto la propria autorità. Eventuali sistemi sviluppati internamente potranno comportare il ruolo aggiuntivo di Provider, con i correlati obblighi.</p>

<h2>3. Strumenti IA approvati</h2>
<p>Solo gli strumenti elencati di seguito sono autorizzati per l'uso aziendale:</p>
${tools.length > 0
  ? `<ul>${tools.map((t) => `<li>${escape(t)}</li>`).join("")}</ul>`
  : `<p><em>Elenco da completare nel registro IA. L'uso di strumenti non in elenco richiede preventiva autorizzazione.</em></p>`}

<h2>4. Pratiche vietate (Art. 5 AI Act)</h2>
<p>È espressamente vietato utilizzare, anche occasionalmente, sistemi che:</p>
<ul>
  <li>Manipolano il comportamento delle persone con tecniche subliminali;</li>
  <li>Sfruttano vulnerabilità di età, disabilità o condizione socio-economica;</li>
  <li>Effettuano social scoring;</li>
  <li>Eseguono predictive policing su persone fisiche basato su profilazione;</li>
  <li>Riconoscono emozioni in luoghi di lavoro o istituti scolastici;</li>
  <li>Categorizzano biometricamente per caratteristiche protette (razza, religione, orientamento);</li>
  <li>Effettuano identificazione biometrica remota in tempo reale in spazi pubblici;</li>
  <li>Effettuano scraping non mirato di immagini facciali.</li>
  ${prohibited.map((p) => `<li>${escape(p)}</li>`).join("")}
</ul>

<h2>5. Principi d'uso responsabile</h2>
<ul>
  <li><strong>Supervisione umana (human-in-command):</strong> ogni decisione che impatta persone (clienti, dipendenti, candidati) deve essere validata da una persona competente prima dell'applicazione.</li>
  <li><strong>Riservatezza:</strong> è vietato inserire in sistemi IA pubblici (account consumer) dati personali di terzi, dati riservati aziendali, segreti commerciali, credenziali, codice proprietario.</li>
  <li><strong>Verifica:</strong> i contenuti prodotti da IA possono essere imprecisi o non aggiornati. L'utente è responsabile della loro verifica prima dell'uso.</li>
  <li><strong>Trasparenza:</strong> dichiarare in modo evidente quando un contenuto pubblicato verso clienti o terzi è stato generato o significativamente assistito da IA (Art. 50 AI Act).</li>
  <li><strong>Diritti d'autore:</strong> verificare la liceità dell'uso commerciale di contenuti generati da IA che potrebbero incorporare opere di terzi.</li>
</ul>

<h2>6. Sorveglianza umana</h2>
<p>${a.hasHumanReviewProcess
  ? "L'azienda ha definito processi di revisione umana sugli output IA. I supervisori designati hanno autorità di rifiutare o modificare gli output prima dell'applicazione operativa."
  : "Tutti gli output IA destinati a uso esterno o utilizzati per decisioni rilevanti devono essere rivisti da un dipendente competente prima dell'applicazione."}</p>

<h2>7. Formazione e alfabetizzazione (Art. 4 AI Act)</h2>
<p>${a.trainingProvided
  ? "L'azienda fornisce formazione periodica sull'uso responsabile dei sistemi IA, in conformità all'art. 4 dell'AI Act. La partecipazione è obbligatoria per chi utilizza IA nel proprio ruolo. La formazione completata viene registrata nel Registro Formazione."
  : "L'azienda si impegna ad attivare un programma di alfabetizzazione AI per il personale che utilizza tali sistemi (Art. 4 AI Act, in vigore dal 2/2/2025)."}</p>

<h2>8. Tutela dei lavoratori (L. 132/2025)</h2>
<p>L'utilizzo di sistemi IA che incidano sulla prestazione lavorativa è disciplinato dall'art. 11 della L. 132/2025: ai lavoratori è fornita un'informativa scritta prima dell'attivazione e in caso di modifiche significative. È sempre garantito l'intervento umano e il diritto all'esplicabilità. Nessun trattamento può svolgersi in contrasto con la dignità del lavoratore o comportare discriminazione.</p>

${a.appliesToProfessions
  ? `<h2>9. Professioni intellettuali (Art. 13 L. 132/2025)</h2>
<p>Quando l'IA è impiegata nello svolgimento di prestazioni professionali rese a favore di clienti, è ammessa esclusivamente come strumento di supporto al lavoro intellettuale. Il professionista informa il cliente in modo chiaro, semplice ed esaustivo dei sistemi utilizzati.</p>`
  : ""}

<h2>${a.appliesToProfessions ? "10" : "9"}. Trattamento dei dati personali (GDPR)</h2>
<p>Quando si trattano dati di terzi con sistemi IA:</p>
<ul>
  <li>verificare la base giuridica del trattamento;</li>
  <li>preferire strumenti enterprise con DPA firmato e dati elaborati in UE;</li>
  <li>non utilizzare dati aziendali per addestrare modelli pubblici, salvo esplicita autorizzazione;</li>
  <li>segnalare al DPO eventuali data breach derivanti dall'uso di sistemi IA.</li>
</ul>

<h2>${a.appliesToProfessions ? "11" : "10"}. Segnalazione incidenti e responsabilità</h2>
<p>Qualsiasi incidente che coinvolga un sistema IA (output dannosi, errori significativi, comportamenti inattesi, possibili violazioni dei diritti, sospetto di pratica vietata) deve essere segnalato immediatamente a <a href="mailto:${escape(a.contactEmail)}">${escape(a.contactEmail)}</a>.</p>

<h2>${a.appliesToProfessions ? "12" : "11"}. Sanzioni interne</h2>
<p>La violazione della presente policy può comportare provvedimenti disciplinari ai sensi del CCNL applicabile, oltre a possibili responsabilità civili e penali per uso illecito di sistemi IA.</p>

<h2>${a.appliesToProfessions ? "13" : "12"}. Revisione</h2>
<p>La presente policy verrà rivista al variare del quadro normativo (in particolare in vista delle scadenze AI Act del 2/8/2026 e 2/8/2027) e con l'adozione di nuovi strumenti.</p>

<hr/>
<p style="font-size:12px;opacity:.7">Documento generato con AIComply (aicomplyonline.it). Non costituisce consulenza legale.</p>
  `.trim();
}

// ============================================================================
// 2. INFORMATIVA AI AI DIPENDENTI (Art. 11 L. 132/2025)
// ============================================================================
export function renderEmployeeNotice(a: PolicyAnswers): string {
  return `
<header>
  <h1>Informativa sull'utilizzo di sistemi di Intelligenza Artificiale nel rapporto di lavoro</h1>
  <p><strong>${escape(a.controllerName)}</strong> · Ai sensi dell'art. 11 della L. 23/9/2025 n. 132</p>
  <p>Data: ${today()}</p>
</header>

<h2>1. Destinatari</h2>
<p>La presente informativa è rivolta a tutti i lavoratori dipendenti, collaboratori e tirocinanti di ${escape(a.controllerName)} che, nello svolgimento delle proprie mansioni, possano essere oggetto o utilizzatori di sistemi di Intelligenza Artificiale (IA).</p>

<h2>2. Cosa intendiamo per sistemi IA</h2>
<p>Per "sistema IA" si intende qualsiasi sistema automatizzato che, ai sensi dell'art. 3 punto 1 dell'AI Act, presenta autonomia variabile e adatta o suggerisce risultati a partire da input ricevuti. Sono inclusi: assistenti generativi (es. ChatGPT, Copilot, Gemini, Claude), funzioni IA dei gestionali, sistemi di scoring o suggerimento, chatbot.</p>

<h2>3. Sistemi IA attualmente impiegati in azienda</h2>
${aiSystemsTable(a)}

<h2>4. Finalità d'uso</h2>
<p>I sistemi IA sopra elencati sono utilizzati per finalità di supporto operativo e di produttività, in particolare per:</p>
<ul>
  <li>redazione e revisione di documenti;</li>
  <li>traduzione, riassunto, analisi testuale;</li>
  <li>supporto allo sviluppo software (se applicabile);</li>
  <li>assistenza nelle attività di customer service;</li>
  <li>generazione di contenuti marketing e comunicativi.</li>
</ul>
<p>I sistemi IA <strong>non</strong> sono utilizzati per assumere decisioni completamente automatizzate che impattino sul rapporto di lavoro (assunzione, licenziamento, valutazione delle performance, sanzioni) senza intervento umano effettivo e qualificato.</p>

<h2>5. Logiche di funzionamento e limiti</h2>
<p>I sistemi IA utilizzati possono produrre risultati inaccurati, incompleti o non aggiornati. Le loro elaborazioni hanno carattere probabilistico e dipendono dai dati di addestramento e dagli input forniti. L'output di un sistema IA non costituisce parere autorevole né decisione finale: rappresenta un suggerimento da verificare e validare da parte di una persona.</p>

<h2>6. Diritto all'intervento umano (human-in-command)</h2>
<p>Conformemente all'art. 11 comma 3 della L. 132/2025, il lavoratore ha sempre diritto a:</p>
<ul>
  <li>conoscere se una decisione che lo riguarda è stata presa con il contributo di sistemi IA;</li>
  <li>ricevere spiegazione chiara delle logiche e dei criteri applicati;</li>
  <li>contestare la decisione e chiedere una valutazione esclusivamente umana;</li>
  <li>opporsi all'uso che non sia rispettoso della dignità personale.</li>
</ul>

<h2>7. Divieto di discriminazione</h2>
<p>I sistemi IA utilizzati non possono determinare alcuna discriminazione fondata su sesso, età, origini etniche, credo religioso, orientamento sessuale, opinioni politiche, condizioni personali e sociali. Eventuali esiti che evidenzino bias sistematici saranno segnalati e neutralizzati.</p>

<h2>8. Trattamento dei dati personali del lavoratore</h2>
<p>Eventuali dati personali del lavoratore trattati tramite sistemi IA seguono le finalità e le basi giuridiche già illustrate nell'informativa privacy ricevuta al momento dell'assunzione, in conformità al GDPR e al Codice del Lavoro.</p>

<h2>9. Modifiche significative</h2>
<p>Conformemente all'art. 11 comma 2, in caso di modifiche significative riguardanti l'uso dei sistemi IA, l'informazione sarà fornita al lavoratore con almeno 24 ore di anticipo rispetto all'attivazione delle modifiche stesse.</p>

<h2>10. Formazione</h2>
<p>L'azienda garantisce un livello adeguato di alfabetizzazione AI (Art. 4 AI Act) ai dipendenti che utilizzano tali sistemi, attraverso percorsi formativi documentati.</p>

<h2>11. Contatti</h2>
<p>Per ricevere chiarimenti, esercitare i diritti di cui sopra o segnalare anomalie nell'uso dei sistemi IA, il lavoratore può scrivere a <a href="mailto:${escape(a.contactEmail)}">${escape(a.contactEmail)}</a>.</p>

<hr/>
<p style="font-size:13px"><strong>Per presa visione</strong></p>
<p style="font-size:13px">Il/La lavoratore/lavoratrice _____________________________________</p>
<p style="font-size:13px">Data ___________________ Firma _________________________________</p>

<hr/>
<p style="font-size:12px;opacity:.7">Documento generato con AIComply (aicomplyonline.it). Non costituisce consulenza legale.</p>
  `.trim();
}

// ============================================================================
// 3. INFORMATIVA TRASPARENZA AI ai clienti (Art. 50 AI Act)
// ============================================================================
export function renderAIDisclosureNotice(a: PolicyAnswers): string {
  return `
<header>
  <h1>Informativa sull'uso dell'Intelligenza Artificiale</h1>
  <p><strong>${escape(a.controllerName)}</strong>${a.websiteUrl ? ` · ${escape(a.websiteUrl)}` : ""} · Aggiornata al ${today()}</p>
  <p><em>Resa ai sensi dell'art. 50 del Reg. UE 2024/1689 (AI Act) e, ove applicabile, dell'art. 13 della L. 132/2025</em></p>
</header>

<h2>1. Premessa</h2>
<p>${escape(a.controllerName)} utilizza sistemi di Intelligenza Artificiale per fornire alcune delle funzionalità dei propri servizi. Con la presente informativa rendiamo trasparente l'uso dell'IA, in conformità alle norme europee e italiane.</p>

<h2>2. Sistemi IA in uso</h2>
${aiSystemsTable(a)}

<h2>3. Interazioni con sistemi conversazionali</h2>
<p>Quando interagisci con un chatbot o un assistente vocale fornito da noi, ti informeremo esplicitamente all'inizio della conversazione che stai dialogando con un sistema di Intelligenza Artificiale. Hai sempre il diritto di richiedere il passaggio a un operatore umano.</p>

<h2>4. Contenuti generati o assistiti da IA</h2>
<p>Alcuni contenuti che pubblichiamo (testi, immagini, riassunti, traduzioni) possono essere stati generati o significativamente assistiti da sistemi IA. Quando rilevante lo segnaliamo con apposita dicitura. I contenuti sono comunque revisionati da una persona prima della pubblicazione.</p>

<h2>5. Limitazioni dell'IA</h2>
<p>I sistemi di IA possono produrre risposte imprecise, incomplete o non aggiornate. I contenuti forniti tramite IA non costituiscono consulenza professionale e non sostituiscono il parere di un esperto qualificato.</p>

${a.appliesToProfessions
  ? `<h2>6. Professioni intellettuali</h2>
<p>L'IA è impiegata esclusivamente come strumento di supporto. Il lavoro intellettuale umano prevale e il professionista incaricato resta responsabile della prestazione, conformemente all'art. 13 L. 132/2025.</p>`
  : ""}

<h2>${a.appliesToProfessions ? "7" : "6"}. Trattamento dei dati personali</h2>
<p>Quando interagisci con i nostri sistemi IA, alcune informazioni possono essere elaborate dal fornitore del servizio in qualità di responsabile del trattamento ai sensi dell'art. 28 GDPR. Per dettagli su finalità, basi giuridiche e diritti, consulta la nostra <a href="/legal/privacy">Informativa Privacy</a>.</p>

<h2>${a.appliesToProfessions ? "8" : "7"}. I tuoi diritti</h2>
<ul>
  <li>Richiedere di interagire con un operatore umano;</li>
  <li>Conoscere se una decisione che ti riguarda è stata presa o assistita da IA;</li>
  <li>Esercitare i diritti previsti dal GDPR (artt. 15-22);</li>
  <li>Segnalare contenuti IA che ritieni inappropriati o errati.</li>
</ul>

<h2>${a.appliesToProfessions ? "9" : "8"}. Contatti</h2>
<p>Per qualsiasi richiesta sull'uso dell'IA, scrivi a <a href="mailto:${escape(a.contactEmail)}">${escape(a.contactEmail)}</a>.</p>

<hr/>
<p style="font-size:12px;opacity:.7">Documento generato con AIComply (aicomplyonline.it). Non costituisce consulenza legale.</p>
  `.trim();
}

// ============================================================================
// 4. REGISTRO IA FORMALE (export audit-ready)
// ============================================================================
export function renderRegistryExport(a: PolicyAnswers): string {
  const items = a.aiSystemsList || [];
  const rows = items
    .map(
      (s, i) => `
<section class="ai-record">
  <h3>${i + 1}. ${escape(s.name)}</h3>
  <table>
    <tr><th style="width:30%">Fornitore</th><td>${escape(s.vendor || "—")}</td></tr>
    <tr><th>Finalità</th><td>${escape(s.purpose || "—")}</td></tr>
    <tr><th>Categoria di rischio</th><td>${escape(s.category || "—")}</td></tr>
  </table>
</section>`,
    )
    .join("");

  return `
<header>
  <h1>Registro dei sistemi di Intelligenza Artificiale</h1>
  <p><strong>${escape(a.controllerName)}</strong> · Aggiornato al ${today()}</p>
  <p><em>Rif. AI Act (Reg. UE 2024/1689) — Documento interno per gestione del rischio</em></p>
</header>

<h2>Premessa</h2>
<p>Il presente registro elenca i sistemi di IA in uso presso ${escape(a.controllerName)}, con indicazione di fornitore, finalità d'uso, classificazione di rischio AI Act, obblighi applicabili e ruolo dell'azienda. Costituisce strumento di gestione del rischio e di audit interno.</p>

${items.length > 0 ? rows : "<p><em>Nessun sistema AI registrato. Aggiungi i sistemi nel Registro IA della dashboard per popolare automaticamente l'export.</em></p>"}

<h2>Soggetto compilatore</h2>
<p>Il registro è curato dalla funzione responsabile della compliance AI Act di ${escape(a.controllerName)}, contattabile all'indirizzo <a href="mailto:${escape(a.contactEmail)}">${escape(a.contactEmail)}</a>.</p>

<hr/>
<p style="font-size:12px;opacity:.7">Documento generato con AIComply (aicomplyonline.it). Non costituisce consulenza legale.</p>
  `.trim();
}

// ============================================================================
// Dispatcher
// ============================================================================
export function renderDocument(type: DocumentType, answers: PolicyAnswers): string {
  switch (type) {
    case "ai_use_policy":
      return renderAIUsePolicy(answers);
    case "ai_employee_notice":
      return renderEmployeeNotice(answers);
    case "ai_disclosure":
      return renderAIDisclosureNotice(answers);
    case "ai_registry_export":
      return renderRegistryExport(answers);
  }
}

export const DOCUMENT_TITLES: Record<DocumentType, string> = {
  ai_use_policy: DOC_LABELS.ai_use_policy.title,
  ai_employee_notice: DOC_LABELS.ai_employee_notice.title,
  ai_disclosure: DOC_LABELS.ai_disclosure.title,
  ai_registry_export: DOC_LABELS.ai_registry_export.title,
};
