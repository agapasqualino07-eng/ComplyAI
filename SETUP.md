# AIComplyOnline — Guida deploy

Questo documento spiega come mettere online AIComplyOnline (compliance AI Act + L. 132/2025) su `aicomplyonline.it`.

## 1. Variabili d'ambiente (Vercel)

Vai su **Vercel → Project → Settings → Environment Variables** e imposta:

### App
| Nome | Valore |
|---|---|
| `NEXT_PUBLIC_APP_URL` | `https://aicomplyonline.it` |
| `NEXT_PUBLIC_APP_NAME` | `AIComplyOnline` |

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
| `STRIPE_WEBHOOK_SECRET` | Stripe → Developers → Webhooks → endpoint (vedi punto 4) |

### Stripe Price IDs (4 in totale: 2 piani × 2 cadenze)

Su Stripe Dashboard crea 2 Products: **Pro** e **Enterprise**, ognuno con prezzo Mensile + Annuale.

Prezzi consigliati:

| Piano | Mensile | Annuale |
|---|---|---|
| Pro | 29 € | 290 € |
| Enterprise | 199 € | 1.990 € |

Imposta queste env vars con i `price_xxx` Stripe corrispondenti:

```
STRIPE_PRICE_PRO_MONTHLY
STRIPE_PRICE_PRO_YEARLY
STRIPE_PRICE_ENTERPRISE_MONTHLY
STRIPE_PRICE_ENTERPRISE_YEARLY
```

### Admin
| Nome | Valore |
|---|---|
| `ADMIN_EMAILS` | la tua email separata da virgola |

## 2. Setup Supabase

1. Apri **Supabase Dashboard → SQL Editor**.
2. Esegui in ordine:
   - `supabase/migrations/0001_init.sql` (base auth/org/subscriptions/documents)
   - `supabase/migrations/0002_ai_act.sql` (registro sistemi AI)
   - `supabase/migrations/0003_aiact_pivot.sql` (pivot AI Act-first, partners, training, alerts, quiz)
3. Vai in **Authentication → URL Configuration**:
   - **Site URL**: `https://aicomplyonline.it`
   - **Redirect URLs**: aggiungi `https://aicomplyonline.it/auth/callback` e `https://aicomplyonline.it/account/password`
4. (Consigliato) **Authentication → Providers → Email**: abilita "Confirm email".

## 3. Setup Stripe

1. Crea **Products** e **Prices** (4 prices, vedi tabella sopra).
2. **Settings → Customer Portal**: abilita aggiornamento metodo pagamento, fatture, cancellazione.
3. Configura il **branding** (logo, colori).

## 4. Webhook Stripe

1. Stripe Dashboard → **Developers → Webhooks → Add endpoint**.
2. URL: `https://aicomplyonline.it/api/stripe/webhook`
3. Eventi: `checkout.session.completed`, `customer.subscription.created/updated/deleted`, `invoice.payment_failed`
4. Copia il `Signing secret` → impostalo come `STRIPE_WEBHOOK_SECRET` su Vercel.

## 5. Test post-deploy

1. **Landing**: `https://aicomplyonline.it` carica
2. **Quiz**: `/quiz` → 17 domande → report
3. **Signup**: registrati → conferma email → onboarding (azienda)
4. **Dashboard**: vai su `/dashboard`
5. **Registro IA**: aggiungi un sistema AI con il wizard
6. **Documenti**: genera l'Informativa Art. 11 ai dipendenti
7. **Formazione**: registra una sessione
8. **Stripe**: testa il checkout dal piano Pro

## Architettura

```
Frontend / API   →  Next.js 15 (App Router) su Vercel
Auth             →  Supabase Auth (email + password)
Database         →  Supabase Postgres con RLS multi-tenant
Pagamenti        →  Stripe Checkout + Customer Portal
Quiz lead magnet →  /quiz (pubblico, salva su DB + localStorage)
Documenti        →  4 templates AI Act audit-ready
```

## Sviluppo locale

```bash
npm install
cp .env.example .env.local
# compila .env.local con le tue chiavi
npm run dev
```
