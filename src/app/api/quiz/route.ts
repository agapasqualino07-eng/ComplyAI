import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const schema = z.object({
  sector: z.string().nullable().optional(),
  employees: z.string().nullable().optional(),
  score: z.number().nullable().optional(),
  systems_count: z.number().nullable().optional(),
  risk_summary: z.record(z.any()).optional(),
  answers: z.record(z.any()).optional(),
  email: z.string().email().nullable().optional(),
});

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const rl = checkRateLimit(`quiz:${ip}`, { window: 60_000, max: 5 });
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Troppi tentativi. Riprova tra qualche minuto." },
      { status: 429, headers: { "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } },
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "invalid" }, { status: 400 });

  const supabase = createAdminClient();
  await supabase.from("quiz_completions").insert({
    sector: parsed.data.sector ?? null,
    employees: parsed.data.employees ?? null,
    score: parsed.data.score ?? null,
    systems_count: parsed.data.systems_count ?? null,
    risk_summary: (parsed.data.risk_summary ?? {}) as any,
    answers: (parsed.data.answers ?? {}) as any,
    email: parsed.data.email ?? null,
  });

  return NextResponse.json({ ok: true });
}
