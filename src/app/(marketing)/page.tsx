import Link from "next/link";
import {
  Bot,
  FileText,
  GraduationCap,
  Bell,
  ShieldCheck,
  Sparkles,
  Zap,
  Lock,
  CheckCircle2,
  ArrowRight,
  AlertTriangle,
  Calendar,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const features = [
  {
    icon: Bot,
    title: "Registro sistemi AI",
    desc: "Inventario di tutti i sistemi AI usati in azienda (ChatGPT, Copilot, Gemini, chatbot…) con classificazione di rischio guidata.",
  },
  {
    icon: ShieldCheck,
    title: "Classificatore di rischio",
    desc: "Wizard in 5 passi che classifica ogni sistema: vietato (Art. 5), alto rischio (Annex III), trasparenza (Art. 50), minimo, GPAI.",
  },
  {
    icon: FileText,
    title: "Documenti audit-ready",
    desc: "Policy interna, Informativa AI ai dipendenti (Art. 11 L.132/2025), Disclosure clienti (Art. 50 AI Act), Registro formale.",
  },
  {
    icon: GraduationCap,
    title: "Formazione AI literacy",
    desc: "4 moduli formativi pronti per i tuoi dipendenti, con tracking ore e attestati. Adempi all'Art. 4 AI Act.",
  },
  {
    icon: Bell,
    title: "Alert normativi",
    desc: "Feed continuo delle scadenze AI Act e degli aggiornamenti L. 132/2025 applicabili alla tua azienda.",
  },
  {
    icon: Building2,
    title: "Modalità multi-azienda",
    desc: "Per studi commercialisti, legali e consulenti: workspace dedicato per ogni cliente, white-label, audit trail.",
  },
];

const deadlines = [
  { date: "1 ago 2024", label: "AI Act in vigore", status: "in vigore" },
  { date: "2 feb 2025", label: "Pratiche vietate (Art. 5) + AI literacy (Art. 4)", status: "in vigore" },
  { date: "2 ago 2025", label: "Obblighi GPAI", status: "in vigore" },
  { date: "10 ott 2025", label: "Legge italiana 132/2025: informativa dipendenti", status: "in vigore" },
  { date: "2 ago 2026", label: "Sistemi alto rischio (Annex III) + trasparenza Art. 50", status: "in arrivo" },
  { date: "2 nov 2026", label: "Watermarking obbligatorio contenuti AI", status: "in arrivo" },
];

const prohibitedPractices = [
  "Manipolazione subliminale",
  "Sfruttamento delle vulnerabilità",
  "Social scoring",
  "Predictive policing su persone fisiche",
  "Riconoscimento emozioni al lavoro/scuola",
  "Categorizzazione biometrica per attributi sensibili",
  "Identificazione biometrica remota in tempo reale",
  "Scraping non mirato di immagini facciali",
];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-50 via-white to-blue-50 -z-10" />
        <div className="absolute inset-0 grid-bg opacity-40 -z-10" />
        <div className="container-wide pt-16 pb-12 sm:pt-24 sm:pb-20">
          <div className="max-w-3xl mx-auto text-center space-y-6 animate-fade-in">
            <Badge variant="secondary" className="bg-white border">
              <Sparkles className="h-3 w-3 mr-1.5 text-violet-600" />
              Quiz gratuito di compliance · 3 minuti
            </Badge>
            <h1 className="text-4xl sm:text-6xl font-display font-bold tracking-tight">
              La tua azienda è a norma con<br />
              <span className="gradient-text">AI Act</span> e <span className="gradient-text">Legge 132/2025</span>?
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
              Scoprilo in 3 minuti col nostro quiz gratuito. Poi gestisci tutto da una piattaforma: registro IA, documenti audit-ready, formazione dei dipendenti e alert normativi.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link href="/quiz">
                <Button size="xl" variant="gradient">
                  Fai il quiz gratuito <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/pricing">
                <Button size="xl" variant="outline">
                  Vedi i prezzi
                </Button>
              </Link>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-6 pt-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-500" />Senza registrazione</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-500" />Report istantaneo</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-500" />Server in UE 🇪🇺</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats / urgency */}
      <section className="border-y bg-muted/20 py-10">
        <div className="container-wide grid sm:grid-cols-3 gap-6 text-center max-w-4xl mx-auto">
          <div>
            <p className="text-4xl font-display font-bold text-violet-600">4,9M</p>
            <p className="text-sm text-muted-foreground mt-1">PMI italiane che possono usare AI</p>
          </div>
          <div>
            <p className="text-4xl font-display font-bold text-violet-600">35M€</p>
            <p className="text-sm text-muted-foreground mt-1">Sanzione max AI Act (o 7% fatturato)</p>
          </div>
          <div>
            <p className="text-4xl font-display font-bold text-violet-600">52%</p>
            <p className="text-sm text-muted-foreground mt-1">Imprese non ha chiaro il quadro normativo</p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 sm:py-24">
        <div className="container-wide">
          <div className="max-w-2xl mx-auto text-center space-y-3 mb-14">
            <Badge variant="secondary">Tutto in una piattaforma</Badge>
            <h2 className="text-3xl sm:text-4xl font-display font-bold">
              Compliance AI senza un avvocato.
            </h2>
            <p className="text-muted-foreground">
              AIComply è la piattaforma italiana che ti aiuta a essere a norma con l'AI Act e la Legge 132/2025, passo per passo.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="card-soft p-6">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary grid place-items-center mb-4">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-display font-semibold text-lg">{f.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1.5">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Deadlines */}
      <section className="py-20 bg-muted/30 border-y">
        <div className="container-wide max-w-4xl mx-auto">
          <div className="text-center space-y-3 mb-10">
            <Badge variant="secondary">
              <Calendar className="h-3 w-3 mr-1.5" />
              Calendario AI Act
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-display font-bold">Scadenze che ti riguardano</h2>
            <p className="text-muted-foreground">
              L'AI Act è già in vigore. Ecco le date chiave.
            </p>
          </div>
          <div className="space-y-2">
            {deadlines.map((d) => (
              <div key={d.date} className="flex items-center gap-4 rounded-lg border bg-card p-4">
                <div className="font-mono text-xs sm:text-sm font-semibold text-violet-700 shrink-0 w-24">{d.date}</div>
                <div className="flex-1">{d.label}</div>
                <Badge variant={d.status === "in vigore" ? "destructive" : "warning"} className="shrink-0">
                  {d.status}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Prohibited practices */}
      <section className="py-20">
        <div className="container-wide max-w-5xl mx-auto">
          <div className="text-center space-y-3 mb-10">
            <Badge variant="destructive">
              <AlertTriangle className="h-3 w-3 mr-1.5" />
              Art. 5 AI Act
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-display font-bold">Le 8 pratiche AI vietate</h2>
            <p className="text-muted-foreground">
              In vigore dal 2 febbraio 2025. Sanzione fino a 35M€ o 7% del fatturato.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3">
            {prohibitedPractices.map((p, i) => (
              <div key={p} className="rounded-lg border bg-red-50 border-red-200 p-4 text-sm text-red-900">
                <div className="font-bold text-xs uppercase tracking-wide mb-1">#{i + 1}</div>
                {p}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 border-t bg-muted/20">
        <div className="container-wide">
          <div className="max-w-2xl mx-auto text-center space-y-3 mb-12">
            <Badge variant="secondary">Tre passaggi</Badge>
            <h2 className="text-3xl sm:text-4xl font-display font-bold">A norma in meno di un'ora.</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              { n: "1", title: "Fai il quiz gratuito", desc: "17 domande in 3 minuti. Ricevi un report personalizzato.", icon: Sparkles },
              { n: "2", title: "Registra i sistemi AI", desc: "Vendor Intelligence: classificatore guidato per ogni sistema in uso.", icon: Bot },
              { n: "3", title: "Genera i documenti", desc: "Policy interna, Informativa Art. 11 ai dipendenti, Disclosure clienti.", icon: FileText },
            ].map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.n} className="relative rounded-xl border bg-card p-6">
                  <div className="absolute -top-3 left-6 h-7 w-7 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 text-white text-sm font-bold grid place-items-center">
                    {step.n}
                  </div>
                  <Icon className="h-6 w-6 text-primary mt-2" />
                  <h3 className="font-display font-semibold text-lg mt-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1.5">{step.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* For who */}
      <section className="py-20">
        <div className="container-wide grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          <div className="rounded-2xl border bg-card p-8">
            <Building2 className="h-8 w-8 text-violet-600 mb-3" />
            <h3 className="text-2xl font-display font-bold">Per la tua PMI</h3>
            <p className="text-muted-foreground mt-2">Piano <strong>Pro a 29€/mese</strong></p>
            <ul className="mt-4 space-y-2 text-sm">
              <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />Gestione di 1 azienda</li>
              <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />Registro IA + classificatore + 4 documenti audit-ready</li>
              <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />Formazione AI literacy tracciata</li>
              <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />Alert normativi automatici</li>
            </ul>
            <Link href="/signup" className="mt-6 inline-block">
              <Button variant="gradient">Attiva il Pro</Button>
            </Link>
          </div>
          <div className="rounded-2xl border-2 border-primary bg-card p-8 ring-1 ring-primary/30">
            <ShieldCheck className="h-8 w-8 text-violet-600 mb-3" />
            <h3 className="text-2xl font-display font-bold">Per studi e consulenti</h3>
            <p className="text-muted-foreground mt-2">Piano <strong>Enterprise a 199€/mese</strong></p>
            <ul className="mt-4 space-y-2 text-sm">
              <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />Multi-cliente (10 slot inclusi)</li>
              <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />Workspace dedicato per cliente</li>
              <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />Audit trail + report attività</li>
              <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />White-label + account manager</li>
            </ul>
            <Link href="/signup?plan=enterprise" className="mt-6 inline-block">
              <Button variant="gradient">Attiva l'Enterprise</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="py-16">
        <div className="container-wide grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {[
            { icon: Lock, title: "Server in UE", desc: "Infrastruttura europea, dati al sicuro." },
            { icon: ShieldCheck, title: "AI Act-ready", desc: "Costruito da zero su Reg. UE 2024/1689 + L. 132/2025." },
            { icon: Zap, title: "Sempre aggiornato", desc: "Quando cambia una norma, lo facciamo per te." },
          ].map((t) => {
            const Icon = t.icon;
            return (
              <div key={t.title} className="text-center space-y-2">
                <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary grid place-items-center mx-auto">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-semibold">{t.title}</h3>
                <p className="text-sm text-muted-foreground">{t.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 border-t">
        <div className="container-narrow">
          <div className="text-center mb-10 space-y-3">
            <Badge variant="secondary">FAQ</Badge>
            <h2 className="text-3xl sm:text-4xl font-display font-bold">Domande frequenti</h2>
          </div>
          <div className="space-y-4">
            {[
              {
                q: "La mia PMI usa solo ChatGPT, mi riguarda davvero l'AI Act?",
                a: "Sì. L'AI Act si applica anche a chi usa AI di terzi (sei un Deployer). Devi: 1) tenere un registro dei sistemi AI usati, 2) garantire AI literacy ai dipendenti (Art. 4), 3) dare un'informativa scritta sui sistemi AI che incidono sul lavoro (Art. 11 L.132/2025).",
              },
              {
                q: "AIComply sostituisce un avvocato?",
                a: "No. Forniamo strumenti e documenti standard adatti alla maggior parte delle PMI. Per situazioni complesse (sanità, settore bancario, sistemi alto rischio) consigliamo comunque la consulenza di un legale specializzato.",
              },
              {
                q: "I miei dati sono sicuri?",
                a: "Sì. Server in UE (Frankfurt), cifratura at-rest, backup quotidiani. Non vendiamo né condividiamo dati con terzi. RLS su tutte le tabelle: ogni cliente vede solo i propri dati.",
              },
              {
                q: "Posso annullare quando voglio?",
                a: "Certo. Nessun vincolo. Se annulli mantieni l'accesso fino alla fine del periodo già pagato.",
              },
              {
                q: "Cosa succede dopo aver fatto il quiz?",
                a: "Ricevi un report con score, sistemi rilevati, obblighi che ti riguardano. I dati restano salvati localmente nel tuo browser. Se ti iscrivi al Pro, importiamo automaticamente il tuo report nella dashboard.",
              },
              {
                q: "Sono un commercialista, posso usare AIComply per i miei clienti?",
                a: "Sì, è esattamente quello che fa il piano Enterprise (199€/mese). Gestisci fino a 10 clienti con workspace dedicati, audit trail e white-label.",
              },
            ].map((f, i) => (
              <details key={i} className="group rounded-lg border bg-card p-4">
                <summary className="font-medium cursor-pointer flex items-center justify-between">
                  {f.q}
                  <span className="text-muted-foreground group-open:rotate-45 transition-transform">+</span>
                </summary>
                <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container-wide">
          <div className="rounded-2xl bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-700 p-10 sm:p-16 text-white text-center relative overflow-hidden">
            <div className="absolute inset-0 grid-bg opacity-15" />
            <div className="relative z-10 max-w-2xl mx-auto space-y-4">
              <h2 className="text-3xl sm:text-4xl font-display font-bold">Inizia col quiz. È gratis.</h2>
              <p className="opacity-90">17 domande, 3 minuti, report immediato sui tuoi obblighi AI Act e L.132/2025.</p>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
                <Link href="/quiz">
                  <Button size="xl" className="bg-white text-violet-700 hover:bg-white/90 shadow-lg">
                    Fai il quiz ora <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
