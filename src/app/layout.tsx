import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const display = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-display", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL("https://aicomplyonline.it"),
  title: {
    default: "ComplyAI — Compliance GDPR automatica per il tuo sito",
    template: "%s | ComplyAI",
  },
  description:
    "Banner cookie, Privacy Policy, Cookie Policy, registro consensi e registro trattamenti GDPR. Tutto pronto in 5 minuti, sempre aggiornato.",
  keywords: ["GDPR", "Privacy Policy", "Cookie Policy", "Cookie banner", "Consent Management", "compliance Italia"],
  openGraph: {
    type: "website",
    locale: "it_IT",
    url: "https://aicomplyonline.it",
    siteName: "ComplyAI",
    title: "ComplyAI — Compliance GDPR automatica",
    description: "La piattaforma all-in-one per essere a norma GDPR in 5 minuti.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" className={`${inter.variable} ${display.variable}`} suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        {children}
        <Toaster richColors closeButton position="top-right" />
      </body>
    </html>
  );
}
