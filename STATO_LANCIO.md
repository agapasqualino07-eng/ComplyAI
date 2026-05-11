# Stato di lancio — AIComply

> Documento di sintesi su **cosa è stato fatto** in questa sessione e **cosa resta** prima del lancio pubblico.
> Aggiornato: 2026-05-11. Branch di riferimento: `claude/build-saas-platform-a8Bi7`.

---

## ✅ Fatto (in questa sessione)

### Fix critici di runtime

- **GRANT mancanti su Supabase** → migration `0005_indexes_and_audit.sql` (+ `0004_grants.sql` già presente) concedono i permessi a `authenticated`/`anon` su tutto lo schema `public`. Risolve l'errore `permission denied for table organizations`.
- **Creazione azienda bloccata da RLS** → `src/app/api/orgs/route.ts` ora valida l'utente con `getUser()` e fa l'insert con l'admin client (pattern già usato in altre API). Risolve `new row violates row-level security policy`.

### Sicurezza e configurazione

- `next.config.mjs`: aggiunti header `Content-Security-Policy`, `X-Frame-Options: DENY`, `Permissions-Policy` con whitelist Stripe.
- `src/app/api/health/route.ts`: endpoint di health-check `GET /api/health` (verifica connessione DB + ritorna SHA commit).

### Branding e SEO

- `src/app/icon.svg` + `src/app/apple-icon.svg`: favicon e apple-touch-icon (gradient viola con check, generato inline).
- `src/app/opengraph-image.tsx`: immagine OG dinamica 1200×630 generata con `next/og` (gradient + claim).
- `public/manifest.webmanifest`: manifest PWA-ready.
- `src/app/layout.tsx`: aggiunti `twitter` card, `manifest` link, integrato cookie banner.
- `src/app/sitemap.ts`: aggiunta rotta `/legal/dpa`.

### Legale

- `src/app/(marketing)/legal/[doc]/page.tsx`: privacy policy, terms, cookie policy **riscritte** in versione conforme (sub-processor con DPA, CCT trasferimenti extra-UE, periodi di retention, diritti GDPR puntuali, fori competenti, SLA 99.5%, diritto di recesso 14gg).
- Nuovo documento `/legal/dpa` (Data Processing Agreement art. 28 GDPR) con misure di sicurezza in allegato.
- `src/components/cookie-banner.tsx`: banner informativo dismissibile (solo cookie tecnici → no consent gate, conforme provv. Garante 10/6/2021).
- `src/app/globals.css`: stili `policy-prose` estesi (table, code, em, strong).

### GDPR — diritto all'oblio (art. 17)

- `src/app/api/account/route.ts`: endpoint `DELETE /api/account`. Cancella org di cui l'utente è unico owner + utente da `auth.users` (cascade). Blocca se ci sono subscription attive.
- `src/components/delete-account-button.tsx` + sezione "Zona pericolo" in `src/app/account/page.tsx`.

### Logica di business

- `src/lib/limits.ts`: enforcement server-side dei limiti di piano (organizations, aiSystems, documents, teamMembers). Considera il **trial** come piano Pro.
- API che applicano i limiti (status 402 se eccesso):
  - `POST /api/orgs` → `enforceOrgCreation`
  - `POST /api/ai-systems` → `enforceLimit("aiSystems")`
  - `POST /api/documents` → `enforceLimit("documents")`
- `src/lib/compliance.ts` + chiamata `recomputeScore()` dopo insert su `ai_systems`, `documents`, `training_records`. Lo score in DB resta allineato.
- **Fix slug collision** in `POST /api/documents`: da `Math.random().toString(36).slice(2,7)` a `crypto.randomUUID().slice(0,8)` (40 bit di entropia → no più collisioni pratiche con unique constraint).

### DB

- `supabase/migrations/0005_indexes_and_audit.sql`:
  - Indici composti: `documents(org, type)`, `ai_systems(org, category)`, `training_records(org, completed_at)`, `subscriptions(status)`, `alerts(severity, published_at)`.
  - Funzione `log_audit()` SECURITY DEFINER per scrivere audit log applicativi.

### Anti-abuse

- `src/lib/rate-limit.ts`: rate limiter in-memory minimale.
- `POST /api/quiz` ora protetto a 5 req/min/IP (status 429 con `Retry-After`).

---

## ⚠️ Azioni manuali richieste subito dopo il merge

1. **Eseguire la migration 0005 su Supabase** (SQL editor o `supabase db push`).
2. **Verificare env Vercel**:
   - `SUPABASE_SERVICE_ROLE_KEY` ✅ (già presente)
   - `STRIPE_PRICE_PRO_MONTHLY`, `STRIPE_PRICE_PRO_YEARLY`, `STRIPE_PRICE_ENTERPRISE_MONTHLY`, `STRIPE_PRICE_ENTERPRISE_YEARLY` (senza questi, `/api/stripe/checkout` ritorna 500).
3. **Redeploy** del branch su Vercel.

---

## 🔴 Blocker residui (da chiudere prima del lancio pubblico)

### Funzionalità

- [ ] **Export PDF dei documenti** — oggi solo HTML. Il pitch promette "audit-ready". Suggerito: `@react-pdf/renderer` o `puppeteer-core` su serverless.
- [ ] **Invito membri team** — `src/app/dashboard/[orgId]/settings/team/page.tsx` ha lo stub "Sarà disponibile a breve". Serve endpoint invito via email + tabella `invitations`.
- [ ] **Admin UI alerts normativi** — oggi gli alert sono solo seed nella migration. Servono: tabella di gestione (CRUD) per admin + ruolo admin via `ADMIN_EMAILS` env.
- [ ] **White-label Enterprise** — campi DB esistono (`partners.logo_url`, `brand_color`, ...), nessuna UI per modificarli né rendering condizionato sul branding.

### Tecnico

- [ ] **Rimuovere `typescript.ignoreBuildErrors: true`** da `next.config.mjs`. Per farlo: `npx supabase gen types typescript --linked > src/lib/supabase/types.ts` poi `tsc --noEmit` e fixare gli errori residui (probabilmente nelle pagine che cast-ano risultati Supabase a `any`).
- [ ] **Rimuovere `eslint.ignoreDuringBuilds: true`** dopo aver fixato i warning con `npm run lint`.
- [ ] **Error tracking**: integrare Sentry (`@sentry/nextjs`). Aggiungere `SENTRY_DSN` su Vercel.
- [ ] **Analytics**: scegliere fra Vercel Analytics (gratis), Plausible (€) o GA4. Aggiornare la cookie policy di conseguenza (Plausible è cookieless).

### Legale (verifica con avvocato)

- [ ] **Far revisionare i documenti legali da un legale italiano** prima della pubblicazione. I testi attuali sono compliant nella forma ma vanno validati per il caso specifico (sede CT, P.IVA reale, eventuali DPO, lista cookie definitiva).
- [ ] **Pubblicare un indirizzo PEC** per le comunicazioni legali.

### Stripe

- [ ] **Webhook `customer.subscription.trial_will_end`** → email all'utente 3 giorni prima della fine trial.
- [ ] **Test end-to-end checkout** in modalità Stripe live (oggi solo verificato il flusso di codice).

---

## 🟡 Importante (entro 1-2 mesi dal lancio)

- [ ] **OAuth Google/Microsoft** sul login (atteso da target B2B).
- [ ] **Password policy lato server** (non solo `minLength=8` client). Suggerimento: usare Supabase Auth → Authentication → Policies.
- [ ] **MFA/2FA** opzionale per Pro+.
- [ ] **Audit logs effettivamente popolati**: la funzione SQL `log_audit()` esiste — vanno aggiunte chiamate dopo le mutations sensibili (cambio piano, eliminazione, cambio ruolo team).
- [ ] **Rate limiter distribuito**: l'in-memory di `rate-limit.ts` non sopravvive a istanze multiple/cold start. Migrare a Upstash Redis (`@upstash/ratelimit`).
- [ ] **Backup test recovery**: documentare la procedura di restore Supabase e fare un test reale.
- [ ] **CSP più stretta**: la policy attuale ha `'unsafe-inline'` su style/script per pragmatismo Next.js — restringere con nonce SSR.

---

## 🟢 Nice to have (post-lancio)

- [ ] Test E2E (Playwright) per i flussi onboarding + creazione documento + upgrade Pro.
- [ ] CI GitHub Actions: lint + tsc + test su PR.
- [ ] Moduli training **interattivi** (oggi solo registrazione ore manuale).
- [ ] **Logout su tutti i device** (Supabase Auth `signOut({ scope: 'global' })`).
- [ ] **Export dati utente** (portabilità GDPR art. 20) in JSON/CSV scaricabile da `/account`.
- [ ] **Newsletter normativa**: integrazione con Mailchimp/Brevo per il feed alerts.
- [ ] **API pubbliche** (chiave per integrazioni terze, già nei limits del piano).
- [ ] **Status page** pubblica (BetterStack o Instatus, free tier).

---

## Riepilogo per priorità

| Area | Blocker | Importanti | Nice-to-have |
|---|:---:|:---:|:---:|
| Configurazione | 4 | 3 | 1 |
| Funzionalità prodotto | 4 | 4 | 4 |
| Legale | 2 | 0 | 0 |
| Stripe | 2 | 0 | 0 |
| Sicurezza | 0 | 4 | 0 |

**Verdetto operativo**: con i fix di questa sessione + i ~10 blocker residui chiusi, il sito è in stato **launch-ready per beta privata** entro 2-3 giorni di lavoro. Per il lancio pubblico (marketing, traffico organico) bisogna chiudere anche la revisione legale dei documenti.

---

## Come continuare

```bash
# 1. Pull delle modifiche
git checkout claude/build-saas-platform-a8Bi7
git pull

# 2. Applicare la migration su Supabase
# Opzione A: Dashboard → SQL Editor → incollare supabase/migrations/0005_indexes_and_audit.sql
# Opzione B (se hai supabase CLI configurato):
supabase db push

# 3. Verificare TypeScript (al momento ignorato in build)
npm install
npx tsc --noEmit   # vedere quali errori vanno chiusi prima di togliere ignoreBuildErrors

# 4. Test locale del cookie banner, del delete account, dei limiti piano
npm run dev
```
