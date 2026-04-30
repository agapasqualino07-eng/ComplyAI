"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CmpInstallSnippet({ siteId }: { siteId: string }) {
  const [copied, setCopied] = useState(false);
  const url = process.env.NEXT_PUBLIC_APP_URL || "https://aicomplyonline.it";
  const snippet = `<script async src="${url}/cmp/v1.js" data-site="${siteId}"></script>`;

  async function copy() {
    await navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Incolla questo snippet nel <code>&lt;head&gt;</code> di tutte le pagine. Il banner si attiva automaticamente.
      </p>
      <div className="relative">
        <pre className="rounded-lg bg-zinc-900 text-zinc-100 p-4 pr-14 text-xs sm:text-sm overflow-x-auto">
          <code>{snippet}</code>
        </pre>
        <Button onClick={copy} variant="secondary" size="sm" className="absolute top-2 right-2">
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copiato" : "Copia"}
        </Button>
      </div>
    </div>
  );
}
