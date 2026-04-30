import type { PolicyAnswers } from "./types";

function escape(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export interface AIPolicyAnswers extends PolicyAnswers {
  approvedTools?: string;
  prohibitedUseCases?: string;
  dataConfidentialityLevel?: "low" | "medium" | "high";
  hasHumanReviewProcess?: boolean;
  trainingProvided?: boolean;
}

export function renderAIUsePolicy(a: AIPolicyAnswers): string {
  const today = new Date().toLocaleDateString("it-IT", { day: "2-digit", month: "long", year: "numeric" });
  const tools = (a.approvedTools || "").split(",").map((t) => t.trim()).filter(Boolean);
  const prohibited = (a.prohibitedUseCases || "").split(",").map((t) => t.trim()).filter(Boolean);

  return `
<header>
  <h1>Policy aziendale sull'uso dell'Intelligenza Artificiale</h1>
  <p><strong>${escape(a.controllerName)}</strong> — Documento interno · Ultimo aggiornamento: ${today}</p>
</header>

<h2>1. Premessa e ambito di applicazione</h2>
<p>La presente policy disciplina l'uso di sistemi di Intelligenza Artificiale (IA) all'interno di ${escape(a.controllerName)}, nel rispetto del Regolamento UE 2024/1689 (AI Act), del GDPR e delle altre normative applicabili. Si applica a tutti i dipendenti, collaboratori, consulenti e fornitori che, nello svolgimento delle proprie attività, utilizzano sistemi IA.</p>

<h2>2. Strumenti IA approvati</h2>
<p>Solo gli strumenti elencati di seguito sono approvati per l'uso aziendale. L'uso di strumenti diversi richiede preventiva autorizzazione del Responsabile IT.</p>
${tools.length > 0
  ? `<ul>${tools.map((t) => `<li>${escape(t)}</li>`).join("")}</ul>`
  : `<p><em>Elenco da completare. Solo gli strumenti approvati possono essere utilizzati con dati aziendali.</em></p>`}

<h2>3. Principi generali</h2>
<ul>
  <li><strong>Supervisione umana:</strong> ogni decisione che impatta persone (clienti, dipendenti, candidati) deve essere validata da una persona competente prima di essere applicata.</li>
  <li><strong>Riservatezza:</strong> non inserire dati personali, segreti commerciali, codice proprietario o informazioni riservate in strumenti IA pubblici (ChatGPT free, Gemini consumer, ecc.).</li>
  <li><strong>Trasparenza:</strong> dichiarare esplicitamente quando un contenuto pubblicato verso clienti o utenti è stato generato o significativamente assistito da IA.</li>
  <li><strong>Verifica dei risultati:</strong> i contenuti prodotti da IA possono contenere errori (allucinazioni). È responsabilità dell'utente verificarne l'accuratezza prima dell'uso.</li>
  <li><strong>Diritti d'autore:</strong> i contenuti IA-generated possono incorporare opere di terzi. Verificare la liceità dell'uso commerciale.</li>
</ul>

<h2>4. Casi d'uso vietati</h2>
<p>È espressamente vietato l'uso di sistemi IA per:</p>
<ul>
  <li>Decisioni completamente automatizzate sui dipendenti (assunzione, licenziamento, valutazione delle performance) senza supervisione umana effettiva.</li>
  <li>Scoring sociale o profilazione discriminatoria di persone.</li>
  <li>Sorveglianza dei dipendenti tramite riconoscimento emozioni o categorizzazione biometrica.</li>
  <li>Generazione di deepfake o contenuti ingannevoli che possono essere scambiati per autentici.</li>
  <li>Attività vietate dall'Art. 5 dell'AI Act.</li>
  ${prohibited.map((p) => `<li>${escape(p)}</li>`).join("")}
</ul>

<h2>5. Trattamento dei dati</h2>
<p>Quando si utilizzano sistemi IA con dati di terzi (clienti, fornitori, dipendenti):</p>
<ul>
  <li>Verificare che il trattamento abbia una base giuridica valida (art. 6 GDPR) e che gli interessati siano stati informati.</li>
  <li>Preferire strumenti enterprise con DPA firmato e dati elaborati in UE.</li>
  <li>Non usare i dati aziendali per addestrare modelli pubblici, salvo esplicita autorizzazione.</li>
  <li>Segnalare al DPO eventuali data breach derivanti dall'uso di sistemi IA.</li>
</ul>

<h2>6. Sorveglianza umana</h2>
<p>${a.hasHumanReviewProcess
  ? "L'azienda ha implementato processi di revisione umana sugli output IA prima della loro applicazione operativa. I supervisori designati hanno autorità di rifiutare o modificare gli output."
  : "Tutti gli output IA destinati a uso esterno o decisionale devono essere rivisti da un dipendente competente prima dell'applicazione."}</p>

<h2>7. Formazione e alfabetizzazione</h2>
<p>${a.trainingProvided
  ? "L'azienda fornisce formazione periodica sull'uso responsabile dei sistemi IA, in conformità all'Art. 4 dell'AI Act. La partecipazione è obbligatoria per chi utilizza IA nel proprio ruolo."
  : "Ai sensi dell'Art. 4 dell'AI Act, l'azienda si impegna a fornire un livello adeguato di alfabetizzazione in materia di IA al personale che la utilizza. La formazione sarà attivata."}</p>

<h2>8. Segnalazione incidenti</h2>
<p>Qualsiasi incidente che coinvolga un sistema IA (output dannosi, errori significativi, comportamenti inattesi, possibili violazioni dei diritti) deve essere segnalato immediatamente a <a href="mailto:${escape(a.contactEmail)}">${escape(a.contactEmail)}</a>.</p>

<h2>9. Sanzioni</h2>
<p>La violazione della presente policy può comportare provvedimenti disciplinari ai sensi del CCNL applicabile, oltre a possibili responsabilità civili e penali per uso illecito di sistemi IA.</p>

<h2>10. Aggiornamenti</h2>
<p>Questa policy verrà aggiornata in linea con l'evoluzione normativa (in particolare le scadenze di applicazione dell'AI Act: 2/2/2025, 2/8/2025, 2/8/2026, 2/8/2027) e con l'adozione di nuovi strumenti aziendali.</p>

<hr/>
<p style="font-size:12px;opacity:.7">Documento generato con <a href="https://aicomplyonline.it" rel="noopener">ComplyAI</a> — modulo AI Act.</p>
  `.trim();
}

export function renderAIDisclosureNotice(a: AIPolicyAnswers): string {
  const today = new Date().toLocaleDateString("it-IT", { day: "2-digit", month: "long", year: "numeric" });

  return `
<header>
  <h1>Informativa sull'uso dell'Intelligenza Artificiale</h1>
  <p><strong>${escape(a.controllerName)}</strong> — ${escape(a.websiteUrl)} · Ultimo aggiornamento: ${today}</p>
</header>

<h2>1. Sistemi IA utilizzati su questo sito</h2>
<p>${escape(a.controllerName)} utilizza sistemi di Intelligenza Artificiale per offrirti alcune delle funzionalità di ${escape(a.websiteUrl)}. Ai sensi dell'Art. 50 del Regolamento UE 2024/1689 (AI Act), forniamo trasparenza sull'uso dell'IA.</p>

<h2>2. Interazioni con sistemi conversazionali</h2>
<p>Se sul sito è disponibile una chat di assistenza, parte delle risposte può essere generata automaticamente da un sistema di IA. Quando interagisci con un sistema IA, riceverai un'indicazione esplicita all'inizio della conversazione. Hai sempre il diritto di richiedere il passaggio a un operatore umano.</p>

<h2>3. Contenuti generati o assistiti da IA</h2>
<p>Alcuni contenuti pubblicati su ${escape(a.websiteUrl)} (testi, immagini, riassunti, traduzioni) possono essere stati generati o significativamente assistiti da sistemi IA. Quando rilevante, lo segnaliamo esplicitamente con una dicitura "Contenuto generato/assistito da IA". I contenuti sono comunque revisionati da una persona prima della pubblicazione.</p>

<h2>4. Limitazioni dell'IA</h2>
<p>I sistemi di IA possono produrre risposte imprecise, incomplete o non aggiornate. I contenuti forniti tramite IA non costituiscono consulenza professionale (legale, medica, fiscale, finanziaria) e non sostituiscono il parere di un esperto qualificato.</p>

<h2>5. Trattamento dei dati personali</h2>
<p>Quando interagisci con i nostri sistemi IA, alcune informazioni che condividi possono essere elaborate dal fornitore del servizio IA in qualità di responsabile del trattamento. Per dettagli sulle finalità, le basi giuridiche e i tuoi diritti, consulta la nostra <a href="/p/privacy">Informativa Privacy</a>.</p>

<h2>6. I tuoi diritti</h2>
<ul>
  <li>Richiedere di interagire con un operatore umano anziché con un sistema IA.</li>
  <li>Conoscere se una decisione che ti riguarda è stata presa o assistita da IA.</li>
  <li>Esercitare i diritti previsti dal GDPR (artt. 15-22) sui dati trattati.</li>
  <li>Segnalare contenuti IA che ritieni inappropriati o errati.</li>
</ul>

<h2>7. Contatti</h2>
<p>Per qualsiasi domanda sull'uso dell'IA su questo sito, scrivi a <a href="mailto:${escape(a.contactEmail)}">${escape(a.contactEmail)}</a>.</p>

<hr/>
<p style="font-size:12px;opacity:.7">Documento generato con <a href="https://aicomplyonline.it" rel="noopener">ComplyAI</a> — modulo AI Act.</p>
  `.trim();
}
