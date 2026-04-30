import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function csvEscape(value: any) {
  if (value === null || value === undefined) return "";
  const str = typeof value === "string" ? value : JSON.stringify(value);
  if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
}

export async function GET(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non autenticato" }, { status: 401 });

  const url = new URL(req.url);
  const orgId = url.searchParams.get("orgId");
  const siteId = url.searchParams.get("siteId");
  if (!orgId) return NextResponse.json({ error: "orgId mancante" }, { status: 400 });

  let q = supabase
    .from("consent_logs")
    .select("created_at, subject_id, consent_string, categories, page_url, user_agent, ip_hash, site_id")
    .eq("organization_id", orgId)
    .order("created_at", { ascending: false })
    .limit(50000);
  if (siteId) q = q.eq("site_id", siteId);

  const { data, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const headers = ["timestamp", "subject_id", "site_id", "consent_string", "categories", "page_url", "user_agent", "ip_hash"];
  const rows = [
    headers.join(","),
    ...(data || []).map((r) =>
      [r.created_at, r.subject_id, r.site_id, r.consent_string, JSON.stringify(r.categories), r.page_url, r.user_agent, r.ip_hash].map(csvEscape).join(","),
    ),
  ].join("\n");

  return new NextResponse(rows, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename=\"consents-${new Date().toISOString().slice(0, 10)}.csv\"`,
      "Cache-Control": "no-store",
    },
  });
}
