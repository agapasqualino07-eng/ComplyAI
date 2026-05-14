"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle2, AlertTriangle, Sparkles, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SHOW_AUTH } from "@/lib/feature-flags";
import { Input } from "@/components/ui/input";
import { QUIZ, evaluate, type AnswerValue, type QuizResult } from "@/lib/aiact/quiz";

const STORAGE_KEY = "aicomply_quiz_v1";

export function QuizClient() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const totalQuestions = QUIZ.length;
  const current = QUIZ[step];
  const isResults = step === totalQuestions;
  const progress = Math.round(((step) / totalQuestions) * 100);

  const result: QuizResult | null = useMemo(() => (isResults ? evaluate(answers) : null), [answers, isResults]);

  function setAnswer(value: AnswerValue) {
    setAnswers((a) => ({ ...a, [current.id]: value }));
  }

  function next() {
    if (current && answers[current.id] === undefined) return;
    setStep((s) => Math.min(totalQuestions, s + 1));
  }
  function back() {
    setStep((s) => Math.max(0, s - 1));
  }

  async function saveResult() {
    if (!result) return;
    // Salva localmente per bridge Free → Pro
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ answers, result, email, ts: Date.now() }),
      );
    } catch {}

    // Tracking anonimo
    fetch("/api/quiz", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sector: answers.sector,
        employees: answers.employees,
        score: result.score,
        systems_count: result.systemsDetected.length,
        risk_summary: {
          level: result.riskLevel,
          prohibited: result.prohibitedSuspected,
          highRisk: result.highRiskSuspected,
        },
        answers,
        email: email || null,
      }),
    }).catch(() => {});

    setSubmitted(true);
  }

  // ----------------------- RENDER -----------------------
  if (isResults && result) {
    return <Results result={result} onSave={saveResult} submitted={submitted} email={email} setEmail={setEmail} />;
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-3">
        <Badge variant="secondary" className="bg-white border">
          <Sparkles className="h-3 w-3 mr-1.5 text-violet-600" />
          Quiz gratuito · 3 minuti
        </Badge>
        <h1 className="text-3xl sm:text-4xl font-display font-bold">
          Sei a norma con <span className="gradient-text">AI Act</span> e <span className="gradient-text">L. 132/2025</span>?
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          17 domande per scoprirlo. Alla fine ricevi un report con: score di compliance, sistemi AI rilevati, obblighi che ti riguardano e i prossimi passi.
        </p>
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Domanda {step + 1} di {totalQuestions}</span>
        <span className="text-muted-foreground">{progress}%</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-violet-600 to-indigo-600 transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>

      <Card className="border-primary/20">
        <CardContent className="pt-6 space-y-5">
          <div>
            <h2 className="font-display font-semibold text-xl">{current.title}</h2>
            {current.help && <p className="text-sm text-muted-foreground mt-1.5">{current.help}</p>}
          </div>

          {current.type === "yesno" ? (
            <div className="grid grid-cols-2 gap-3">
              {[
                { v: true, label: "Sì" },
                { v: false, label: "No" },
              ].map((o) => {
                const selected = answers[current.id] === o.v;
                return (
                  <button
                    type="button"
                    key={String(o.v)}
                    onClick={() => setAnswer(o.v)}
                    className={`rounded-lg border px-4 py-4 text-base font-medium transition-all ${
                      selected
                        ? "border-primary bg-primary/5 text-primary ring-1 ring-primary"
                        : "hover:border-primary/40"
                    }`}
                  >
                    {o.label}
                  </button>
                );
              })}
            </div>
          ) : current.type === "single" ? (
            <div className="grid sm:grid-cols-2 gap-2">
              {current.options?.map((o) => {
                const selected = answers[current.id] === o.value;
                return (
                  <button
                    type="button"
                    key={o.value}
                    onClick={() => setAnswer(o.value)}
                    className={`text-left rounded-lg border px-3 py-3 text-sm transition-all ${
                      selected
                        ? "border-primary bg-primary/5 text-primary"
                        : "hover:border-primary/40"
                    }`}
                  >
                    {o.label}
                  </button>
                );
              })}
            </div>
          ) : null}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between gap-3">
        <Button type="button" variant="ghost" onClick={back} disabled={step === 0}>
          <ArrowLeft className="h-4 w-4" /> Indietro
        </Button>
        <Button
          type="button"
          variant="gradient"
          onClick={next}
          disabled={answers[current.id] === undefined && answers[current.id] !== false}
        >
          {step === totalQuestions - 1 ? "Vedi il report" : "Avanti"} <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Il quiz è anonimo. Nessuna registrazione richiesta. Salveremo i dati solo se decidi di proseguire e fornisci la tua email.
      </p>
    </div>
  );
}

function Results({
  result,
  onSave,
  submitted,
  email,
  setEmail,
}: {
  result: QuizResult;
  onSave: () => void;
  submitted: boolean;
  email: string;
  setEmail: (v: string) => void;
}) {
  const scoreColor =
    result.score >= 70 ? "text-emerald-600" : result.score >= 40 ? "text-amber-600" : "text-red-600";
  const levelMeta =
    result.riskLevel === "critical"
      ? {
          label: "Situazione critica",
          desc: "Diversi obblighi non soddisfatti o possibile uso di pratiche vietate. Intervieni subito.",
          color: "bg-red-50 border-red-200 text-red-900",
        }
      : result.riskLevel === "warning"
      ? {
          label: "Attenzione richiesta",
          desc: "Ci sono adempimenti chiave da chiudere per essere a norma.",
          color: "bg-amber-50 border-amber-200 text-amber-900",
        }
      : {
          label: "Buon livello base",
          desc: "Bene così. Mantieni il registro aggiornato e segui le scadenze in arrivo.",
          color: "bg-emerald-50 border-emerald-200 text-emerald-900",
        };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <Badge variant="secondary">
          <CheckCircle2 className="h-3 w-3 mr-1.5 text-emerald-500" />
          Report compliance pronto
        </Badge>
        <h1 className="text-3xl sm:text-4xl font-display font-bold">Il tuo report</h1>
      </div>

      <Card className="overflow-hidden">
        <div className="bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-700 text-white p-8 text-center">
          <p className="text-sm opacity-80 uppercase tracking-wide">Score di compliance AI</p>
          <p className="text-7xl font-display font-bold mt-2">{result.score}<span className="text-3xl opacity-70">/100</span></p>
          <p className="text-sm opacity-80 mt-2">{levelMeta.label}</p>
        </div>
        <CardContent className="pt-6 space-y-5">
          <div className={`rounded-lg border p-4 ${levelMeta.color}`}>
            {result.prohibitedSuspected && (
              <div className="flex items-start gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                <p className="font-semibold text-sm">Possibile uso di pratica VIETATA: verifica subito.</p>
              </div>
            )}
            <p className="text-sm">{levelMeta.desc}</p>
          </div>

          {result.systemsDetected.length > 0 && (
            <div>
              <p className="font-semibold mb-2">Sistemi AI rilevati</p>
              <div className="flex flex-wrap gap-2">
                {result.systemsDetected.map((s) => (
                  <Badge key={s} variant="secondary">{s}</Badge>
                ))}
              </div>
            </div>
          )}

          <div>
            <p className="font-semibold mb-2">Obblighi che ti riguardano</p>
            <ul className="text-sm space-y-2">
              {result.obligations.map((o, i) => (
                <li key={i} className="flex gap-2"><span className="text-violet-600 font-bold mt-0.5">▸</span><span>{o}</span></li>
              ))}
            </ul>
          </div>

          {result.recommendations.length > 0 && (
            <div>
              <p className="font-semibold mb-2">Prossimi passi consigliati</p>
              <ul className="text-sm space-y-2">
                {result.recommendations.map((o, i) => (
                  <li key={i} className="flex gap-2"><span className="text-emerald-600 font-bold mt-0.5">✓</span><span>{o}</span></li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {!submitted ? (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="pt-6 space-y-4">
            <div>
              <p className="font-semibold text-lg">Salva il tuo report e ricevi un piano d'azione</p>
              <p className="text-sm text-muted-foreground mt-1">
                Lascia la tua email: ti inviamo il report in PDF e un riepilogo delle scadenze che ti riguardano.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Input type="email" placeholder="tua@email.it" value={email} onChange={(e) => setEmail(e.target.value)} />
              <Button onClick={onSave} variant="gradient">
                Ricevi il report
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Niente spam, solo il tuo report e gli aggiornamenti normativi importanti. Cancellazione con un click.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6 text-center space-y-3">
            <ShieldCheck className="h-10 w-10 mx-auto text-emerald-500" />
            <p className="font-semibold">Report salvato!</p>
            <p className="text-sm text-muted-foreground">
              Ti abbiamo registrato la valutazione. Quando ti iscrivi al piano Pro, il tuo report viene importato automaticamente nella dashboard.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="rounded-2xl bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-700 p-8 text-white text-center space-y-3">
        <h2 className="text-2xl font-display font-bold">Vuoi diventare compliant?</h2>
        <p className="opacity-90 max-w-md mx-auto">
          Con il piano Pro hai accesso al registro IA aggiornato, alla generazione automatica dei documenti audit-ready (informativa Art. 11, policy interna, registro formale) e al tracking della formazione.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          {SHOW_AUTH && (
            <Link href="/signup">
              <Button size="xl" className="bg-white text-violet-700 hover:bg-white/90">
                Attiva il Pro 29€/mese <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          )}
          <Link href="/pricing" className="text-sm underline opacity-90 hover:opacity-100">
            Vedi tutti i piani
          </Link>
        </div>
      </div>
    </div>
  );
}
