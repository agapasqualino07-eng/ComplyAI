import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { isAdminEmail, requireUser } from "@/lib/auth";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { user } = await requireUser();
  if (!isAdminEmail(user.email)) {
    return NextResponse.json({ error: "Solo admin." }, { status: 403 });
  }

  const admin = createAdminClient();
  const { error } = await admin.from("alerts").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
