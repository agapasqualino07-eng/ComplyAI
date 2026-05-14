import { redirect } from "next/navigation";
import Link from "next/link";
import { createAdminClient, createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AcceptInviteButton } from "./accept-button";

export const metadata = { title: "Invito a unirti" };

export default async function InviteAcceptPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const admin = createAdminClient();
  const { data: invite } = await admin
    .from("org_invitations")
    .select("id, email, role, expires_at, accepted_at, organization:organizations!inner(id, name)")
    .eq("token", token)
    .maybeSingle();

  if (!invite) {
    return (
      <Centered>
        <h1 className="text-2xl font-display font-bold">Invito non valido</h1>
        <p className="text-muted-foreground">Il link di invito non esiste o è stato revocato.</p>
        <Link href="/login"><Button>Torna al login</Button></Link>
      </Centered>
    );
  }

  if (invite.accepted_at) {
    redirect(`/dashboard/${(invite.organization as any).id}`);
  }

  if (new Date(invite.expires_at).getTime() < Date.now()) {
    return (
      <Centered>
        <h1 className="text-2xl font-display font-bold">Invito scaduto</h1>
        <p className="text-muted-foreground">
          Questo invito è scaduto. Chiedi all'amministratore di reinviarlo.
        </p>
      </Centered>
    );
  }

  // Verifica auth
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/login?next=${encodeURIComponent(`/invite/${token}`)}`);
  }

  const emailMismatch = user.email?.toLowerCase() !== invite.email.toLowerCase();

  return (
    <Centered>
      <h1 className="text-2xl font-display font-bold">Sei stato invitato</h1>
      <Card>
        <CardContent className="pt-6 space-y-3">
          <p>
            <strong>{(invite.organization as any).name}</strong> ti ha invitato a unirti come{" "}
            <code className="rounded bg-muted px-1.5 py-0.5">{invite.role}</code>.
          </p>
          <p className="text-sm text-muted-foreground">
            Invito per: <strong>{invite.email}</strong>
          </p>
          {emailMismatch && (
            <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
              Sei loggato come <strong>{user.email}</strong>, ma l'invito è per{" "}
              <strong>{invite.email}</strong>. Esci e accedi con l'indirizzo corretto.
            </div>
          )}
        </CardContent>
      </Card>
      {!emailMismatch && <AcceptInviteButton token={token} />}
      {emailMismatch && (
        <form action="/auth/signout" method="post">
          <Button type="submit" variant="outline">Esci</Button>
        </form>
      )}
    </Centered>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-6">
      <div className="w-full max-w-md space-y-4 text-center">{children}</div>
    </div>
  );
}
