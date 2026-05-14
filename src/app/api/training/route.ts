import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { recomputeScore } from "@/lib/compliance";
import { audit } from "@/lib/audit";

const schema = z.object({
  organization_id: z.string().uuid(),
  employee_name: z.string().min(2),
  employee_email: z.string().email().nullable().optional(),
  topic: z.string().min(2),
  module_id: z.string().nullable().optional(),
  duration_hours: z.number().min(0).max(40),
  completed_at: z.string(),
  notes: z.string().nullable().optional(),
});

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non autenticato" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Dati non validi" }, { status: 400 });

  const { error } = await supabase.from("training_records").insert(parsed.data as any);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await Promise.all([
    recomputeScore(parsed.data.organization_id),
    audit({
      organizationId: parsed.data.organization_id,
      actorId: user.id,
      action: "training.recorded",
      targetType: "training_record",
      metadata: {
        employee_name: parsed.data.employee_name,
        topic: parsed.data.topic,
        hours: parsed.data.duration_hours,
      },
    }),
  ]);
  return NextResponse.json({ ok: true });
}
