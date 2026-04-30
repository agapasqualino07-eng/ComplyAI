import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const schema = z.object({
  organization_id: z.string().uuid(),
  name: z.string().min(2),
  purpose: z.string().min(5),
  legal_basis: z.string().min(2),
  data_categories: z.array(z.string()).default([]),
  data_subjects: z.array(z.string()).default([]),
  retention: z.string().optional().nullable(),
  recipients: z.string().optional().nullable(),
  transfers_outside_eu: z.boolean().default(false),
  security_measures: z.string().optional().nullable(),
  dpo_notes: z.string().optional().nullable(),
});

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non autenticato" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Dati non validi" }, { status: 400 });

  const { error, data } = await supabase
    .from("processing_records")
    .insert(parsed.data as any)
    .select("id")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ id: data.id });
}
