# ComplyAI — Guida deploy

Questo documento spiega come mettere online ComplyAI (il SaaS) su `aicomplyonline.it` partendo da zero.

## 1. Variabili d'ambiente (Vercel)

Vai su **Vercel → Project → Settings → Environment Variables** e imposta:

### App
| Nome | Valore |
|---|---|
| `NEXT_PUBLIC_APP_URL` | `https://aicomplyonline.it` |
| `NEXT_PUBLIC_APP_NAME` | `ComplyAI` |

### Supabase
| Nome | Dove prenderlo |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API → anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API → service_role key (⚠️ riservata) |

### Stripe
| Nome | Dove prenderlo |
|---|---|
| `STRIPE_SECRET_KEY` | Stripe → Developers → API Keys → Secret key |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe → Developers → API Keys → Publishable key |
| `STRIPE_WEBHOOK_SECRET` | Stripe → Developers → Webhooks → endpoint creato (vedi punto 4) |

### Stripe Price IDs
Crea 8 Prices su Stripe Dashboard (4 piani × 2 cadenze). Prezzi suggeriti (in EUR):

| Piano | Mensile | Annuale |
|---|---|---|
| Solo | 14 €/mese | 119 €/anno |
| Pro | 29 €/mese | 249 €/anno |
| Business | 59 €/mese | 499 €/anno |
| Enterprise | 99 €/mese | 899 €/anno |

Imposta queste env vars con i `price_xxx` corrispondenti:

```
STRIPE_PRICE_SOLO_MONTHLY
STRIPE_PRICE_SOLO_YEARLY
STRIPE_PRICE_PRO_MONTHLY
STRIPE_PRICE_PRO_YEARLY
STRIPE_PRICE_BUSINESS_MONTHLY
STRIPE_PRICE_BUSINESS_YEARLY
STRIPE_PRICE_ENTERPRISE_MONTHLY
STRIPE_PRICE_ENTERPRISE_YEARLY
```

### Admin
| Nome | Valore |
|---|---|
| `ADMIN_EMAILS` | la tua email separata da virgola |

## 2. Setup Supabase

1. Apri **Supabase Dashboard → SQL Editor**.
2. Copia il contenuto di `supabase/migrations/0001_init.sql` (in questo repo) ed esegui.
3. Esegui poi `supabase/migrations/0002_ai_act.sql` per il modulo AI Act (registro sistemi AI + nuovi tipi documento).
3. Vai in **Authentication → URL Configuration** e imposta:
   - **Site URL**: `https://aicomplyonline.it`
   - **Redirect URLs**: aggiungi `https://aicomplyonline.it/auth/callback`
4. (Consigliato) **Authentication → Providers → Email**: abilita "Confirm email".
5. (Consigliato) **Authentication → Email Templates**: traduci i template in italiano.

## 3. Setup Stripe

1. Crea i **Products** e relativi **Prices** (8 prices, vedi tabella sopra).
2. Vai in **Settings → Customer Portal**, abilitalo, configura:
   - Permetti aggiornamento metodo pagamento, fatture, cancellazione abbonamento.
3. Configura il **branding** (logo, colori) per il portale e Checkout.

## 4. Webhook Stripe

1. Stripe Dashboard → **Developers → Webhooks → Add endpoint**.
2. URL: `https://aicomplyonline.it/api/stripe/webhook`
3. Eventi da ascoltare:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
4. Copia il `Signing secret` (whsec_...) → impostalo come `STRIPE_WEBHOOK_SECRET` su Vercel.

## 5. Deploy

Push sul branch `claude/build-saas-platform-a8Bi7` (o merge su `main`). Vercel deploya automaticamente.

## 6. Domini

`aicomplyonline.it` deve puntare al progetto Vercel (DNS già attivo come confermato). Verifica:
- `https://aicomplyonline.it` → home funzionante
- `https://aicomplyonline.it/cmp/v1.js` → restituisce JS
- `https://aicomplyonline.it/api/stripe/webhook` → POST gestito

## 7. Test post-deploy

1. **Signup**: registrati con un'email reale, verifica email arrivata.
2. **Onboarding**: crea un'azienda di test.
3. **Sito**: aggiungi un dominio fittizio, verifica snippet generato.
4. **Documento**: genera Privacy Policy → pubblicala → apri `/p/{slug}` in incognito.
5. **CMP**: in pagina sito, copia lo snippet, incollalo in un file HTML di test, verifica banner.
6. **Stripe**: clicca "Attiva con prova 14gg" su un piano → completa Checkout in modalità test.
7. **Webhook**: dopo il checkout, verifica su Supabase tabella `subscriptions` aggiornata.

## Architettura

```
Frontend / API   →  Next.js 15 (App Router) su Vercel
Auth             →  Supabase Auth (email + magic link)
Database         →  Supabase Postgres con RLS multi-tenant
Pagamenti        →  Stripe Checkout + Customer Portal
CMP banner       →  /cmp/v1.js (edge), /api/cmp/config/[siteId], /api/consent
Storage policy   →  /p/[slug] (revalidate 5 min, server-rendered HTML)
```

## Sviluppo locale

```bash
npm install
cp .env.example .env.local
# compila .env.local con le tue chiavi
npm run dev
```

Apri http://localhost:3000.
