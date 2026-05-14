/**
 * Rate limiter in-memory minimale (per istanza Vercel function).
 * Adatto a evitare flood banali su endpoint pubblici; non sostituisce un
 * rate limiter distribuito (Upstash/Redis) per attacchi seri.
 *
 * Usage:
 *   const rl = checkRateLimit(`quiz:${ip}`, { window: 60_000, max: 5 });
 *   if (!rl.allowed) return new Response("Too Many Requests", { status: 429 });
 */

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

// Pulizia opportunistica: ogni 1000 chiamate evita memory leak.
let callCount = 0;
function maybeCleanup() {
  if (++callCount % 1000 !== 0) return;
  const now = Date.now();
  for (const [k, b] of buckets) {
    if (b.resetAt < now) buckets.delete(k);
  }
}

export function checkRateLimit(
  key: string,
  opts: { window: number; max: number } = { window: 60_000, max: 10 },
): { allowed: boolean; remaining: number; resetAt: number } {
  maybeCleanup();
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || existing.resetAt < now) {
    const resetAt = now + opts.window;
    buckets.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: opts.max - 1, resetAt };
  }

  if (existing.count >= opts.max) {
    return { allowed: false, remaining: 0, resetAt: existing.resetAt };
  }

  existing.count += 1;
  return { allowed: true, remaining: opts.max - existing.count, resetAt: existing.resetAt };
}

/**
 * Estrae l'IP dal request, preferendo l'header impostato da Vercel.
 */
export function getClientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  const real = req.headers.get("x-real-ip");
  if (real) return real;
  return "unknown";
}
