import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const schema = z.object({
  organization_id: z.string().uuid(),
  name: z.string().min(2).max(120),
  domain: z
    .string()
    .min(3)
    .max(253)
    .regex(/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "Dominio non valido"),
});

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non autenticato" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dati non validi" }, { status: 400 });
  }

  const { organization_id, name, domain } = parsed.data;

  const { data, error } = await supabase
    .from("sites")
    .insert({ organization_id, name, domain: domain.toLowerCase() })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Crea CMP config di default
  await supabase.from("cmp_configs").insert({ organization_id, site_id: data.id });

  return NextResponse.json({ site_id: data.id });
}
