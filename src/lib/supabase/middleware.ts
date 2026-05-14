import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "./types";
import { SHOW_AUTH } from "@/lib/feature-flags";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const path = request.nextUrl.pathname;
  const isProtected =
    path.startsWith("/dashboard") ||
    path.startsWith("/onboarding") ||
    path.startsWith("/admin") ||
    path.startsWith("/account") ||
    path.startsWith("/invite");
  const isAuthPage = path.startsWith("/login") || path.startsWith("/signup");

  // Modalità presentazione: NEXT_PUBLIC_SHOW_AUTH=false su Vercel nasconde
  // tutte le route che richiedono o offrono autenticazione. Redirige alla
  // homepage chiunque tenti di accedervi via URL diretto.
  if (!SHOW_AUTH && (isProtected || isAuthPage)) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.search = "";
    return NextResponse.redirect(url);
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Se Supabase non e ancora configurato (env vars mancanti), il middleware
  // diventa un no-op: la landing e le pagine pubbliche caricano comunque.
  // Le pagine protette mostreranno l'errore di auth quando Supabase verra configurato.
  if (!supabaseUrl || !supabaseAnon) {
    return supabaseResponse;
  }

  const supabase = createServerClient<Database>(supabaseUrl, supabaseAnon, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
      },
    },
  });

  let user = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch {
    // Token corrotto o errore Supabase: trattiamo come non autenticato.
    user = null;
  }

  if (!user && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  }

  if (user && isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
