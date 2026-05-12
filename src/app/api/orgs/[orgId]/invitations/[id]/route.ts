import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// DELETE /api/orgs/[orgId]/invitations/[id] — revoca invito pendente
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ orgId: string; id: string }> },
) {
  const { orgId, id } = await params;
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
    return NextResponse.json({ error: "Solo owner/admin possono revocare inviti." }, { status: 403 });
  }

  const { error } = await supabase
    .from("org_invitations")
    .delete()
    .eq("id", id)
    .eq("organization_id", orgId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
