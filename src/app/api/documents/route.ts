import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { renderDocument, DOCUMENT_TITLES } from "@/lib/policy/templates";
import { slugify } from "@/lib/utils";
import { enforceLimit } from "@/lib/limits";
import { recomputeScore } from "@/lib/compliance";

const schema = z.object({
  organization_id: z.string().uuid(),
  type: z.enum(["ai_use_policy", "ai_employee_notice", "ai_disclosure", "ai_registry_export"]),
  language: z.string().default("it"),
  publish: z.boolean().default(false),
  answers: z
    .object({
      controllerName: z.string().min(2),
      vatNumber: z.string().optional(),
      address: z.string().optional(),
      websiteUrl: z.string().optional(),
      contactEmail: z.string().email(),
      dpoEmail: z.string().email().optional().or(z.literal("")),
      sector: z.string().optional(),
      approvedTools: z.string().optional(),
      prohibitedUseCases: z.string().optional(),
      hasHumanReviewProcess: z.boolean().optional(),
      trainingProvided: z.boolean().optional(),
      appliesToProfessions: z.boolean().optional(),
      aiSystemsList: z
        .array(
          z.object({
            name: z.string(),
            vendor: z.string().nullable().optional(),
            purpose: z.string().nullable().optional(),
            category: z.string().nullable().optional(),
          }),
        )
        .optional(),
    })
    .passthrough(),
});

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non autenticato" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dati non validi", details: parsed.error.flatten() }, { status: 400 });
  }

  const { organization_id, type, language, publish, answers } = parsed.data;

  const check = await enforceLimit(organization_id, "documents");
  if (!check.allowed) return NextResponse.json({ error: check.reason }, { status: 402 });

  const html = renderDocument(type, answers as any);
  const title = `${DOCUMENT_TITLES[type]} — ${answers.controllerName}`;
  const baseSlug = `${slugify(answers.controllerName)}-${type}`;
  // UUID per evitare collisioni sul slug (vincolo unique su slug+language)
  const finalSlug = `${baseSlug}-${randomUUID().slice(0, 8)}`;

  // Versioning: se esiste già un doc dello stesso tipo per l'org, incrementa la versione
  const { data: existing } = await supabase
    .from("documents")
    .select("id, version")
    .eq("organization_id", organization_id)
    .eq("type", type)
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data, error } = await supabase
    .from("documents")
    .insert({
      organization_id,
      type,
      title,
      slug: finalSlug,
      language,
      version: existing ? existing.version + 1 : 1,
      questionnaire: answers as any,
      rendered_html: html,
      published_at: publish ? new Date().toISOString() : null,
    } as any)
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await recomputeScore(organization_id);
  return NextResponse.json({ document_id: data.id });
}
