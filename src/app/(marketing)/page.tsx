import Link from "next/link";
import {
  Cookie,
  FileText,
  ScrollText,
  ClipboardList,
  ShieldCheck,
  Sparkles,
  Zap,
  Globe,
  Lock,
  CheckCircle2,
  ArrowRight,
  Bot,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const features = [
  {
    icon: Cookie,
    title: "Cookie banner CMP",
    desc: "Banner conformi GDPR e ePrivacy, personalizzabili e con registro consensi automatico.",
  },
  {
    icon: FileText,
    title: "Privacy Policy generator",
    desc: "Genera in 5 minuti informative su misura per il tuo sito, con linguaggio chiaro e legalmente solido.",
  },
  {
    icon: Cookie,
    title: "Cookie Policy generator",
    desc: "Lista trasparente di tutti i cookie e servizi terzi attivi sul tuo sito, sempre aggiornata.",
  },
  {
    icon: ScrollText,
    title: "Termini e Condizioni",
    desc: "Templates pronti per siti vetrina, e-commerce e SaaS, con clausole adeguate al Codice del Consumo.",
  },
  {
    icon: ClipboardList,
    title: "Registro trattamenti GDPR",
    desc: "Adempi all'art. 30 GDPR con un editor guidato. Esporta in PDF/CSV per il Garante.",
  },
  {
    icon: Bot,
    title: "AI Act (UE 2024/1689)",
    desc: "Registro sistemi AI, classificazione rischio guidata, AI Use Policy interna e disclosure pubblica per chatbot.",
  },
  {
    icon: ShieldCheck,
    title: "Aggiornamenti normativi",
    desc: "Quando cambia la normativa o le linee guida del Garante, aggiorniamo i tuoi documenti.",
  },
];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-50 via-white to-blue-50 -z-10" />
        <div className="absolute inset-0 grid-bg opacity-40 -z-10" />
        <div className="container-wide pt-20 pb-16 sm:pt-28 sm:pb-24">
          <div className="max-w-3xl mx-auto text-center space-y-6 animate-fade-in">
            <Badge variant="secondary" className="bg-white border">
              <Sparkles className="h-3 w-3 mr-1.5 text-violet-600" />
              Novità: modulo AI Act incluso in tutti i piani
            </Badge>
            <h1 className="text-4xl sm:text-6xl font-display font-bold tracking-tight">
              <span className="gradient-text">GDPR + AI Act</span> automatici<br />
              per la tua azienda.
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
              Banner cookie, Privacy Policy, registri consensi e trattamenti, classificazione rischio AI Act
              e policy aziendali sull'IA. Tutto pronto in 5 minuti, sempre aggiornato. <strong className="text-foreground">Senza un avvocato.</strong>
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link href="/signup">
                <Button size="xl" variant="gradient">
                  Inizia 14 giorni gratis <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/pricing">
                <Button size="xl" variant="outline">
                  Vedi i prezzi
                </Button>
              </Link>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-6 pt-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-500" />14 giorni gratis</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-500" />Annulli quando vuoi</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-500" />Server in UE 🇪🇺</span>
            </div>
          </div>

          {/* Mock app screenshot */}
          <div className="mt-16 max-w-5xl mx-auto">
            <div className="relative rounded-xl border bg-card shadow-2xl overflow-hidden">
              <div className="h-9 bg-muted/60 border-b flex items-center px-4 gap-2">
                <div className="flex gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-red-400" />
                  <span className="h-3 w-3 rounded-full bg-amber-400" />
                  <span className="h-3 w-3 rounded-full bg-emerald-400" />
                </div>
                <span className="text-xs text-muted-foreground ml-2">aicomplyonline.it/dashboard</span>
              </div>
              <div className="p-6 sm:p-10 grid sm:grid-cols-3 gap-4 bg-gradient-to-br from-white to-violet-50/30">
                {[
                  { label: "Siti gestiti", value: "12", icon: Globe },
                  { label: "Documenti", value: "34", icon: FileText },
                  { label: "Consensi (mese)", value: "184k", icon: ScrollText },
                ].map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <div key={stat.label} className="rounded-lg border bg-white p-4">
                      <Icon className="h-5 w-5 text-violet-600" />
                      <p className="text-2xl font-display font-bold mt-2">{stat.value}</p>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 sm:py-28">
        <div className="container-wide">
          <div className="max-w-2xl mx-auto text-center space-y-3 mb-14">
            <Badge variant="secondary">Tutto in una piattaforma</Badge>
            <h2 className="text-3xl sm:text-4xl font-display font-bold">
              Tutto quello che ti serve per essere a norma.
            </h2>
            <p className="text-muted-foreground">
              ComplyAI sostituisce 5 strumenti diversi (e il tuo avvocato per il sito web).
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

      {/* How it works */}
      <section className="py-20 bg-muted/30 border-y">
        <div className="container-wide">
          <div className="max-w-2xl mx-auto text-center space-y-3 mb-12">
            <Badge variant="secondary">Tre passaggi</Badge>
            <h2 className="text-3xl sm:text-4xl font-display font-bold">A norma in 5 minuti.</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              { n: "1", title: "Aggiungi il tuo sito", desc: "Inserisci il dominio e le info aziendali. Bastano 30 secondi.", icon: Globe },
              { n: "2", title: "Genera i documenti", desc: "Rispondi a un breve questionario: privacy, cookie e termini sono pronti.", icon: Zap },
              { n: "3", title: "Installa il banner", desc: "Copia uno script e incollalo: registro consensi attivo all'istante.", icon: Cookie },
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

      {/* Trust */}
      <section className="py-20">
        <div className="container-wide grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {[
            { icon: Lock, title: "Server in UE", desc: "Infrastruttura europea, dati al sicuro." },
            { icon: ShieldCheck, title: "GDPR-ready", desc: "Costruito da zero secondo il Regolamento UE 2016/679." },
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
                q: "ComplyAI sostituisce un avvocato?",
                a: "ComplyAI fornisce documenti e strumenti standard adeguati alla normativa. Per situazioni complesse (sanità, banche, casi specifici) consigliamo comunque la consulenza di un avvocato specializzato.",
              },
              {
                q: "I miei dati sono sicuri?",
                a: "Sì. Server in UE (Frankfurt), cifratura at-rest, backup quotidiani. Non vendiamo né condividiamo dati con terzi.",
              },
              {
                q: "Posso annullare quando voglio?",
                a: "Certo. Nessun vincolo. Se annulli mantieni l'accesso fino alla fine del periodo già pagato.",
              },
              {
                q: "Quando vengono aggiornati i documenti?",
                a: "Monitoriamo le linee guida del Garante e le sentenze rilevanti. Quando una modifica impatta i tuoi documenti, riceverai un alert e potrai applicare l'aggiornamento con un click.",
              },
              {
                q: "Funziona anche con Shopify/WooCommerce/WordPress?",
                a: "Sì. Lo script si installa su qualsiasi piattaforma in cui puoi aggiungere un tag <script>. Abbiamo guide dedicate per i principali CMS.",
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
              <h2 className="text-3xl sm:text-4xl font-display font-bold">Inizia oggi. Sii a norma in 5 minuti.</h2>
              <p className="opacity-90">14 giorni di prova gratuita. Annulli quando vuoi.</p>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
                <Link href="/signup">
                  <Button size="xl" className="bg-white text-violet-700 hover:bg-white/90 shadow-lg">
                    Prova gratis ora <ArrowRight className="h-4 w-4" />
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
