import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { renderDocument, DOCUMENT_TITLES } from "@/lib/policy/templates";
import { slugify } from "@/lib/utils";

const schema = z.object({
  organization_id: z.string().uuid(),
  site_id: z.string().uuid().optional().nullable(),
  type: z.enum(["privacy", "cookie", "terms", "eula"]),
  language: z.string().default("it"),
  publish: z.boolean().default(false),
  answers: z.object({
    controllerName: z.string().min(2),
    vatNumber: z.string().optional(),
    address: z.string().optional(),
    websiteUrl: z.string().min(3),
    contactEmail: z.string().email(),
    dpoEmail: z.string().email().optional().or(z.literal("")),
    purposes: z.array(z.string()).default([]),
    usesCloudflare: z.boolean().optional(),
    usesGoogleAnalytics: z.boolean().optional(),
    usesMetaPixel: z.boolean().optional(),
    usesStripe: z.boolean().optional(),
    usesMailchimp: z.boolean().optional(),
    usesHotjar: z.boolean().optional(),
    otherProcessors: z.string().optional(),
  }),
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

  const { organization_id, site_id, type, language, publish, answers } = parsed.data;
  const html = renderDocument(type, answers as any);
  const title = `${DOCUMENT_TITLES[type]} — ${answers.controllerName}`;
  const slug = `${slugify(answers.controllerName)}-${type}`;

  // Upsert: se esiste già un doc dello stesso tipo per questo sito, ne creiamo una nuova versione
  const { data: existing } = await supabase
    .from("documents")
    .select("id, version")
    .eq("organization_id", organization_id)
    .eq("type", type)
    .eq("site_id", site_id || null)
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();

  const insert = {
    organization_id,
    site_id: site_id || null,
    type,
    title,
    slug: existing ? existing.id : slug,
    language,
    version: existing ? existing.version + 1 : 1,
    questionnaire: answers as any,
    rendered_html: html,
    published_at: publish ? new Date().toISOString() : null,
  };

  // To make slug unique we just append id-fragment as fallback
  const finalSlug = `${slug}-${Math.random().toString(36).slice(2, 7)}`;
  const { data, error } = await supabase
    .from("documents")
    .insert({ ...insert, slug: finalSlug })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ document_id: data.id });
}
