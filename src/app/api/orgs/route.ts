import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient, createClient } from "@/lib/supabase/server";
import { enforceOrgCreation } from "@/lib/limits";

const schema = z.object({
  name: z.string().min(2).max(120),
  legal_name: z.string().max(200).optional().or(z.literal("")),
  vat_number: z.string().max(40).optional().or(z.literal("")),
  tax_code: z.string().max(40).optional().or(z.literal("")),
  address: z.string().max(200).optional().or(z.literal("")),
  city: z.string().max(80).optional().or(z.literal("")),
  postal_code: z.string().max(20).optional().or(z.literal("")),
  email: z.string().email().optional().or(z.literal("")),
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

  const orgCheck = await enforceOrgCreation(user.id);
  if (!orgCheck.allowed) {
    return NextResponse.json({ error: orgCheck.reason }, { status: 402 });
  }

  // L'utente è già validato sopra via getUser(); usiamo l'admin client per
  // l'insert iniziale (l'owner non è ancora membro dell'org, quindi la sua
  // sessione non soddisfa le policy che richiedono is_org_member).
  const data = parsed.data;
  const admin = createAdminClient();
  const { data: org, error } = await admin
    .from("organizations")
    .insert({
      name: data.name,
      legal_name: data.legal_name || null,
      vat_number: data.vat_number || null,
      tax_code: data.tax_code || null,
      address: data.address || null,
      city: data.city || null,
      postal_code: data.postal_code || null,
      email: data.email || user.email || null,
      owner_id: user.id,
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ organization_id: org.id });
}
