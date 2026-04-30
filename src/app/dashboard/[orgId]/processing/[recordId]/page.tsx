import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireActiveOrg } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProcessingForm } from "../form";
import { DeleteRecordButton } from "./delete";

export default async function ProcessingDetailPage({
  params,
}: {
  params: Promise<{ orgId: string; recordId: string }>;
}) {
  const { orgId, recordId } = await params;
  const { supabase } = await requireActiveOrg(orgId);

  const { data: record } = await supabase
    .from("processing_records")
    .select("*")
    .eq("id", recordId)
    .eq("organization_id", orgId)
    .maybeSingle();
  if (!record) notFound();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link href={`/dashboard/${orgId}/processing`}>
        <Button variant="ghost" size="sm">
          <ArrowLeft className="h-4 w-4" /> Tutti i trattamenti
        </Button>
      </Link>
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-display font-bold">{record.name}</h1>
        <DeleteRecordButton orgId={orgId} recordId={recordId} />
      </div>
      <Card>
        <CardContent className="pt-6">
          <ProcessingForm orgId={orgId} initial={record} />
        </CardContent>
      </Card>
    </div>
  );
}
