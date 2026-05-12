import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// POST /api/account/sessions — esegue logout globale (tutti i device).
// Supabase Auth: signOut con scope 'global' invalida tutti i refresh token.
export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non autenticato" }, { status: 401 });

  const { error } = await supabase.auth.signOut({ scope: "global" });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
