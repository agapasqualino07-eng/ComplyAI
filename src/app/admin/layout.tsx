import { redirect } from "next/navigation";
import Link from "next/link";
import { requireUser, isAdminEmail } from "@/lib/auth";
import { Shield } from "lucide-react";

export const metadata = { title: "Admin" };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user } = await requireUser();
  if (!isAdminEmail(user.email)) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background">
        <div className="container-narrow flex h-14 items-center justify-between">
          <div className="flex items-center gap-2 font-semibold">
            <Shield className="h-4 w-4 text-primary" /> AIComplyOnline Admin
          </div>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/admin/alerts" className="hover:underline">Alerts</Link>
            <Link href="/dashboard" className="text-muted-foreground hover:underline">
              ← Dashboard
            </Link>
          </nav>
        </div>
      </header>
      <main className="container-narrow py-8">{children}</main>
    </div>
  );
}
