import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ orgId: string }> },
) {
  const { orgId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non autenticato" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const allowed = ["name", "legal_name", "vat_number", "tax_code", "address", "city", "postal_code", "email"] as const;
  const update: Record<string, any> = {};
  for (const k of allowed) if (k in body) update[k] = body[k] || null;

  const { error } = await supabase.from("organizations").update(update).eq("id", orgId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
