"use client";

import Link from "next/link";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { LogOut, Settings, User, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Props {
  user: { email?: string | null; user_metadata?: any };
  orgId: string;
  subscription: any;
}

export function Topbar({ user, orgId, subscription }: Props) {
  const initials = (user.user_metadata?.full_name || user.email || "?")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p: string) => p[0]?.toUpperCase())
    .join("") || "?";

  const planLabel: Record<string, string> = {
    free: "Trial",
    solo: "Solo",
    pro: "Pro",
    business: "Business",
    enterprise: "Enterprise",
  };

  return (
    <header className="sticky top-0 z-20 h-16 border-b bg-background/80 backdrop-blur flex items-center px-4 sm:px-6 lg:px-8">
      <div className="flex-1 flex items-center gap-3">
        {subscription?.status === "trialing" && (
          <Link href={`/dashboard/${orgId}/settings/billing`} className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Sei in prova gratuita — <span className="text-primary underline">scegli un piano</span>
          </Link>
        )}
      </div>
      <div className="flex items-center gap-3">
        <Badge variant="secondary" className="hidden sm:inline-flex">
          Piano: {planLabel[subscription?.plan || "free"]}
        </Badge>
        <Link href={`/dashboard/${orgId}/settings/billing`}>
          <Button size="sm" variant="gradient">
            <Sparkles className="h-3.5 w-3.5" />
            Upgrade
          </Button>
        </Link>
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button className="h-9 w-9 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 text-white text-sm font-medium grid place-items-center">
              {initials}
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              align="end"
              sideOffset={6}
              className="z-50 min-w-[14rem] rounded-lg border bg-popover p-1 shadow-md"
            >
              <div className="px-2 py-1.5 text-xs text-muted-foreground truncate">{user.email}</div>
              <DropdownMenu.Separator className="my-1 h-px bg-border" />
              <DropdownMenu.Item asChild>
                <Link href={`/dashboard/${orgId}/settings/organization`} className="flex items-center gap-2 rounded px-2 py-1.5 text-sm cursor-pointer hover:bg-accent outline-none">
                  <Settings className="h-4 w-4" /> Impostazioni
                </Link>
              </DropdownMenu.Item>
              <DropdownMenu.Item asChild>
                <Link href={`/account`} className="flex items-center gap-2 rounded px-2 py-1.5 text-sm cursor-pointer hover:bg-accent outline-none">
                  <User className="h-4 w-4" /> Il mio profilo
                </Link>
              </DropdownMenu.Item>
              <DropdownMenu.Separator className="my-1 h-px bg-border" />
              <DropdownMenu.Item asChild>
                <form action="/auth/signout" method="post" className="w-full">
                  <button type="submit" className="w-full flex items-center gap-2 rounded px-2 py-1.5 text-sm cursor-pointer hover:bg-accent outline-none text-left text-destructive">
                    <LogOut className="h-4 w-4" /> Esci
                  </button>
                </form>
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>
    </header>
  );
}
