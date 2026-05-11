import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const checks: Record<string, "ok" | "fail" | "skipped"> = {
    api: "ok",
    db: "skipped",
  };

  if (process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.NEXT_PUBLIC_SUPABASE_URL) {
    try {
      const admin = createAdminClient();
      const { error } = await admin
        .from("alerts")
        .select("id", { count: "exact", head: true });
      checks.db = error ? "fail" : "ok";
    } catch {
      checks.db = "fail";
    }
  }

  const allOk = Object.values(checks).every((v) => v !== "fail");
  return NextResponse.json(
    {
      status: allOk ? "ok" : "degraded",
      checks,
      version: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || "dev",
      time: new Date().toISOString(),
    },
    { status: allOk ? 200 : 503 },
  );
}
