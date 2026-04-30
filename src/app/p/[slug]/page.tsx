import { notFound } from "next/navigation";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/server";
import { ShieldCheck } from "lucide-react";

export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = createAdminClient();
  const { data: doc } = await supabase
    .from("documents")
    .select("title")
    .eq("slug", slug)
    .not("published_at", "is", null)
    .maybeSingle();
  if (!doc) return { title: "Documento non trovato" };
  return { title: doc.title, robots: { index: true, follow: true } };
}

export default async function PublicPolicyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = createAdminClient();
  const { data: doc } = await supabase
    .from("documents")
    .select("title, rendered_html, language, updated_at, organization_id")
    .eq("slug", slug)
    .not("published_at", "is", null)
    .maybeSingle();

  if (!doc) notFound();

  return (
    <div className="min-h-screen bg-white text-zinc-900">
      <header className="border-b">
        <div className="container-narrow flex items-center justify-between py-3">
          <span className="text-sm text-zinc-500">Documento pubblicato tramite</span>
          <Link href="https://aicomplyonline.it" className="inline-flex items-center gap-1.5 text-sm font-semibold text-violet-700">
            <ShieldCheck className="h-4 w-4" /> ComplyAI
          </Link>
        </div>
      </header>
      <main className="container-narrow py-10">
        <article className="policy-prose" dangerouslySetInnerHTML={{ __html: doc.rendered_html }} />
      </main>
      <footer className="border-t mt-12">
        <div className="container-narrow py-6 text-xs text-zinc-500 flex flex-wrap items-center justify-between gap-2">
          <span>© {new Date().getFullYear()} {doc.title.split("—").pop()?.trim()}</span>
          <Link href="https://aicomplyonline.it" className="hover:text-violet-700">Crea il tuo con ComplyAI →</Link>
        </div>
      </footer>
    </div>
  );
}
