import { redirect } from "next/navigation";
import { getUserOrganizations } from "@/lib/auth";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";

export default async function OrgLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ orgId: string }>;
}) {
  const { orgId } = await params;
  const { user, orgs, supabase } = await getUserOrganizations();
  const org = orgs.find((o) => o.id === orgId);
  if (!org) redirect("/dashboard");

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("plan, status, trial_end, current_period_end, cancel_at_period_end")
    .eq("organization_id", orgId)
    .maybeSingle();

  return (
    <div className="min-h-screen bg-muted/30">
      <Sidebar orgId={orgId} orgName={org.name} orgs={orgs} subscription={subscription} />
      <div className="lg:pl-64">
        <Topbar user={user} orgId={orgId} subscription={subscription} />
        <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
