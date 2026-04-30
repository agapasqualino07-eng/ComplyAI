import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export const runtime = "edge";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ siteId: string }> },
) {
  const { siteId } = await params;
  const supabase = createAdminClient();

  const { data: site } = await supabase
    .from("sites")
    .select("id, public_id, organization_id, domain")
    .eq("public_id", siteId)
    .maybeSingle();

  if (!site) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const { data: cfg } = await supabase
    .from("cmp_configs")
    .select("theme, accent_color, position, layout, consent_mode, categories, texts")
    .eq("site_id", site.id)
    .maybeSingle();

  return NextResponse.json(
    cfg || {
      theme: "light",
      accent_color: "#6d28d9",
      position: "bottom",
      layout: "bar",
      consent_mode: "opt_in",
      categories: [
        { id: "necessary", label: "Necessari", required: true },
        { id: "preferences", label: "Preferenze", required: false },
        { id: "statistics", label: "Statistica", required: false },
        { id: "marketing", label: "Marketing", required: false },
      ],
      texts: {
        title: "Rispettiamo la tua privacy",
        body: "Usiamo cookie per offrirti la migliore esperienza. Puoi accettare tutti i cookie, rifiutarli o personalizzare le tue preferenze.",
        accept: "Accetta tutti",
        reject: "Rifiuta",
        customize: "Personalizza",
        save: "Salva preferenze",
      },
    },
    {
      headers: {
        "Cache-Control": "public, max-age=60, s-maxage=300",
        "Access-Control-Allow-Origin": "*",
      },
    },
  );
}
