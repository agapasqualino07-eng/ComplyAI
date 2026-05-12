import { notFound } from "next/navigation";

const LAST_UPDATED = "2026-05-11";

const DOCS: Record<string, { title: string; content: string }> = {
  privacy: {
    title: "Privacy Policy di AIComplyOnline",
    content: `
<p><em>Versione del ${LAST_UPDATED}. Il presente documento è redatto ai sensi degli artt. 13 e 14 del Regolamento (UE) 2016/679 (GDPR) e del D.lgs. 196/2003.</em></p>

<h2>1. Titolare del trattamento</h2>
<p>Titolare del trattamento è <strong>AIComplyOnline S.r.l.s.</strong> (di seguito "AIComplyOnline" o "noi"), con sede legale in Via Vitaliano Brancati 10, 95030 Mascalucia (CT), Italia.<br/>
Contatti: <a href="mailto:privacy@aicomplyonline.it">privacy@aicomplyonline.it</a>.</p>
<p>Non abbiamo nominato un Responsabile della Protezione dei Dati (DPO), non essendo obbligati ai sensi dell'art. 37 GDPR. Le richieste relative al trattamento dei dati personali possono essere indirizzate al Titolare ai contatti sopra riportati.</p>

<h2>2. Categorie di dati trattati</h2>
<ul>
  <li><strong>Dati di account</strong>: email, nome e cognome, password (in forma hashed).</li>
  <li><strong>Dati aziendali</strong>: ragione sociale, P.IVA, codice fiscale, sede, settore, numero dipendenti, email di contatto privacy.</li>
  <li><strong>Contenuti generati dall'utente</strong>: sistemi AI registrati, risposte al questionario di compliance, registrazioni formazione, documenti caricati o prodotti dalla piattaforma.</li>
  <li><strong>Dati di pagamento</strong>: NON trattati direttamente da noi. Gestiti integralmente da Stripe Payments Europe Ltd (vedi §6). Riceviamo solo identificativi non sensibili (customer id, subscription id, ultime 4 cifre carta).</li>
  <li><strong>Dati di navigazione e log tecnici</strong>: indirizzo IP, user-agent, timestamp, pagine visitate, eventi di autenticazione. Conservati per finalità di sicurezza per un massimo di 90 giorni.</li>
  <li><strong>Dati del Quiz pubblico</strong> (compilabili anche da non utenti): settore, fascia dipendenti, risposte, email opzionale.</li>
</ul>

<h2>3. Finalità e basi giuridiche</h2>
<table>
  <thead><tr><th>Finalità</th><th>Base giuridica (art. 6 GDPR)</th><th>Conservazione</th></tr></thead>
  <tbody>
    <tr><td>Erogazione del servizio SaaS</td><td>Esecuzione del contratto (1.b)</td><td>Durata del contratto + 10 anni (obblighi fiscali)</td></tr>
    <tr><td>Adempimenti fiscali e contabili</td><td>Obbligo legale (1.c)</td><td>10 anni</td></tr>
    <tr><td>Sicurezza, prevenzione frodi, log</td><td>Legittimo interesse (1.f)</td><td>90 giorni</td></tr>
    <tr><td>Marketing diretto via email (newsletter)</td><td>Consenso (1.a) o soft opt-in clienti</td><td>Fino a revoca</td></tr>
    <tr><td>Statistiche aggregate Quiz</td><td>Legittimo interesse (1.f)</td><td>24 mesi, poi anonimizzazione</td></tr>
  </tbody>
</table>

<h2>4. Conferimento dei dati</h2>
<p>Il conferimento dei dati di account e aziendali è necessario per fruire del servizio: il mancato conferimento impedisce la registrazione. Il conferimento dell'email per il Quiz e per la newsletter è facoltativo.</p>

<h2>5. Destinatari e responsabili esterni</h2>
<p>I dati possono essere comunicati a soggetti che agiscono in qualità di responsabili del trattamento ex art. 28 GDPR, con i quali abbiamo sottoscritto idonei accordi (DPA):</p>
<ul>
  <li><strong>Supabase Inc.</strong> — hosting database e autenticazione. Server in UE (Francoforte). DPA: <a href="https://supabase.com/legal/dpa" target="_blank" rel="noopener">supabase.com/legal/dpa</a></li>
  <li><strong>Vercel Inc.</strong> — hosting dell'applicazione web. Edge in UE. DPA: <a href="https://vercel.com/legal/dpa" target="_blank" rel="noopener">vercel.com/legal/dpa</a></li>
  <li><strong>Stripe Payments Europe Ltd</strong> — gestione pagamenti. Server in UE/USA. DPA: <a href="https://stripe.com/legal/dpa" target="_blank" rel="noopener">stripe.com/legal/dpa</a></li>
</ul>
<p>L'elenco completo e aggiornato dei sub-processor è disponibile su richiesta a <a href="mailto:privacy@aicomplyonline.it">privacy@aicomplyonline.it</a>.</p>

<h2>6. Trasferimenti extra-UE</h2>
<p>Alcuni fornitori (Stripe, Vercel) hanno entità o infrastrutture negli Stati Uniti. I trasferimenti avvengono sulla base delle <strong>Clausole Contrattuali Tipo</strong> approvate dalla Commissione Europea (Decisione 2021/914) e, ove applicabile, della certificazione <strong>EU-US Data Privacy Framework</strong> (Decisione di adeguatezza 2023/1795). È possibile richiedere copia delle salvaguardie applicate scrivendoci.</p>

<h2>7. Diritti dell'interessato</h2>
<p>Hai diritto a esercitare in qualsiasi momento i diritti previsti dagli artt. 15-22 GDPR:</p>
<ul>
  <li>Accesso ai tuoi dati personali</li>
  <li>Rettifica</li>
  <li>Cancellazione ("diritto all'oblio") — disponibile anche in autonomia da <em>Impostazioni → Account</em></li>
  <li>Limitazione del trattamento</li>
  <li>Portabilità dei dati (formato CSV/JSON)</li>
  <li>Opposizione</li>
  <li>Revoca del consenso (per i trattamenti basati sul consenso)</li>
  <li>Reclamo al Garante per la Protezione dei Dati Personali (<a href="https://www.garanteprivacy.it" target="_blank" rel="noopener">www.garanteprivacy.it</a>)</li>
</ul>
<p>Le richieste vanno inviate a <a href="mailto:privacy@aicomplyonline.it">privacy@aicomplyonline.it</a> e saranno evase entro 30 giorni.</p>

<h2>8. Sicurezza</h2>
<p>Adottiamo misure tecniche e organizzative adeguate: cifratura in transito (TLS 1.2+) e a riposo, Row Level Security sul database, autenticazione tramite token JWT, backup giornalieri, controllo accessi basato sui ruoli, monitoraggio degli accessi.</p>

<h2>9. Modifiche alla policy</h2>
<p>Eventuali aggiornamenti sostanziali saranno notificati via email almeno 30 giorni prima dell'entrata in vigore.</p>
`,
  },
  cookie: {
    title: "Cookie Policy di AIComplyOnline",
    content: `
<p><em>Versione del ${LAST_UPDATED}. Documento redatto ai sensi del Provvedimento del Garante Privacy del 10 giugno 2021.</em></p>

<h2>Cos'è un cookie</h2>
<p>I cookie sono piccoli file di testo memorizzati dal tuo browser. Possono essere "tecnici" (necessari al funzionamento del sito) o "di profilazione" (per tracciare l'utente). AIComplyOnline utilizza esclusivamente cookie tecnici.</p>

<h2>Cookie utilizzati su aicomplyonline.it</h2>
<table>
  <thead><tr><th>Nome</th><th>Fornitore</th><th>Finalità</th><th>Durata</th><th>Tipologia</th></tr></thead>
  <tbody>
    <tr><td><code>sb-*-auth-token</code></td><td>Supabase (1st party)</td><td>Autenticazione utente</td><td>1 anno</td><td>Tecnico necessario</td></tr>
    <tr><td><code>aicomply-cookie-consent</code></td><td>AIComplyOnline (1st party)</td><td>Memorizza la scelta sui cookie</td><td>1 anno</td><td>Tecnico necessario</td></tr>
    <tr><td><code>__stripe_mid</code>, <code>__stripe_sid</code></td><td>Stripe</td><td>Prevenzione frodi sui pagamenti</td><td>1 anno / 30 min</td><td>Tecnico necessario</td></tr>
  </tbody>
</table>

<h2>Cookie di profilazione o di terze parti</h2>
<p>AIComplyOnline <strong>NON utilizza</strong> cookie di profilazione, di marketing o di tracciamento di terze parti (es. Google Analytics, Facebook Pixel). Non è pertanto richiesto consenso ex art. 7 GDPR.</p>

<h2>Come gestire i cookie</h2>
<p>Puoi disabilitare i cookie tecnici dal tuo browser, ma il sito potrebbe non funzionare correttamente (autenticazione e pagamenti). Guide per i principali browser:</p>
<ul>
  <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener">Google Chrome</a></li>
  <li><a href="https://support.mozilla.org/it/kb/Attivare%20e%20disattivare%20i%20cookie" target="_blank" rel="noopener">Mozilla Firefox</a></li>
  <li><a href="https://support.apple.com/it-it/guide/safari/sfri11471/mac" target="_blank" rel="noopener">Safari</a></li>
  <li><a href="https://support.microsoft.com/it-it/microsoft-edge" target="_blank" rel="noopener">Microsoft Edge</a></li>
</ul>
`,
  },
  terms: {
    title: "Termini e condizioni di AIComplyOnline",
    content: `
<p><em>Versione del ${LAST_UPDATED}.</em></p>

<h2>1. Oggetto</h2>
<p>I presenti Termini disciplinano l'utilizzo del servizio software-as-a-service "AIComplyOnline" (di seguito "Servizio"), erogato da <strong>AIComplyOnline S.r.l.s.</strong>, sede in Via Vitaliano Brancati 10, 95030 Mascalucia (CT), Italia, P.IVA IT123456789 (di seguito "Fornitore").</p>

<h2>2. Descrizione del Servizio</h2>
<p>AIComplyOnline è una piattaforma che supporta le aziende nell'adeguamento al Regolamento (UE) 2024/1689 ("AI Act") e alla Legge 23 settembre 2025 n. 132. Il Servizio include: questionario di valutazione, registro dei sistemi AI, generazione di documenti standard, tracking della formazione AI literacy, feed normativo.</p>
<p><strong>Limite di non consulenza</strong>: il Servizio NON costituisce consulenza legale o tecnica. I documenti generati sono modelli standard che possono richiedere personalizzazioni a cura di un consulente.</p>

<h2>3. Conclusione del contratto e prova gratuita</h2>
<p>Il contratto si conclude con la registrazione dell'account. Tutti i nuovi account beneficiano di una <strong>prova gratuita di 14 giorni</strong> al piano Pro, senza richiesta di carta di credito. Al termine della prova, l'account rimane attivo sul piano Free fino all'eventuale scelta di un piano a pagamento.</p>

<h2>4. Piani e corrispettivi</h2>
<p>I piani e i prezzi sono pubblicati su <a href="/#pricing">aicomplyonline.it/#pricing</a>. I corrispettivi sono comprensivi di IVA se applicabile. Il pagamento avviene tramite Stripe in via anticipata con cadenza mensile o annuale. Il rinnovo è automatico salvo disdetta.</p>

<h2>5. Diritto di recesso (consumatori)</h2>
<p>Ai sensi degli artt. 52 e ss. del D.lgs. 206/2005 (Codice del Consumo), il consumatore ha diritto di recedere dal contratto entro <strong>14 giorni</strong> dalla sottoscrizione senza alcuna penalità, salvo che il Servizio sia stato pienamente eseguito con il suo consenso espresso prima della scadenza del termine. Il recesso si esercita scrivendo a <a href="mailto:support@aicomplyonline.it">support@aicomplyonline.it</a>.</p>

<h2>6. Disdetta</h2>
<p>L'utente può disdire l'abbonamento in qualsiasi momento da <em>Impostazioni → Fatturazione</em> o tramite il portale clienti Stripe. La disdetta ha effetto al termine del periodo di fatturazione in corso; non è previsto rimborso del periodo residuo.</p>

<h2>7. Obblighi dell'utente</h2>
<p>L'utente si impegna a: (i) fornire dati veritieri; (ii) custodire le credenziali; (iii) non utilizzare il Servizio per scopi illeciti o per caricare contenuti di cui non detenga i diritti; (iv) non tentare di accedere a dati di altri utenti o di compromettere la sicurezza del Servizio.</p>

<h2>8. Proprietà intellettuale</h2>
<p>Il software, il marchio "AIComplyOnline", il design e i modelli di documento sono di proprietà esclusiva del Fornitore. All'utente è concessa una licenza non esclusiva, non trasferibile e revocabile per l'uso del Servizio nei limiti dei presenti Termini. I dati e i documenti caricati dall'utente restano di sua proprietà; il Fornitore opera in qualità di responsabile del trattamento ai sensi dell'art. 28 GDPR (vedi <a href="/legal/dpa">DPA</a>).</p>

<h2>9. Livelli di servizio (SLA)</h2>
<p>Per i piani a pagamento, il Fornitore garantisce un uptime mensile del <strong>99,5%</strong>. In caso di mancato rispetto, è previsto un credito proporzionale sul canone del mese successivo, su richiesta dell'utente entro 30 giorni.</p>

<h2>10. Limitazione di responsabilità</h2>
<p>Salvo i casi di dolo e colpa grave, la responsabilità complessiva del Fornitore è limitata all'importo dei corrispettivi pagati dall'utente nei 12 mesi precedenti l'evento. Il Fornitore non risponde dei danni indiretti, della perdita di profitto, della mancata conformità normativa derivante da un uso non corretto del Servizio o da scelte autonome dell'utente.</p>

<h2>11. Modifiche ai Termini</h2>
<p>Eventuali modifiche sostanziali saranno comunicate via email con preavviso di almeno 30 giorni. L'utente che non intende accettarle può recedere senza oneri.</p>

<h2>12. Legge applicabile e foro</h2>
<p>I presenti Termini sono regolati dalla legge italiana. Per le controversie con consumatori è competente in via esclusiva il Foro di residenza o domicilio del consumatore. Per le controversie tra imprese è competente in via esclusiva il Foro di Catania.</p>

<h2>13. Contatti</h2>
<p>Supporto generale: <a href="mailto:support@aicomplyonline.it">support@aicomplyonline.it</a><br/>
Privacy: <a href="mailto:privacy@aicomplyonline.it">privacy@aicomplyonline.it</a></p>
`,
  },
  dpa: {
    title: "Data Processing Agreement (DPA) — AIComplyOnline",
    content: `
<p><em>Versione del ${LAST_UPDATED}. Documento integrativo ai Termini di Servizio, ai sensi dell'art. 28 GDPR.</em></p>

<h2>1. Premesse</h2>
<p>Il presente Data Processing Agreement ("DPA") disciplina il trattamento dei dati personali che <strong>AIComplyOnline S.r.l.s.</strong> (di seguito "Responsabile") effettua per conto del Cliente (di seguito "Titolare") nell'erogazione del Servizio AIComplyOnline.</p>

<h2>2. Oggetto, natura e finalità del trattamento</h2>
<ul>
  <li><strong>Oggetto</strong>: dati personali necessari all'erogazione del Servizio.</li>
  <li><strong>Natura</strong>: hosting, archiviazione, elaborazione, backup, generazione documenti.</li>
  <li><strong>Finalità</strong>: erogazione delle funzionalità di compliance AI Act.</li>
  <li><strong>Durata</strong>: durata del contratto + periodi di conservazione previsti.</li>
  <li><strong>Categorie di interessati</strong>: dipendenti, collaboratori, fornitori del Titolare; soggetti i cui dati sono trattati da sistemi AI registrati dal Titolare.</li>
  <li><strong>Categorie di dati</strong>: dati anagrafici e di contatto; dati relativi alla formazione; metadati dei sistemi AI in uso.</li>
</ul>

<h2>3. Obblighi del Responsabile</h2>
<p>Il Responsabile si impegna a:</p>
<ul>
  <li>Trattare i dati esclusivamente su istruzioni documentate del Titolare e nei limiti del Servizio;</li>
  <li>Garantire la riservatezza del personale autorizzato al trattamento;</li>
  <li>Adottare misure tecniche e organizzative adeguate ex art. 32 GDPR (vedi Allegato A);</li>
  <li>Notificare al Titolare ogni violazione di dati personali entro 48 ore dalla scoperta;</li>
  <li>Assistere il Titolare nel rispondere alle richieste degli interessati;</li>
  <li>Restituire o cancellare i dati al termine del contratto, su scelta del Titolare;</li>
  <li>Mettere a disposizione del Titolare le informazioni necessarie a dimostrare la conformità, consentendo audit annuali su preavviso ragionevole.</li>
</ul>

<h2>4. Sub-responsabili</h2>
<p>Il Titolare autorizza in via generale il ricorso ai sub-responsabili elencati in <a href="/legal/sub-processori">aicomplyonline.it/legal/sub-processori</a>. Il Responsabile comunicherà via email eventuali modifiche con preavviso di 30 giorni; il Titolare può opporsi per motivate ragioni, con facoltà di recesso senza oneri qualora non si raggiunga un accordo.</p>

<h2>5. Trasferimenti extra-UE</h2>
<p>Eventuali trasferimenti avvengono sulla base delle Clausole Contrattuali Tipo (CCT) approvate dalla Commissione UE o, ove applicabile, del Data Privacy Framework UE-USA.</p>

<h2>6. Allegato A — Misure di sicurezza</h2>
<ul>
  <li>Cifratura TLS 1.2+ in transito; AES-256 a riposo (Supabase managed Postgres).</li>
  <li>Autenticazione tramite token JWT firmati; password con hash bcrypt.</li>
  <li>Row Level Security (RLS) a livello database per isolamento multi-tenant.</li>
  <li>Backup giornalieri retention 7 giorni (piano free/pro), 30 giorni (enterprise).</li>
  <li>Controllo accessi role-based (RBAC) con ruoli: owner, admin, editor, viewer.</li>
  <li>Audit log delle operazioni amministrative.</li>
  <li>Monitoraggio continuo della sicurezza tramite il fornitore di hosting.</li>
</ul>

<p><strong>Sottoscrizione</strong>: la sottoscrizione del Servizio costituisce accettazione del presente DPA. Per richieste di firma di una versione bilaterale, contattare <a href="mailto:privacy@aicomplyonline.it">privacy@aicomplyonline.it</a>.</p>
`,
  },
  "sub-processori": {
    title: "Elenco dei sub-responsabili (sub-processor)",
    content: `
<p><em>Versione del ${LAST_UPDATED}. Documento integrativo del <a href="/legal/dpa">DPA</a>.</em></p>

<p>AIComplyOnline utilizza i seguenti fornitori in qualità di <strong>sub-responsabili del trattamento</strong> (sub-processor) ex art. 28.2 GDPR. Tutti i fornitori sono stati selezionati per offrire garanzie sufficienti in termini di protezione dei dati ed hanno sottoscritto idonei Data Processing Agreement.</p>

<h2>Sub-processor attualmente attivi</h2>

<table>
  <thead>
    <tr><th>Fornitore</th><th>Servizio</th><th>Dati trattati</th><th>Sede / regione</th><th>DPA</th></tr>
  </thead>
  <tbody>
    <tr>
      <td>Supabase Inc.</td>
      <td>Database PostgreSQL, autenticazione utenti, storage</td>
      <td>Tutti i dati di account e di applicazione</td>
      <td>UE (Francoforte, Irlanda)</td>
      <td><a href="https://supabase.com/legal/dpa" target="_blank" rel="noopener">DPA</a></td>
    </tr>
    <tr>
      <td>Vercel Inc.</td>
      <td>Hosting frontend e API serverless</td>
      <td>Log applicativi, request/response metadata</td>
      <td>UE (Edge); HQ USA</td>
      <td><a href="https://vercel.com/legal/dpa" target="_blank" rel="noopener">DPA</a></td>
    </tr>
    <tr>
      <td>Stripe Payments Europe Ltd</td>
      <td>Gestione pagamenti e fatturazione</td>
      <td>Dati di pagamento, identificativi cliente</td>
      <td>UE (Irlanda); processing globale</td>
      <td><a href="https://stripe.com/legal/dpa" target="_blank" rel="noopener">DPA</a></td>
    </tr>
  </tbody>
</table>

<h2>Trasferimenti extra-UE</h2>
<p>Vercel e Stripe sono entità con casa madre negli USA. I trasferimenti dei dati personali avvengono sulla base di:</p>
<ul>
  <li><strong>Clausole Contrattuali Tipo (CCT)</strong> approvate dalla Decisione UE 2021/914;</li>
  <li><strong>Certificazione EU-US Data Privacy Framework</strong> (Decisione di adeguatezza 2023/1795), ove applicabile;</li>
  <li>Salvaguardie tecniche aggiuntive: cifratura end-to-end, regionalizzazione UE dove possibile.</li>
</ul>

<h2>Modifiche all'elenco</h2>
<p>AIComplyOnline si impegna a comunicare via email a tutti i clienti business eventuali aggiunte o sostituzioni di sub-processor con preavviso di <strong>30 giorni</strong>. Il cliente può opporsi alla modifica per motivate ragioni; in mancanza di accordo, è prevista la possibilità di recesso senza oneri.</p>

<h2>Richieste e contatti</h2>
<p>Per copia firmata di un singolo DPA o richieste su una specifica sub-fornitura, scrivere a <a href="mailto:privacy@aicomplyonline.it">privacy@aicomplyonline.it</a>.</p>
`,
  },
  sicurezza: {
    title: "Trust Center — Sicurezza e protezione dei dati",
    content: `
<p><em>Versione del ${LAST_UPDATED}.</em></p>

<p>AIComplyOnline tratta dati di compliance regolamentare per aziende italiane. La sicurezza e l'integrità di questi dati sono al centro della nostra architettura. Questa pagina descrive in trasparenza le misure tecniche e organizzative che adottiamo.</p>

<h2>1. Crittografia</h2>
<ul>
  <li><strong>In transito</strong>: HTTPS obbligatorio (HSTS, TLS 1.2+). Connessioni HTTP automaticamente reindirizzate.</li>
  <li><strong>A riposo</strong>: AES-256 sui database PostgreSQL gestiti da Supabase.</li>
  <li><strong>Password</strong>: salvate con hash bcrypt (work factor adeguato), mai in chiaro.</li>
  <li><strong>Token di sessione</strong>: JWT firmati, scadenza configurata.</li>
</ul>

<h2>2. Architettura multi-tenant sicura</h2>
<ul>
  <li><strong>Row Level Security (RLS)</strong> PostgreSQL su tutte le tabelle: ogni cliente vede solo i propri dati, anche in caso di bug applicativo.</li>
  <li><strong>Isolamento per organizzazione</strong>: ogni risorsa è associata a un <code>organization_id</code> e l'accesso è filtrato a livello database.</li>
  <li><strong>RBAC</strong> (Role-Based Access Control): ruoli owner, admin, editor, viewer con privilegi differenziati.</li>
</ul>

<h2>3. Autenticazione</h2>
<ul>
  <li>Password policy: minimo 8 caratteri, almeno una lettera e un numero, blacklist password comuni.</li>
  <li>Multi-Factor Authentication (MFA) — disponibile su richiesta per piano Enterprise.</li>
  <li>Logout su tutti i device disponibile dalla pagina profilo.</li>
  <li>Sessioni con refresh token auto-rotanti.</li>
</ul>

<h2>4. Hardening dell'applicazione</h2>
<ul>
  <li><strong>Content Security Policy (CSP)</strong> stretta.</li>
  <li><strong>X-Frame-Options</strong>: DENY (no embedding in iframe).</li>
  <li><strong>HSTS</strong>: 2 anni, includeSubDomains, preload.</li>
  <li><strong>Permissions-Policy</strong>: nessun accesso a camera/microfono/geolocation.</li>
  <li><strong>Rate limiting</strong> sugli endpoint pubblici.</li>
  <li>Protezione CSRF su API tramite SameSite cookies.</li>
</ul>

<h2>5. Audit e logging</h2>
<ul>
  <li>Audit log delle azioni significative (creazione/modifica documenti, sistemi AI, formazione, abbonamenti).</li>
  <li>Log di sicurezza con retention 90 giorni e purge automatica.</li>
  <li>Accesso ai log riservato a owner/admin tramite RLS.</li>
</ul>

<h2>6. Backup e disaster recovery</h2>
<ul>
  <li>Backup automatici giornalieri (Supabase managed) cifrati.</li>
  <li>Retention: 7 giorni (Free/Pro), 30 giorni (Enterprise).</li>
  <li>Procedura di restore documentata; test annuale.</li>
</ul>

<h2>7. Sub-processor</h2>
<p>Elenco completo e DPA: <a href="/legal/sub-processori">aicomplyonline.it/legal/sub-processori</a>.</p>

<h2>8. Gestione incidenti e responsible disclosure</h2>
<ul>
  <li>Procedura di Data Breach interna allineata agli artt. 33-34 GDPR (notifica al Garante entro 72h).</li>
  <li>Programma di responsible disclosure: vulnerabilità segnalabili a <a href="mailto:security@aicomplyonline.it">security@aicomplyonline.it</a>.</li>
  <li>Vedi anche <a href="/.well-known/security.txt"><code>/.well-known/security.txt</code></a> (RFC 9116).</li>
</ul>

<h2>9. Conformità normativa</h2>
<ul>
  <li><strong>GDPR</strong> (Reg. UE 2016/679) — Titolare e Responsabile a seconda del trattamento.</li>
  <li><strong>D.lgs. 196/2003</strong> (Codice Privacy).</li>
  <li>Provvedimento Garante 10/6/2021 (cookie).</li>
  <li>Misure di sicurezza ex art. 32 GDPR documentate nella DPIA volontaria.</li>
</ul>

<h2>10. Trasparenza</h2>
<p>Per ulteriori dettagli tecnici, audit di sicurezza o richieste di documenti compliance:</p>
<ul>
  <li>Email: <a href="mailto:security@aicomplyonline.it">security@aicomplyonline.it</a></li>
  <li>Privacy: <a href="mailto:privacy@aicomplyonline.it">privacy@aicomplyonline.it</a></li>
</ul>
`,
  },
};

export async function generateMetadata({ params }: { params: Promise<{ doc: string }> }) {
  const { doc } = await params;
  const d = DOCS[doc];
  return { title: d?.title || "Documento legale" };
}

export default async function LegalPage({ params }: { params: Promise<{ doc: string }> }) {
  const { doc } = await params;
  const d = DOCS[doc];
  if (!d) notFound();

  return (
    <div className="container-narrow py-12">
      <h1 className="text-3xl font-display font-bold mb-2">{d.title}</h1>
      <p className="text-muted-foreground mb-8">Ultimo aggiornamento: {new Date(LAST_UPDATED).toLocaleDateString("it-IT", { day: "2-digit", month: "long", year: "numeric" })}</p>
      <article className="policy-prose" dangerouslySetInnerHTML={{ __html: d.content }} />
    </div>
  );
}

export function generateStaticParams() {
  return Object.keys(DOCS).map((doc) => ({ doc }));
}
