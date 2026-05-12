import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const updateSchema = z.object({
  role: z.enum(["admin", "editor", "viewer"]),
});

// PATCH /api/orgs/[orgId]/members/[userId] — cambia ruolo (non si può cambiare owner)
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ orgId: string; userId: string }> },
) {
  const { orgId, userId } = await params;
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
    return NextResponse.json({ error: "Solo owner/admin." }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Dati non validi" }, { status: 400 });

  const { data: target } = await supabase
    .from("org_members")
    .select("role")
    .eq("organization_id", orgId)
    .eq("user_id", userId)
    .maybeSingle();
  if (!target) return NextResponse.json({ error: "Membro non trovato" }, { status: 404 });
  if (target.role === "owner") {
    return NextResponse.json({ error: "Non è possibile cambiare il ruolo dell'owner." }, { status: 400 });
  }

  const { error } = await supabase
    .from("org_members")
    .update({ role: parsed.data.role })
    .eq("organization_id", orgId)
    .eq("user_id", userId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

// DELETE /api/orgs/[orgId]/members/[userId] — rimuove membro
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ orgId: string; userId: string }> },
) {
  const { orgId, userId } = await params;
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
    return NextResponse.json({ error: "Solo owner/admin." }, { status: 403 });
  }

  const { data: target } = await supabase
    .from("org_members")
    .select("role")
    .eq("organization_id", orgId)
    .eq("user_id", userId)
    .maybeSingle();
  if (!target) return NextResponse.json({ error: "Membro non trovato" }, { status: 404 });
  if (target.role === "owner") {
    return NextResponse.json({ error: "Non è possibile rimuovere l'owner." }, { status: 400 });
  }

  const { error } = await supabase
    .from("org_members")
    .delete()
    .eq("organization_id", orgId)
    .eq("user_id", userId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
