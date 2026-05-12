"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { validatePassword } from "@/lib/password";

export function SignupForm() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const pwChecks = useMemo(() => {
    return {
      length: password.length >= 8,
      letter: /[a-zA-Z]/.test(password),
      digit: /\d/.test(password),
    };
  }, [password]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validation = validatePassword(password);
    if (!validation.valid) {
      toast.error(validation.message);
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/onboarding`,
      },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    if (data.user && !data.session) {
      toast.success("Ti abbiamo inviato un'email per confermare l'indirizzo.");
      router.push("/check-email");
    } else {
      toast.success("Account creato!");
      router.push("/onboarding");
      router.refresh();
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="full_name">Nome completo</Label>
        <Input id="full_name" autoComplete="name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email aziendale</Label>
        <Input id="email" type="email" autoComplete="email" placeholder="tu@azienda.it" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {password.length > 0 && (
          <ul className="text-xs space-y-1 mt-1">
            <PwRule ok={pwChecks.length} label="Almeno 8 caratteri" />
            <PwRule ok={pwChecks.letter} label="Almeno una lettera" />
            <PwRule ok={pwChecks.digit} label="Almeno un numero" />
          </ul>
        )}
      </div>
      <Button type="submit" disabled={loading} className="w-full" size="lg" variant="gradient">
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        Crea account e inizia
      </Button>
    </form>
  );
}

function PwRule({ ok, label }: { ok: boolean; label: string }) {
  return (
    <li className={`flex items-center gap-1.5 ${ok ? "text-emerald-600" : "text-muted-foreground"}`}>
      {ok ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
      {label}
    </li>
  );
}
