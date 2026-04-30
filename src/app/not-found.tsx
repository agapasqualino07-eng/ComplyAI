import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShieldCheck } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <ShieldCheck className="h-12 w-12 text-primary mb-4" />
      <h1 className="text-4xl font-display font-bold">404</h1>
      <p className="text-muted-foreground mt-2">La pagina che cerchi non esiste o è stata spostata.</p>
      <Link href="/" className="mt-6">
        <Button variant="gradient">Torna alla home</Button>
      </Link>
    </div>
  );
}
