import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/server";

const schema = z.object({
  site_id: z.string(),
  subject_id: z.string().min(8).max(128),
  categories: z.record(z.boolean()),
  consent_string: z.string().max(500),
  page_url: z.string().max(2048).optional(),
  user_agent: z.string().max(500).optional(),
});

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: cors });
}

async function hashIp(ip: string | null) {
  if (!ip) return null;
  const enc = new TextEncoder();
  const data = enc.encode(ip + (process.env.SUPABASE_SERVICE_ROLE_KEY || "salt"));
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 32);
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "invalid" }, { status: 400, headers: cors });

  const supabase = createAdminClient();
  const { data: site } = await supabase
    .from("sites")
    .select("id, organization_id")
    .eq("public_id", parsed.data.site_id)
    .maybeSingle();
  if (!site) return NextResponse.json({ error: "site_not_found" }, { status: 404, headers: cors });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null;
  const ipHash = await hashIp(ip);

  await supabase.from("consent_logs").insert({
    site_id: site.id,
    organization_id: site.organization_id,
    subject_id: parsed.data.subject_id,
    consent_string: parsed.data.consent_string,
    categories: parsed.data.categories as any,
    user_agent: parsed.data.user_agent || null,
    ip_hash: ipHash,
    page_url: parsed.data.page_url || null,
  });

  return NextResponse.json({ ok: true }, { headers: cors });
}
