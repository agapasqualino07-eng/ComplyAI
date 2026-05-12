import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const schema = z.object({ token: z.string().min(20) });

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non autenticato" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Token non valido" }, { status: 400 });

  // Esegue l'RPC SECURITY DEFINER che fa tutto in transazione
  const { data, error } = await supabase.rpc("accept_invitation", { p_token: parsed.data.token });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const result = data as { ok: boolean; reason?: string; organization_id?: string };
  if (!result?.ok) {
    const messages: Record<string, string> = {
      invitation_not_found: "Invito non trovato o revocato.",
      already_accepted: "Hai già accettato questo invito.",
      expired: "L'invito è scaduto.",
      email_mismatch: "L'email del tuo account non corrisponde a quella invitata.",
    };
    return NextResponse.json(
      { error: messages[result?.reason ?? ""] || "Impossibile accettare l'invito." },
      { status: 400 },
    );
  }

  return NextResponse.json({ ok: true, organization_id: result.organization_id });
}
