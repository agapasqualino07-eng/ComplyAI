import { redirect } from "next/navigation";
import { getUserOrganizations } from "@/lib/auth";
import { OnboardingForm } from "./form";

export const metadata = { title: "Configurazione iniziale" };

export default async function OnboardingPage() {
  const { orgs } = await getUserOrganizations();
  if (orgs.length > 0) redirect(`/dashboard/${orgs[0].id}`);

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-6">
      <div className="w-full max-w-2xl space-y-8">
        <div className="text-center space-y-2">
          <span className="inline-flex items-center rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-medium">
            Passo 1 di 1
          </span>
          <h1 className="text-3xl sm:text-4xl font-display font-bold">Crea la tua azienda</h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Inseriamo le informazioni dell'azienda per cui vuoi gestire la compliance. Saranno usate per generare automaticamente i tuoi documenti legali.
          </p>
        </div>
        <OnboardingForm />
      </div>
    </div>
  );
}
