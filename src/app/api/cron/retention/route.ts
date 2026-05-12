import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/cron/retention
 *
 * Endpoint invocato da Vercel Cron una volta al giorno (vedi vercel.json).
 * Esegue purge_expired_data() su Supabase per applicare i periodi di
 * conservazione GDPR.
 *
 * Sicurezza:
 *   - Vercel Cron firma le request con header Authorization: Bearer <CRON_SECRET>.
 *   - Senza il secret, l'endpoint risponde 401.
 */
export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    return NextResponse.json(
      { error: "CRON_SECRET non configurato" },
      { status: 500 },
    );
  }
  if (auth !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const admin = createAdminClient();
    const { data, error } = await admin.rpc("purge_expired_data");
    if (error) throw error;

    console.info("[cron/retention] purged", data);
    return NextResponse.json({ ok: true, result: data });
  } catch (err: any) {
    console.error("[cron/retention] failed", err?.message);
    return NextResponse.json(
      { error: err?.message || "purge failed" },
      { status: 500 },
    );
  }
}
