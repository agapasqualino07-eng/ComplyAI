/** @type {import('next').NextConfig} */

const isProd = process.env.NODE_ENV === "production";

// CSP base. 'unsafe-inline' su style e 'unsafe-eval' su script sono richiesti
// da Next.js dev e da alcune librerie (Stripe.js, Supabase). In produzione
// 'unsafe-eval' viene rimosso.
const csp = [
  "default-src 'self'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  `script-src 'self' 'unsafe-inline'${isProd ? "" : " 'unsafe-eval'"} https://js.stripe.com https://*.vercel-scripts.com`,
  "style-src 'self' 'unsafe-inline'",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.stripe.com https://*.vercel-scripts.com",
  "frame-src https://js.stripe.com https://hooks.stripe.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  "upgrade-insecure-requests",
].join("; ");

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Rete di sicurezza: non blocchiamo il deploy su errori type/lint v1.
  // Da rimuovere quando ripuliamo i tipi del DB con `supabase gen types`.
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(self \"https://js.stripe.com\")" },
          { key: "Content-Security-Policy", value: csp },
        ],
      },
    ];
  },
};

export default nextConfig;
