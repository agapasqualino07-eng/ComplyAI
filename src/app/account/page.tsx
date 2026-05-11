import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DeleteAccountButton } from "@/components/delete-account-button";

export const metadata = { title: "Profilo" };

export default async function AccountPage() {
  const { user } = await requireUser();

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container-narrow py-10 space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold">Il mio profilo</h1>
          <p className="text-muted-foreground">Gestisci il tuo account AIComply.</p>
        </div>

        <Card>
          <CardContent className="pt-6 space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{user.email}</p>
            </div>
            {user.user_metadata?.full_name && (
              <div>
                <p className="text-sm text-muted-foreground">Nome</p>
                <p className="font-medium">{user.user_metadata.full_name}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex flex-wrap gap-3">
          <Link href="/dashboard">
            <Button>Torna alla dashboard</Button>
          </Link>
          <Link href="/account/password">
            <Button variant="outline">Cambia password</Button>
          </Link>
          <form action="/auth/signout" method="post">
            <Button type="submit" variant="outline">Esci</Button>
          </form>
        </div>

        <Card className="border-destructive/40">
          <CardContent className="pt-6 space-y-3">
            <h2 className="text-lg font-semibold text-destructive">Zona pericolo</h2>
            <p className="text-sm text-muted-foreground">
              L'eliminazione dell'account è <strong>irreversibile</strong> ai sensi dell'art. 17 GDPR
              (diritto all'oblio). Verranno cancellati: profilo, tutte le organizzazioni di cui sei
              unico proprietario, i sistemi AI registrati, i documenti, le registrazioni formazione
              e i log. Se hai un abbonamento attivo, devi prima disdirlo dal portale di fatturazione.
            </p>
            <DeleteAccountButton />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
