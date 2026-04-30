"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

interface Props {
  orgId: string;
  siteId: string;
  initial: any;
}

export function CmpEditor({ orgId, siteId, initial }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState<string>(initial.theme || "light");
  const [accentColor, setAccentColor] = useState<string>(initial.accent_color || "#6d28d9");
  const [position, setPosition] = useState<string>(initial.position || "bottom");
  const [layout, setLayout] = useState<string>(initial.layout || "bar");
  const [consentMode, setConsentMode] = useState<string>(initial.consent_mode || "opt_in");
  const [texts, setTexts] = useState<any>(initial.texts || {});

  function updateText(key: string, value: string) {
    setTexts((t: any) => ({ ...t, [key]: value }));
  }

  async function save() {
    setLoading(true);
    const res = await fetch(`/api/cmp/${siteId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        theme,
        accent_color: accentColor,
        position,
        layout,
        consent_mode: consentMode,
        texts,
      }),
    });
    setLoading(false);
    if (!res.ok) {
      toast.error("Errore salvataggio configurazione.");
      return;
    }
    toast.success("Configurazione salvata.");
    router.refresh();
  }

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Editor */}
      <Card>
        <CardHeader>
          <CardTitle>Aspetto</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tema</Label>
              <select
                className="w-full h-10 rounded-lg border bg-background px-3 text-sm"
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
              >
                <option value="light">Chiaro</option>
                <option value="dark">Scuro</option>
                <option value="auto">Automatico</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Posizione</Label>
              <select
                className="w-full h-10 rounded-lg border bg-background px-3 text-sm"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
              >
                <option value="bottom">In basso</option>
                <option value="top">In alto</option>
                <option value="center">Centrato</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Layout</Label>
              <select
                className="w-full h-10 rounded-lg border bg-background px-3 text-sm"
                value={layout}
                onChange={(e) => setLayout(e.target.value)}
              >
                <option value="bar">Barra</option>
                <option value="box">Riquadro</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Modalità consenso</Label>
              <select
                className="w-full h-10 rounded-lg border bg-background px-3 text-sm"
                value={consentMode}
                onChange={(e) => setConsentMode(e.target.value)}
              >
                <option value="opt_in">Opt-in (GDPR)</option>
                <option value="opt_out">Opt-out</option>
                <option value="info">Solo informativa</option>
              </select>
            </div>
            <div className="space-y-2 col-span-2">
              <Label>Colore accento</Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="h-10 w-16 rounded-lg border cursor-pointer"
                />
                <Input value={accentColor} onChange={(e) => setAccentColor(e.target.value)} />
              </div>
            </div>
          </div>

          <div className="pt-2 space-y-3 border-t">
            <Label>Testi (italiano)</Label>
            <div className="grid gap-3">
              <div>
                <Label className="text-xs text-muted-foreground">Titolo</Label>
                <Input value={texts.title || ""} onChange={(e) => updateText("title", e.target.value)} />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Corpo</Label>
                <Textarea value={texts.body || ""} onChange={(e) => updateText("body", e.target.value)} rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Pulsante "Accetta"</Label>
                  <Input value={texts.accept || ""} onChange={(e) => updateText("accept", e.target.value)} />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Pulsante "Rifiuta"</Label>
                  <Input value={texts.reject || ""} onChange={(e) => updateText("reject", e.target.value)} />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Pulsante "Personalizza"</Label>
                  <Input value={texts.customize || ""} onChange={(e) => updateText("customize", e.target.value)} />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Pulsante "Salva"</Label>
                  <Input value={texts.save || ""} onChange={(e) => updateText("save", e.target.value)} />
                </div>
              </div>
            </div>
          </div>

          <Button onClick={save} disabled={loading} className="w-full" variant="gradient">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Salva configurazione
          </Button>
        </CardContent>
      </Card>

      {/* Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Anteprima</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className="relative h-96 rounded-lg border overflow-hidden bg-zinc-50"
            style={{ "--cmp-accent": accentColor } as any}
          >
            <div className="absolute inset-0 grid-bg opacity-50" />
            <CmpPreview
              theme={theme}
              accent={accentColor}
              position={position}
              layout={layout}
              texts={texts}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function CmpPreview({ theme, accent, position, layout, texts }: any) {
  const dark = theme === "dark";
  const containerStyle: React.CSSProperties = {
    background: dark ? "#0f0f12" : "#ffffff",
    color: dark ? "#fafafa" : "#0f0f12",
    border: `1px solid ${dark ? "#27272a" : "#e4e4e7"}`,
  };
  const positionClass =
    position === "top" ? "top-4 left-4 right-4" : position === "center" ? "inset-0 m-auto h-fit max-w-md" : "bottom-4 left-4 right-4";
  const layoutClass = layout === "box" ? "max-w-md" : "";

  return (
    <div
      className={`absolute ${positionClass} ${layoutClass} rounded-xl shadow-xl p-4 sm:p-5`}
      style={containerStyle}
    >
      <div className={`flex flex-col ${layout === "bar" ? "sm:flex-row sm:items-center" : ""} gap-3`}>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm">{texts.title || "Rispettiamo la tua privacy"}</p>
          <p className="text-xs opacity-80 mt-1 line-clamp-3">
            {texts.body || "Usiamo cookie per offrirti la migliore esperienza. Puoi accettare tutti i cookie, rifiutarli o personalizzare le tue preferenze."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 shrink-0">
          <button
            className="text-xs font-medium rounded-md px-3 py-1.5 border"
            style={{ borderColor: dark ? "#52525b" : "#d4d4d8" }}
          >
            {texts.reject || "Rifiuta"}
          </button>
          <button
            className="text-xs font-medium rounded-md px-3 py-1.5 border"
            style={{ borderColor: dark ? "#52525b" : "#d4d4d8" }}
          >
            {texts.customize || "Personalizza"}
          </button>
          <button
            className="text-xs font-medium rounded-md px-3 py-1.5 text-white"
            style={{ background: accent }}
          >
            {texts.accept || "Accetta tutti"}
          </button>
        </div>
      </div>
    </div>
  );
}
