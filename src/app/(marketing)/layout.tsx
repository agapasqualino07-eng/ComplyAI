import Link from "next/link";
import { ShieldCheck, Twitter, Linkedin } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
        <div className="container-wide flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-display font-bold">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 grid place-items-center text-white">
              <ShieldCheck className="h-4 w-4" />
            </div>
            AIComply
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <Link href="/quiz" className="text-muted-foreground hover:text-foreground">Quiz gratuito</Link>
            <Link href="/#features" className="text-muted-foreground hover:text-foreground">Funzionalità</Link>
            <Link href="/pricing" className="text-muted-foreground hover:text-foreground">Prezzi</Link>
            <Link href="/#faq" className="text-muted-foreground hover:text-foreground">FAQ</Link>
            <Link href="mailto:supporto@aicomplyonline.it" className="text-muted-foreground hover:text-foreground">Contatti</Link>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/login" className="hidden sm:inline-block text-sm font-medium hover:text-primary">
              Accedi
            </Link>
            <Link href="/quiz">
              <Button variant="gradient" size="sm">Quiz gratuito</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t bg-muted/30">
        <div className="container-wide py-12 grid gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 font-display font-bold mb-3">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 grid place-items-center text-white">
                <ShieldCheck className="h-4 w-4" />
              </div>
              AIComply
            </Link>
            <p className="text-sm text-muted-foreground max-w-sm">
              La piattaforma italiana per la compliance AI Act + Legge 132/2025. Registro IA, documenti audit-ready, formazione e alert normativi.
            </p>
            <div className="flex items-center gap-3 mt-4 text-muted-foreground">
              <a href="https://twitter.com" aria-label="Twitter" className="hover:text-foreground"><Twitter className="h-4 w-4" /></a>
              <a href="https://linkedin.com" aria-label="LinkedIn" className="hover:text-foreground"><Linkedin className="h-4 w-4" /></a>
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold mb-3">Prodotto</p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/quiz" className="hover:text-foreground">Quiz gratuito</Link></li>
              <li><Link href="/#features" className="hover:text-foreground">Funzionalità</Link></li>
              <li><Link href="/pricing" className="hover:text-foreground">Prezzi</Link></li>
              <li><Link href="/signup" className="hover:text-foreground">Registrati</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold mb-3">Azienda & Legale</p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="mailto:supporto@aicomplyonline.it" className="hover:text-foreground">Contatti</Link></li>
              <li><Link href="/legal/privacy" className="hover:text-foreground">Privacy Policy</Link></li>
              <li><Link href="/legal/cookie" className="hover:text-foreground">Cookie Policy</Link></li>
              <li><Link href="/legal/terms" className="hover:text-foreground">Termini</Link></li>
              <li><Link href="/legal/dpa" className="hover:text-foreground">DPA</Link></li>
              <li><Link href="/legal/sub-processori" className="hover:text-foreground">Sub-processor</Link></li>
              <li><Link href="/legal/sicurezza" className="hover:text-foreground">Sicurezza</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t">
          <div className="container-wide py-4 text-xs text-muted-foreground flex flex-wrap items-center justify-between gap-2">
            <span>© {new Date().getFullYear()} AIComply · aicomplyonline.it</span>
            <span>Made with ❤️ in Italia · Soluzione GDPR-ready</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
