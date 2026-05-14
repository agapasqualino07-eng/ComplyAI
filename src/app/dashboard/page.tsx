import { redirect } from "next/navigation";
import { getUserOrganizations } from "@/lib/auth";

export default async function DashboardIndex() {
  const { orgs } = await getUserOrganizations();
  if (orgs.length === 0) redirect("/onboarding");
  redirect(`/dashboard/${orgs[0].id}`);
}
