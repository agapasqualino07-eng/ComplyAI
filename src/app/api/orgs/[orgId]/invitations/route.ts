import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient, createClient } from "@/lib/supabase/server";
import { enforceLimit } from "@/lib/limits";

const schema = z.object({
  email: z.string().email(),
  role: z.enum(["admin", "editor", "viewer"]).default("editor"),
});

// POST /api/orgs/[orgId]/invitations
// Crea un invito; admin client per inviare la magic link via Supabase Auth.
export async function POST(req: Request, { params }: { params: Promise<{ orgId: string }> }) {
  const { orgId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non autenticato" }, { status: 401 });

  const { data: me } = await supabase
    .from("org_members")
    .select("role")
    .eq("organization_id", orgId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!me || (me.role !== "owner" && me.role !== "admin")) {
    return NextResponse.json({ error: "Solo owner/admin possono invitare." }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Dati non validi" }, { status: 400 });

  const { email, role } = parsed.data;

  // Limite teamMembers: conta membri esistenti + inviti pendenti
  const check = await enforceLimit(orgId, "teamMembers");
  if (!check.allowed) return NextResponse.json({ error: check.reason }, { status: 402 });

  const admin = createAdminClient();

  // Se l'email è già membro, blocca
  const { data: existingProfile } = await admin
    .from("profiles")
    .select("id")
    .eq("email", email.toLowerCase())
    .maybeSingle();
  if (existingProfile) {
    const { data: alreadyMember } = await admin
      .from("org_members")
      .select("id")
      .eq("organization_id", orgId)
      .eq("user_id", existingProfile.id)
      .maybeSingle();
    if (alreadyMember) {
      return NextResponse.json({ error: "Questa email è già membro dell'organizzazione." }, { status: 409 });
    }
  }

  // Inserisce/aggiorna l'invito (idempotente sull'email)
  const { data: invite, error: inviteErr } = await admin
    .from("org_invitations")
    .upsert(
      {
        organization_id: orgId,
        email: email.toLowerCase(),
        role,
        invited_by: user.id,
        expires_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        accepted_at: null,
      },
      { onConflict: "organization_id,email" },
    )
    .select("token")
    .single();

  if (inviteErr || !invite) {
    return NextResponse.json({ error: inviteErr?.message || "Errore creazione invito" }, { status: 500 });
  }

  // Invia magic link via Supabase Auth (account viene creato al primo accesso)
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://aicomplyonline.it";
  const redirectTo = `${appUrl}/invite/${invite.token}`;

  try {
    // Se l'utente esiste già: genera magic link login
    // Se non esiste: inviteUserByEmail crea l'account e manda l'email
    if (existingProfile) {
      await admin.auth.admin.generateLink({
        type: "magiclink",
        email: email.toLowerCase(),
        options: { redirectTo },
      });
    } else {
      await admin.auth.admin.inviteUserByEmail(email.toLowerCase(), { redirectTo });
    }
  } catch (err: any) {
    console.error("[invitations] email send failed", err?.message);
    // Non blocchiamo: l'invito resta in DB e admin può rigenerare il link.
  }

  return NextResponse.json({ ok: true, token: invite.token, redirectTo });
}

// GET /api/orgs/[orgId]/invitations — lista inviti pendenti
export async function GET(_req: Request, { params }: { params: Promise<{ orgId: string }> }) {
  const { orgId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non autenticato" }, { status: 401 });

  const { data, error } = await supabase
    .from("org_invitations")
    .select("id, email, role, expires_at, accepted_at, created_at")
    .eq("organization_id", orgId)
    .is("accepted_at", null)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ invitations: data ?? [] });
}
