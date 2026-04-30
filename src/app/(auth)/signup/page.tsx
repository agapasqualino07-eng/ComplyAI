import Link from "next/link";
import { SignupForm } from "./signup-form";

export const metadata = { title: "Crea il tuo account" };

export default function SignupPage() {
  return (
    <div className="w-full max-w-md space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-display font-bold">Inizia la prova gratuita</h1>
        <p className="text-muted-foreground">14 giorni di prova, nessuna carta richiesta per registrarti. Senza vincoli.</p>
      </div>

      <SignupForm />

      <p className="text-sm text-muted-foreground text-center">
        Hai già un account?{" "}
        <Link href="/login" className="text-primary font-medium hover:underline">
          Accedi
        </Link>
      </p>
      <p className="text-xs text-muted-foreground text-center leading-relaxed">
        Registrandoti accetti i{" "}
        <Link href="/legal/terms" className="underline">Termini di servizio</Link> e l'
        <Link href="/legal/privacy" className="underline">Informativa privacy</Link> di ComplyAI.
      </p>
    </div>
  );
}
