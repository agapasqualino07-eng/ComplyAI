import Link from "next/link";
import { LoginForm } from "./login-form";

export const metadata = { title: "Accedi" };

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; verified?: string }>;
}) {
  return (
    <div className="w-full max-w-md space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-display font-bold">Bentornato</h1>
        <p className="text-muted-foreground">Accedi al tuo account AIComply per gestire la compliance AI Act della tua azienda.</p>
      </div>

      <LoginForm searchParamsPromise={searchParams} />

      <p className="text-sm text-muted-foreground text-center">
        Non hai ancora un account?{" "}
        <Link href="/signup" className="text-primary font-medium hover:underline">
          Inizia la prova gratuita
        </Link>
      </p>
    </div>
  );
}
