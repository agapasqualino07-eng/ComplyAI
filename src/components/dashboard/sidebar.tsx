"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Globe,
  FileText,
  Cookie,
  ScrollText,
  ClipboardList,
  Users,
  Settings,
  CreditCard,
  ShieldCheck,
  CircleHelp,
  Bot,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { OrgSwitcher } from "./org-switcher";

const nav = (orgId: string) => [
  { label: "Panoramica", href: `/dashboard/${orgId}`, icon: LayoutDashboard },
  { label: "Siti", href: `/dashboard/${orgId}/sites`, icon: Globe },
  { label: "Documenti", href: `/dashboard/${orgId}/documents`, icon: FileText },
  { label: "Cookie & CMP", href: `/dashboard/${orgId}/cmp`, icon: Cookie },
  { label: "Registro consensi", href: `/dashboard/${orgId}/consents`, icon: ScrollText },
  { label: "Registro trattamenti", href: `/dashboard/${orgId}/processing`, icon: ClipboardList },
  { label: "AI Act", href: `/dashboard/${orgId}/ai`, icon: Bot },
];

const settingsNav = (orgId: string) => [
  { label: "Team", href: `/dashboard/${orgId}/settings/team`, icon: Users },
  { label: "Fatturazione", href: `/dashboard/${orgId}/settings/billing`, icon: CreditCard },
  { label: "Azienda", href: `/dashboard/${orgId}/settings/organization`, icon: Settings },
];

interface Props {
  orgId: string;
  orgName: string;
  orgs: Array<{ id: string; name: string }>;
  subscription: any;
}

export function Sidebar({ orgId, orgs, subscription }: Props) {
  const pathname = usePathname();
  const items = nav(orgId);
  const settings = settingsNav(orgId);

  return (
    <aside className="hidden lg:flex flex-col fixed inset-y-0 left-0 z-30 w-64 border-r bg-background">
      <div className="px-4 h-16 flex items-center border-b">
        <Link href="/" className="flex items-center gap-2 font-display font-bold">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 grid place-items-center text-white">
            <ShieldCheck className="h-4 w-4" />
          </div>
          ComplyAI
        </Link>
      </div>

      <div className="px-3 pt-3">
        <OrgSwitcher orgId={orgId} orgs={orgs} />
      </div>

      <nav className="flex-1 px-3 pb-3 space-y-6 overflow-y-auto mt-4">
        <div className="space-y-0.5">
          <p className="px-2 mb-1 text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Workspace</p>
          {items.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname?.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </div>

        <div className="space-y-0.5">
          <p className="px-2 mb-1 text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Impostazioni</p>
          {settings.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      {subscription?.status === "trialing" && subscription.trial_end && (
        <div className="m-3 rounded-lg border bg-accent/30 p-3 text-xs">
          <p className="font-medium mb-1">Prova gratuita</p>
          <p className="text-muted-foreground">
            Termina il {new Date(subscription.trial_end).toLocaleDateString("it-IT")}.
          </p>
          <Link
            href={`/dashboard/${orgId}/settings/billing`}
            className="mt-2 inline-flex text-primary font-medium hover:underline"
          >
            Sottoscrivi un piano →
          </Link>
        </div>
      )}

      <a
        href="mailto:supporto@aicomplyonline.it"
        className="m-3 mt-0 flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
      >
        <CircleHelp className="h-4 w-4" />
        Supporto
      </a>
    </aside>
  );
}
