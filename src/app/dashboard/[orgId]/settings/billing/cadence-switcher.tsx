"use client";

import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export function CadenceSwitcher({ orgId, value }: { orgId: string; value: "monthly" | "yearly" }) {
  const router = useRouter();
  return (
    <div className="inline-flex rounded-lg border p-0.5 bg-card text-sm">
      {(["yearly", "monthly"] as const).map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => router.push(`/dashboard/${orgId}/settings/billing?cadence=${c}`)}
          className={cn(
            "px-3 py-1.5 rounded-md transition-colors",
            value === c ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
          )}
        >
          {c === "yearly" ? "Annuale (–17%)" : "Mensile"}
        </button>
      ))}
    </div>
  );
}
