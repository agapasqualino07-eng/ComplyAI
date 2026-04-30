import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Profilo" };

export default async function AccountPage() {
  const { user } = await requireUser();

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container-narrow py-10 space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold">Il mio profilo</h1>
          <p className="text-muted-foreground">Gestisci il tuo account ComplyAI.</p>
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
        <div className="flex gap-3">
          <Link href="/dashboard">
            <Button>Torna alla dashboard</Button>
          </Link>
          <form action="/auth/signout" method="post">
            <Button type="submit" variant="outline">Esci</Button>
          </form>
        </div>
      </div>
    </div>
  );
}
