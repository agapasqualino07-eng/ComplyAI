"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";

export default function PasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) return toast.error("Min. 8 caratteri.");
    if (password !== confirm) return toast.error("Le password non coincidono.");
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Password aggiornata.");
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container-narrow py-12 max-w-md">
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div>
              <h1 className="text-2xl font-display font-bold">Imposta nuova password</h1>
              <p className="text-muted-foreground text-sm mt-1">Scegli una password sicura.</p>
            </div>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Nuova password</Label>
                <Input
                  id="password"
                  type="password"
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm">Conferma password</Label>
                <Input
                  id="confirm"
                  type="password"
                  minLength={8}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" disabled={loading} variant="gradient" className="w-full" size="lg">
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Aggiorna password
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
