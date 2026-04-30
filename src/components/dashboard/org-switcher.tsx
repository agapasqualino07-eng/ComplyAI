"use client";

import { useRouter } from "next/navigation";
import { Building2, ChevronsUpDown, Plus } from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

interface Props {
  orgId: string;
  orgs: Array<{ id: string; name: string }>;
}

export function OrgSwitcher({ orgId, orgs }: Props) {
  const router = useRouter();
  const current = orgs.find((o) => o.id === orgId);

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className="w-full flex items-center justify-between gap-2 rounded-lg border bg-card px-3 py-2 text-sm hover:bg-accent transition-colors">
          <span className="flex items-center gap-2 min-w-0">
            <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="truncate font-medium">{current?.name || "Seleziona azienda"}</span>
          </span>
          <ChevronsUpDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="z-50 min-w-[14rem] rounded-lg border bg-popover p-1 shadow-md"
          align="start"
          sideOffset={4}
        >
          <DropdownMenu.Label className="px-2 py-1.5 text-xs uppercase tracking-wide text-muted-foreground">
            Le tue aziende
          </DropdownMenu.Label>
          {orgs.map((o) => (
            <DropdownMenu.Item
              key={o.id}
              onSelect={() => router.push(`/dashboard/${o.id}`)}
              className="cursor-pointer rounded px-2 py-1.5 text-sm hover:bg-accent outline-none flex items-center gap-2"
            >
              <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="flex-1 truncate">{o.name}</span>
              {o.id === orgId && <span className="text-primary text-xs">●</span>}
            </DropdownMenu.Item>
          ))}
          <DropdownMenu.Separator className="my-1 h-px bg-border" />
          <DropdownMenu.Item
            onSelect={() => router.push("/onboarding/new")}
            className="cursor-pointer rounded px-2 py-1.5 text-sm hover:bg-accent outline-none flex items-center gap-2 text-primary"
          >
            <Plus className="h-3.5 w-3.5" />
            Crea nuova azienda
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
