import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const display = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-display", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL("https://aicomplyonline.it"),
  title: {
    default: "AIComply — Compliance AI Act + Legge 132/2025 per le PMI italiane",
    template: "%s | AIComply",
  },
  description:
    "Piattaforma italiana per la conformità all'AI Act (Reg. UE 2024/1689) e alla Legge 132/2025. Quiz gratuito, registro IA, documenti audit-ready, formazione AI literacy.",
  keywords: [
    "AI Act",
    "Regolamento UE 2024/1689",
    "Legge 132/2025",
    "compliance AI Italia",
    "intelligenza artificiale aziende",
    "informativa AI dipendenti",
    "Art. 11 L.132",
    "classificatore rischio AI",
    "AI literacy",
    "registro sistemi AI",
  ],
  openGraph: {
    type: "website",
    locale: "it_IT",
    url: "https://aicomplyonline.it",
    siteName: "AIComply",
    title: "AIComply — Compliance AI Act + Legge 132/2025",
    description: "La piattaforma italiana per essere a norma AI Act in meno di un'ora.",
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
