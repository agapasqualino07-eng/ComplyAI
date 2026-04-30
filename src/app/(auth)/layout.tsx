import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="flex flex-col justify-between p-8 lg:p-12 bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-10 pointer-events-none" />
        <Link href="/" className="relative z-10 inline-flex items-center gap-2 font-display text-xl font-bold">
          <ShieldCheck className="h-6 w-6" /> ComplyAI
        </Link>
        <div className="relative z-10 max-w-md space-y-4">
          <p className="text-sm font-medium opacity-80">Compliance GDPR senza sforzo</p>
          <h2 className="text-3xl font-display font-bold leading-tight">
            La piattaforma che rende la compliance la tua ultima preoccupazione.
          </h2>
          <p className="text-base opacity-90">
            Banner cookie, Privacy Policy, registri consensi e trattamenti — tutto sempre aggiornato e a norma. Provalo gratis per 14 giorni.
          </p>
        </div>
        <p className="relative z-10 text-xs opacity-70">© {new Date().getFullYear()} ComplyAI · aicomplyonline.it</p>
      </div>
      <div className="flex items-center justify-center p-6 sm:p-12">{children}</div>
    </div>
  );
}
