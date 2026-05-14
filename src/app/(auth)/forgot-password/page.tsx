"use client";

import { useState } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/account/password`,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setSent(true);
  }

  return (
    <div className="w-full max-w-md space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold">Reset password</h1>
        <p className="text-muted-foreground mt-2">Ti invieremo un link per impostare una nuova password.</p>
      </div>
      {sent ? (
        <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-4 text-sm text-emerald-800">
          Se l'email è registrata, riceverai a breve il link di reset. Controlla anche la cartella spam.
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Invia link di reset
          </Button>
        </form>
      )}
      <p className="text-sm text-muted-foreground text-center">
        <Link href="/login" className="text-primary hover:underline">← Torna al login</Link>
      </p>
    </div>
  );
}
