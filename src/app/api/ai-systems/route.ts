import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const schema = z.object({
  organization_id: z.string().uuid(),
  name: z.string().min(2),
  vendor: z.string().nullable().optional(),
  vendor_url: z.string().url().nullable().optional().or(z.literal("")),
  description: z.string().nullable().optional(),
  purpose: z.string().nullable().optional(),
  org_role: z.enum(["provider", "deployer", "distributor", "importer"]).default("deployer"),
  risk_class: z.enum(["prohibited", "high", "limited", "minimal", "gpai"]).optional(),
  status: z.enum(["in_use", "in_evaluation", "decommissioned"]).default("in_use"),
  is_gpai: z.boolean().default(false),
  uses_personal_data: z.boolean().default(false),
  affects_individuals: z.boolean().default(false),
  domains: z.array(z.string()).default([]),
  questionnaire: z.record(z.any()).default({}),
  human_oversight: z.string().nullable().optional(),
});

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non autenticato" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Dati non validi", details: parsed.error.flatten() }, { status: 400 });

  // Mappa risk_class → category (italiano)
  const categoryMap: Record<string, string> = {
    prohibited: "vietato",
    high: "alto",
    limited: "trasparenza",
    gpai: "gpai",
    minimal: "minimo",
  };

  const payload = {
    ...parsed.data,
    category: parsed.data.risk_class ? categoryMap[parsed.data.risk_class] : null,
  };

  const { error, data } = await supabase
    .from("ai_systems")
    .insert(payload as any)
    .select("id")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ id: data.id });
}
