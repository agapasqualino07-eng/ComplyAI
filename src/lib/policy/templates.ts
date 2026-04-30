import type { PolicyAnswers, DocumentType } from "./types";

function escape(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function renderList(items: string[]) {
  return `<ul>${items.map((i) => `<li>${escape(i)}</li>`).join("")}</ul>`;
}

function purposeLabel(p: string) {
  const map: Record<string, string> = {
    contact_form: "rispondere a richieste tramite form di contatto",
    newsletter: "invio di newsletter e comunicazioni di marketing",
    analytics: "statistiche di utilizzo del sito",
    profiling: "profilazione e marketing personalizzato",
    ecommerce: "gestione di acquisti e ordini",
    support: "fornire assistenza ai clienti",
    legal_obligations: "adempimento di obblighi legali e fiscali",
  };
  return map[p] || p;
}

function legalBasis(p: string) {
  const map: Record<string, string> = {
    contact_form: "Art. 6.1.b GDPR (esecuzione di misure precontrattuali)",
    newsletter: "Art. 6.1.a GDPR (consenso dell'interessato)",
    analytics: "Art. 6.1.f GDPR (legittimo interesse) o Art. 6.1.a (consenso) per cookie",
    profiling: "Art. 6.1.a GDPR (consenso esplicito)",
    ecommerce: "Art. 6.1.b GDPR (esecuzione del contratto)",
    support: "Art. 6.1.b GDPR (esecuzione del contratto) o Art. 6.1.f (legittimo interesse)",
    legal_obligations: "Art. 6.1.c GDPR (obbligo legale)",
  };
  return map[p] || "Art. 6 GDPR";
}

export function renderPrivacyPolicy(a: PolicyAnswers): string {
  const today = new Date().toLocaleDateString("it-IT", { day: "2-digit", month: "long", year: "numeric" });
  const purposes = a.purposes || [];
  const dataCollected: string[] = [];
  if (purposes.includes("contact_form")) dataCollected.push("Nome, email e contenuto del messaggio (form contatti)");
  if (purposes.includes("newsletter")) dataCollected.push("Email per invio newsletter");
  if (purposes.includes("analytics")) dataCollected.push("Dati di navigazione anonimi/aggregati e identificatori dei dispositivi");
  if (purposes.includes("profiling")) dataCollected.push("Preferenze, comportamenti di navigazione, segmentazioni di marketing");
  if (purposes.includes("ecommerce")) dataCollected.push("Dati di fatturazione, indirizzo di spedizione, dettagli del pagamento");
  if (purposes.includes("support")) dataCollected.push("Comunicazioni con il servizio clienti, ticket, email");
  if (purposes.includes("legal_obligations")) dataCollected.push("Dati richiesti per fatturazione e adempimenti fiscali");

  const recipients: string[] = [];
  if (a.usesCloudflare) recipients.push("Cloudflare, Inc. (CDN, anti-DDoS)");
  if (a.usesGoogleAnalytics) recipients.push("Google Ireland Ltd. (Google Analytics)");
  if (a.usesMetaPixel) recipients.push("Meta Platforms Ireland Ltd. (Meta Pixel)");
  if (a.usesStripe) recipients.push("Stripe Payments Europe Ltd. (gestione pagamenti)");
  if (a.usesMailchimp) recipients.push("Intuit Mailchimp (invio email marketing)");
  if (a.usesHotjar) recipients.push("Hotjar Ltd. (analisi comportamentale)");
  if (a.otherProcessors) recipients.push(a.otherProcessors);

  const transfersOutsideEu = a.usesGoogleAnalytics || a.usesMetaPixel || a.usesHotjar;

  return `
<header>
  <h1>Informativa sul trattamento dei dati personali</h1>
  <p><strong>${escape(a.controllerName)}</strong> — Ultimo aggiornamento: ${today}</p>
</header>

<h2>1. Titolare del trattamento</h2>
<p>Il Titolare del trattamento dei dati è ${escape(a.controllerName)}${a.vatNumber ? `, P.IVA ${escape(a.vatNumber)}` : ""}${a.address ? `, con sede in ${escape(a.address)}` : ""}. Per qualsiasi richiesta è possibile contattare il Titolare all'indirizzo email <a href="mailto:${escape(a.contactEmail)}">${escape(a.contactEmail)}</a>.</p>

${a.dpoEmail ? `<h2>2. Responsabile della protezione dei dati (DPO)</h2><p>È stato nominato un Responsabile della protezione dei dati contattabile all'indirizzo <a href="mailto:${escape(a.dpoEmail)}">${escape(a.dpoEmail)}</a>.</p>` : ""}

<h2>${a.dpoEmail ? "3" : "2"}. Tipologie di dati raccolti</h2>
<p>Nell'ambito dei servizi offerti tramite il sito ${escape(a.websiteUrl)}, ${escape(a.controllerName)} tratta le seguenti categorie di dati:</p>
${renderList(dataCollected.length > 0 ? dataCollected : ["Dati di navigazione necessari al funzionamento del sito"])}

<h2>${a.dpoEmail ? "4" : "3"}. Finalità del trattamento</h2>
<p>I dati personali sono trattati per le seguenti finalità:</p>
${renderList(purposes.map(purposeLabel))}

<h2>${a.dpoEmail ? "5" : "4"}. Base giuridica</h2>
<p>Il trattamento si basa sui seguenti presupposti, in funzione della finalità:</p>
${renderList(purposes.map((p) => `${purposeLabel(p)}: ${legalBasis(p)}`))}

<h2>${a.dpoEmail ? "6" : "5"}. Destinatari dei dati</h2>
<p>I dati possono essere comunicati a fornitori di servizi nominati Responsabili del trattamento ai sensi dell'art. 28 GDPR:</p>
${recipients.length > 0 ? renderList(recipients) : "<p>I dati non sono comunicati a soggetti terzi al di fuori dei casi previsti per legge.</p>"}

<h2>${a.dpoEmail ? "7" : "6"}. Trasferimento dei dati extra-UE</h2>
<p>${transfersOutsideEu
  ? "Alcuni dei fornitori utilizzati possono trasferire dati al di fuori dello Spazio Economico Europeo. In tali casi, il Titolare assicura che il trasferimento avvenga sulla base delle Clausole Contrattuali Standard adottate dalla Commissione Europea o di altre garanzie adeguate ai sensi del Capo V del GDPR."
  : "I dati non sono trasferiti al di fuori dello Spazio Economico Europeo."}</p>

<h2>${a.dpoEmail ? "8" : "7"}. Periodo di conservazione</h2>
<p>I dati sono conservati per il tempo strettamente necessario al perseguimento delle finalità per cui sono stati raccolti, e comunque in conformità con i termini di legge applicabili (es. 10 anni per i dati fiscali).</p>

<h2>${a.dpoEmail ? "9" : "8"}. Diritti dell'interessato</h2>
<p>L'interessato ha diritto, ai sensi degli artt. 15-22 del GDPR, di:</p>
<ul>
  <li>accedere ai propri dati personali;</li>
  <li>chiederne la rettifica o la cancellazione;</li>
  <li>limitare od opporsi al trattamento;</li>
  <li>ricevere i dati in formato strutturato (portabilità);</li>
  <li>revocare in qualsiasi momento il consenso prestato;</li>
  <li>proporre reclamo all'Autorità Garante per la Protezione dei Dati Personali (<a href="https://www.garanteprivacy.it" target="_blank" rel="noopener">www.garanteprivacy.it</a>).</li>
</ul>
<p>Per esercitare tali diritti è sufficiente scrivere a <a href="mailto:${escape(a.contactEmail)}">${escape(a.contactEmail)}</a>.</p>

<h2>${a.dpoEmail ? "10" : "9"}. Modifiche</h2>
<p>Il Titolare si riserva il diritto di aggiornare la presente informativa in caso di modifiche normative o operative. Si invita pertanto a consultarla periodicamente.</p>

<hr/>
<p style="font-size:12px;opacity:.7">Documento generato con <a href="https://aicomplyonline.it" rel="noopener">ComplyAI</a>.</p>
  `.trim();
}

export function renderCookiePolicy(a: PolicyAnswers): string {
  const today = new Date().toLocaleDateString("it-IT", { day: "2-digit", month: "long", year: "numeric" });
  const services: { name: string; provider: string; purpose: string; retention: string }[] = [];
  services.push({
    name: "Cookie tecnici di sessione",
    provider: a.controllerName,
    purpose: "Funzionamento del sito, autenticazione, sicurezza",
    retention: "Sessione",
  });
  if (a.usesCloudflare) services.push({ name: "Cloudflare", provider: "Cloudflare, Inc.", purpose: "Sicurezza e CDN", retention: "Fino a 30 giorni" });
  if (a.usesGoogleAnalytics) services.push({ name: "Google Analytics 4", provider: "Google Ireland Ltd.", purpose: "Statistiche aggregate", retention: "Fino a 14 mesi" });
  if (a.usesMetaPixel) services.push({ name: "Meta Pixel", provider: "Meta Platforms Ireland Ltd.", purpose: "Marketing e remarketing", retention: "Fino a 13 mesi" });
  if (a.usesHotjar) services.push({ name: "Hotjar", provider: "Hotjar Ltd.", purpose: "Analisi comportamento", retention: "Fino a 12 mesi" });

  const rows = services
    .map(
      (s) =>
        `<tr><td><strong>${escape(s.name)}</strong></td><td>${escape(s.provider)}</td><td>${escape(s.purpose)}</td><td>${escape(s.retention)}</td></tr>`,
    )
    .join("");

  return `
<header>
  <h1>Cookie Policy</h1>
  <p><strong>${escape(a.controllerName)}</strong> — Ultimo aggiornamento: ${today}</p>
</header>

<h2>1. Cosa sono i cookie</h2>
<p>I cookie sono piccoli file di testo che i siti visitati salvano sul dispositivo dell'utente per consentirne il corretto funzionamento, migliorarne l'esperienza di navigazione o raccogliere informazioni a fini statistici e di marketing.</p>

<h2>2. Tipologie di cookie utilizzati</h2>
<p>${escape(a.websiteUrl)} utilizza le seguenti categorie di cookie:</p>
<ul>
  <li><strong>Necessari:</strong> indispensabili per il funzionamento del sito. Non richiedono consenso.</li>
  <li><strong>Preferenze:</strong> ricordano le scelte effettuate (lingua, area geografica).</li>
  <li><strong>Statistica:</strong> raccolgono informazioni anonime sull'utilizzo del sito.</li>
  <li><strong>Marketing:</strong> tracciano l'utente per mostrare annunci personalizzati.</li>
</ul>

<h2>3. Elenco dei servizi e cookie attivi</h2>
<table>
  <thead><tr><th>Servizio</th><th>Fornitore</th><th>Finalità</th><th>Conservazione</th></tr></thead>
  <tbody>${rows}</tbody>
</table>

<h2>4. Gestione del consenso</h2>
<p>Al primo accesso viene mostrato un banner che consente di accettare, rifiutare o personalizzare le categorie di cookie. È possibile modificare le preferenze in qualsiasi momento tramite il link "Gestisci preferenze cookie" presente nel footer del sito.</p>

<h2>5. Come disabilitare i cookie</h2>
<p>Oltre alla gestione tramite banner, l'utente può disabilitare o cancellare i cookie direttamente dalle impostazioni del proprio browser. Le istruzioni sono disponibili sulle pagine di supporto dei principali browser (Chrome, Firefox, Safari, Edge).</p>

<h2>6. Aggiornamenti</h2>
<p>La presente Cookie Policy può essere aggiornata. Verrà data evidenza delle modifiche tramite il banner cookie all'ingresso del sito.</p>

<hr/>
<p style="font-size:12px;opacity:.7">Documento generato con <a href="https://aicomplyonline.it" rel="noopener">ComplyAI</a>.</p>
  `.trim();
}

export function renderTermsOfService(a: PolicyAnswers): string {
  const today = new Date().toLocaleDateString("it-IT", { day: "2-digit", month: "long", year: "numeric" });
  return `
<header>
  <h1>Termini e Condizioni d'uso</h1>
  <p><strong>${escape(a.controllerName)}</strong> — Ultimo aggiornamento: ${today}</p>
</header>

<h2>1. Premessa</h2>
<p>I presenti Termini e Condizioni regolano l'utilizzo del sito ${escape(a.websiteUrl)} (di seguito, il "Sito"), gestito da ${escape(a.controllerName)}. L'accesso e l'utilizzo del Sito implica l'accettazione integrale dei presenti Termini.</p>

<h2>2. Proprietà intellettuale</h2>
<p>Tutti i contenuti del Sito (testi, immagini, loghi, video, software) sono di proprietà di ${escape(a.controllerName)} o dei suoi licenzianti e sono protetti dalle vigenti leggi in materia di proprietà intellettuale.</p>

<h2>3. Uso consentito</h2>
<p>L'utente si impegna a utilizzare il Sito in conformità con la legge e in modo da non arrecare danni a terzi. È vietato qualsiasi utilizzo non autorizzato dei contenuti, copia, riproduzione, distribuzione o modifica senza il preventivo consenso scritto del Titolare.</p>

<h2>4. Limitazione di responsabilità</h2>
<p>${escape(a.controllerName)} non garantisce la continuità del servizio e non potrà essere ritenuta responsabile per danni diretti o indiretti derivanti dall'utilizzo o dall'impossibilità di utilizzo del Sito, salvo i casi di dolo o colpa grave.</p>

<h2>5. Modifiche</h2>
<p>Il Titolare si riserva il diritto di modificare in qualsiasi momento i presenti Termini, dandone comunicazione tramite il Sito. L'uso del Sito successivo alla pubblicazione delle modifiche costituisce accettazione delle stesse.</p>

<h2>6. Legge applicabile e foro competente</h2>
<p>I presenti Termini sono regolati dalla legge italiana. Per qualsiasi controversia sarà competente in via esclusiva il Foro di residenza del Titolare, fatti salvi i diritti dei consumatori ai sensi del Codice del Consumo.</p>

<h2>7. Contatti</h2>
<p>Per qualsiasi richiesta o chiarimento è possibile contattare il Titolare all'indirizzo <a href="mailto:${escape(a.contactEmail)}">${escape(a.contactEmail)}</a>.</p>

<hr/>
<p style="font-size:12px;opacity:.7">Documento generato con <a href="https://aicomplyonline.it" rel="noopener">ComplyAI</a>.</p>
  `.trim();
}

export function renderDocument(type: DocumentType, answers: PolicyAnswers): string {
  switch (type) {
    case "privacy":
      return renderPrivacyPolicy(answers);
    case "cookie":
      return renderCookiePolicy(answers);
    case "terms":
      return renderTermsOfService(answers);
    case "eula":
      return renderTermsOfService(answers);
  }
}

export const DOCUMENT_TITLES: Record<DocumentType, string> = {
  privacy: "Informativa Privacy",
  cookie: "Cookie Policy",
  terms: "Termini e Condizioni",
  eula: "EULA",
};
