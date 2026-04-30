import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const display = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-display", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL("https://aicomplyonline.it"),
  title: {
    default: "ComplyAI — Compliance GDPR e AI Act per la tua azienda",
    template: "%s | ComplyAI",
  },
  description:
    "Piattaforma all-in-one per GDPR e AI Act: banner cookie, Privacy Policy, registro consensi, registro trattamenti, classificatore rischio AI e AI Use Policy. Pronto in 5 minuti.",
  keywords: [
    "GDPR",
    "AI Act",
    "Regolamento UE 2024/1689",
    "Privacy Policy",
    "Cookie Policy",
    "Cookie banner",
    "Consent Management",
    "compliance Italia",
    "AI Use Policy",
    "classificatore rischio AI",
  ],
  openGraph: {
    type: "website",
    locale: "it_IT",
    url: "https://aicomplyonline.it",
    siteName: "ComplyAI",
    title: "ComplyAI — GDPR + AI Act automatici",
    description: "La piattaforma all-in-one per essere a norma GDPR e AI Act in 5 minuti.",
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
