import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function requireUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return { user, supabase };
}

export async function getUserOrganizations() {
  const { user, supabase } = await requireUser();
  const { data: memberships } = await supabase
    .from("org_members")
    .select("role, organization:organizations(*)")
    .eq("user_id", user.id);

  const orgs =
    memberships?.map((m) => ({
      ...(m.organization as any),
      role: m.role,
    })) ?? [];

  return { user, orgs, supabase };
}

export async function requireActiveOrg(orgId: string) {
  const { user, orgs, supabase } = await getUserOrganizations();
  const org = orgs.find((o) => o.id === orgId);
  if (!org) redirect("/dashboard");
  return { user, org, supabase };
}

export function isAdminEmail(email: string | undefined | null) {
  if (!email) return false;
  const list = (process.env.ADMIN_EMAILS || "").split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
  return list.includes(email.toLowerCase());
}
