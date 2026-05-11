"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const COOKIE_KEY = "aicomply-cookie-consent";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(COOKIE_KEY)) setVisible(true);
    } catch {
      // localStorage non disponibile (es. privacy mode estrema): non mostriamo
    }
  }, []);

  function accept() {
    try {
      localStorage.setItem(COOKIE_KEY, JSON.stringify({ accepted: true, ts: Date.now() }));
    } catch {}
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Informativa cookie"
      className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-2xl rounded-xl border bg-background p-4 shadow-2xl sm:p-5"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Utilizziamo solo <strong className="text-foreground">cookie tecnici</strong> necessari al funzionamento del sito
          (autenticazione, pagamenti). Nessun tracciamento di profilazione.{" "}
          <Link href="/legal/cookie" className="underline">
            Cookie policy
          </Link>
          .
        </p>
        <Button size="sm" onClick={accept} className="shrink-0">
          Ho capito
        </Button>
      </div>
    </div>
  );
}
