import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  // Usa l'host della request: funziona sia in locale che in produzione
  // senza dipendere da NEXT_PUBLIC_APP_URL.
  return NextResponse.redirect(new URL("/login", req.url), { status: 303 });
}
