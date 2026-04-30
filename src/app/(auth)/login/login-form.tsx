"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

export function LoginForm({
  searchParamsPromise,
}: {
  searchParamsPromise: Promise<{ next?: string; verified?: string }>;
}) {
  const params = use(searchParamsPromise);
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [magicLoading, setMagicLoading] = useState(false);

  async function handlePassword(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast.error(error.message === "Invalid login credentials" ? "Credenziali non valide." : error.message);
      return;
    }
    toast.success("Accesso effettuato.");
    router.push(params.next || "/dashboard");
    router.refresh();
  }

  async function handleMagic() {
    if (!email) {
      toast.error("Inserisci la tua email.");
      return;
    }
    setMagicLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=${params.next || "/dashboard"}` },
    });
    setMagicLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Ti abbiamo inviato un link di accesso via email.");
  }

  return (
    <form onSubmit={handlePassword} className="space-y-4">
      {params.verified === "1" && (
        <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-800">
          Email verificata. Ora puoi accedere.
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="tu@azienda.it"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
          <Link href="/forgot-password" className="text-sm text-muted-foreground hover:text-primary">
            Dimenticata?
          </Link>
        </div>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
        />
      </div>
      <Button type="submit" disabled={loading} className="w-full" size="lg">
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        Accedi
      </Button>
      <div className="relative my-2">
        <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">oppure</span>
        </div>
      </div>
      <Button type="button" variant="outline" className="w-full" size="lg" onClick={handleMagic} disabled={magicLoading}>
        {magicLoading && <Loader2 className="h-4 w-4 animate-spin" />}
        Invia link magico via email
      </Button>
    </form>
  );
}
