"use client";

import { useRouter } from "next/navigation";

interface Props {
  orgId: string;
  value?: string;
  sites: Array<{ id: string; name: string }>;
}

export function SiteFilter({ orgId, value, sites }: Props) {
  const router = useRouter();
  return (
    <select
      className="h-10 rounded-lg border bg-background px-3 text-sm"
      defaultValue={value || ""}
      onChange={(e) => {
        const v = e.target.value;
        router.push(v ? `/dashboard/${orgId}/consents?siteId=${v}` : `/dashboard/${orgId}/consents`);
      }}
    >
      <option value="">Tutti i siti</option>
      {sites.map((s) => (
        <option key={s.id} value={s.id}>
          {s.name}
        </option>
      ))}
    </select>
  );
}
