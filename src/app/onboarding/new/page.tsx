import { requireUser } from "@/lib/auth";
import { OnboardingForm } from "../form";

export const metadata = { title: "Nuova azienda" };

export default async function NewOrgPage() {
  await requireUser();
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-6">
      <div className="w-full max-w-2xl space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-display font-bold">Aggiungi una nuova azienda</h1>
          <p className="text-muted-foreground">Gestisci più aziende con un singolo account AIComply.</p>
        </div>
        <OnboardingForm />
      </div>
    </div>
  );
}
