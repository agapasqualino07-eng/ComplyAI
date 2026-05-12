import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/server";
import { isAdminEmail, requireUser } from "@/lib/auth";

const schema = z.object({
  title: z.string().min(2).max(200),
  content: z.string().min(2),
  severity: z.enum(["info", "warning", "critical"]).default("info"),
  impact: z.string().optional().or(z.literal("")),
  source: z.string().optional().or(z.literal("")),
  published_at: z.string().optional(),
});

export async function POST(req: Request) {
  const { user } = await requireUser();
  if (!isAdminEmail(user.email)) {
    return NextResponse.json({ error: "Solo admin." }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Dati non validi" }, { status: 400 });

  const admin = createAdminClient();
  const { error } = await admin.from("alerts").insert({
    title: parsed.data.title,
    content: parsed.data.content,
    severity: parsed.data.severity,
    impact: parsed.data.impact || null,
    source: parsed.data.source || null,
    published_at: parsed.data.published_at
      ? new Date(parsed.data.published_at).toISOString()
      : new Date().toISOString(),
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
