import Link from "next/link";
import { Mail } from "lucide-react";

export const metadata = { title: "Controlla la tua email" };

export default function CheckEmailPage() {
  return (
    <div className="w-full max-w-md space-y-6 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Mail className="h-8 w-8" />
      </div>
      <div className="space-y-2">
        <h1 className="text-3xl font-display font-bold">Controlla la tua email</h1>
        <p className="text-muted-foreground">
          Ti abbiamo inviato un link per confermare l'indirizzo. Fai clic sul link per attivare il tuo account AIComply e iniziare la prova gratuita.
        </p>
      </div>
      <p className="text-sm">
        <Link href="/login" className="text-primary hover:underline">Torna al login</Link>
      </p>
    </div>
  );
}
