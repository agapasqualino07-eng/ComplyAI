import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const schema = z.object({
  theme: z.enum(["light", "dark", "auto"]).optional(),
  accent_color: z.string().regex(/^#?[0-9a-fA-F]{6}$/).optional(),
  position: z.enum(["bottom", "top", "center"]).optional(),
  layout: z.enum(["bar", "box"]).optional(),
  consent_mode: z.enum(["opt_in", "opt_out", "info"]).optional(),
  texts: z.record(z.string()).optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ siteId: string }> },
) {
  const { siteId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non autenticato" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Dati non validi" }, { status: 400 });

  const update = { ...parsed.data };
  if (update.accent_color && !update.accent_color.startsWith("#")) {
    update.accent_color = `#${update.accent_color}`;
  }

  const { error } = await supabase.from("cmp_configs").update(update).eq("site_id", siteId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
