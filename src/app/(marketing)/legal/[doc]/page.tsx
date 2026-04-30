import { notFound } from "next/navigation";

const DOCS: Record<string, { title: string; content: string }> = {
  privacy: {
    title: "Privacy Policy di ComplyAI",
    content: `
<h2>1. Titolare del trattamento</h2>
<p>Il titolare del trattamento dei dati raccolti tramite questo sito è ComplyAI, contattabile all'indirizzo <a href="mailto:privacy@aicomplyonline.it">privacy@aicomplyonline.it</a>.</p>
<h2>2. Dati raccolti</h2>
<p>Raccogliamo: email, nome, dati aziendali, log di utilizzo del servizio, dati di pagamento (gestiti da Stripe).</p>
<h2>3. Finalità</h2>
<p>I dati sono trattati per fornirti il servizio, gestire abbonamenti e fornire supporto. Base giuridica: esecuzione del contratto (art. 6.1.b GDPR).</p>
<h2>4. Diritti</h2>
<p>Hai diritto a accesso, rettifica, cancellazione, opposizione e portabilità. Scrivici a <a href="mailto:privacy@aicomplyonline.it">privacy@aicomplyonline.it</a>.</p>
<h2>5. Conservazione</h2>
<p>I tuoi dati sono conservati per la durata del contratto e successivamente per gli obblighi di legge applicabili.</p>
`,
  },
  cookie: {
    title: "Cookie Policy di ComplyAI",
    content: `
<h2>Cookie utilizzati</h2>
<p>Il sito aicomplyonline.it utilizza esclusivamente cookie tecnici e di sessione necessari al funzionamento del servizio. Non sono presenti cookie di profilazione o marketing.</p>
<h2>Servizi terzi</h2>
<p>Utilizziamo Stripe (gestione pagamenti) e Supabase (autenticazione). Tali servizi possono impostare cookie tecnici essenziali al funzionamento.</p>
`,
  },
  terms: {
    title: "Termini di servizio di ComplyAI",
    content: `
<h2>1. Servizio</h2>
<p>ComplyAI fornisce strumenti software per supportare le aziende nella compliance privacy. I documenti generati hanno carattere standard e potrebbero richiedere personalizzazioni in casi specifici.</p>
<h2>2. Abbonamenti</h2>
<p>Gli abbonamenti sono mensili o annuali. Il rinnovo è automatico. Puoi annullare in qualsiasi momento dal tuo account o dal portale di Stripe.</p>
<h2>3. Limitazione di responsabilità</h2>
<p>ComplyAI non si assume responsabilità per l'uso improprio dei documenti generati o per il mancato adeguamento normativo del cliente.</p>
<h2>4. Foro competente</h2>
<p>Per qualsiasi controversia è competente il Foro del consumatore.</p>
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
      <p className="text-muted-foreground mb-8">Ultimo aggiornamento: {new Date().toLocaleDateString("it-IT", { day: "2-digit", month: "long", year: "numeric" })}</p>
      <article className="policy-prose" dangerouslySetInnerHTML={{ __html: d.content }} />
    </div>
  );
}
