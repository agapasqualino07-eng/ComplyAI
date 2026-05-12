# Stato di lancio — AIComply

> **Cosa è fatto, cosa manca, come continuare.**
> Aggiornato: 2026-05-11. Branch: `claude/build-saas-platform-a8Bi7`.

---

## ✅ Tutto ciò che è stato fatto in queste sessioni

### Sicurezza & infrastruttura

- ✅ Permessi Postgres (GRANT) per ruoli `authenticated`/`anon` su `public` (migration `0004_grants.sql`).
- ✅ Header HTTP di sicurezza completi: `Content-Security-Policy`, `X-Frame-Options: DENY`, `Permissions-Policy`, `Strict-Transport-Security`, `Referrer-Policy`, `X-Content-Type-Options`.
- ✅ Endpoint `GET /api/health` con DB ping (per uptime monitor esterni).
- ✅ Rate limiter in-memory (`src/lib/rate-limit.ts`) applicato a `/api/quiz` (5 req/min/IP).

### Branding & SEO

- ✅ Favicon SVG + apple-touch-icon + manifest PWA.
- ✅ Immagine OpenGraph dinamica 1200×630 (`src/app/opengraph-image.tsx`).
- ✅ Twitter card, manifest, sitemap aggiornato.

### Legale (conforme GDPR/AI Act)

- ✅ Privacy policy con sub-processor (Supabase/Vercel/Stripe), CCT extra-UE, retention, base giuridica, contatti.
- ✅ Terms con SLA 99.5%, recesso 14gg consumatori, foro, IP, responsabilità.
- ✅ Cookie policy con elenco cookie tecnici tabellato.
- ✅ Data Processing Agreement (`/legal/dpa`) art. 28 GDPR con misure di sicurezza in allegato.
- ✅ Cookie banner informativo (no consent gate — solo cookie tecnici).

### GDPR per gli utenti

- ✅ **Diritto all'oblio** (art. 17): `DELETE /api/account` + UI "Zona pericolo".
- ✅ **Diritto alla portabilità** (art. 20): `GET /api/account/export` → scarica JSON con tutti i dati (profilo, org, sistemi AI, documenti, formazione, log).
- ✅ **Logout multi-device** (art. 32 sicurezza): `POST /api/account/sessions` invalida tutti i refresh token.

### Business logic & UX

- ✅ Enforcement server-side limiti piano (organizations, aiSystems, documents, teamMembers); trial = limiti Pro.
- ✅ Score di compliance ricalcolato server-side dopo mutations (`recompute_compliance_score`).
- ✅ Slug document collision risolto (`crypto.randomUUID` al posto di `Math.random`).
- ✅ Password policy server-side + indicatore live nella form di signup.
- ✅ Onboarding azienda funzionante end-to-end (admin client per bypass RLS-on-create).
- ✅ Stripe checkout con error handling completo + validazione formati env.

### Team (gestione membri)

- ✅ Migration `0006_team_invitations.sql` (tabella inviti + RPC `accept_invitation`).
- ✅ Endpoint `POST/GET /api/orgs/[orgId]/invitations` per creare/listare inviti.
- ✅ Endpoint `DELETE /api/orgs/[orgId]/invitations/[id]` per revocare.
- ✅ Endpoint `PATCH/DELETE /api/orgs/[orgId]/members/[userId]` per cambio ruolo + rimozione.
- ✅ Endpoint `POST /api/invitations/accept` (chiama RPC SECURITY DEFINER).
- ✅ Pagina `/invite/[token]` per accettare invito (con login redirect e check email).
- ✅ UI `/dashboard/[orgId]/settings/team` completa: form invito, lista membri con cambio ruolo, lista inviti pendenti con revoca.
- ✅ Email magic-link inviata via Supabase Auth (`generateLink` per utenti esistenti, `inviteUserByEmail` per nuovi).

### Admin area (gestione alerts normativi)

- ✅ Layout `/admin/*` con guard via `ADMIN_EMAILS` env.
- ✅ Pagina `/admin/alerts` con CRUD: form creazione + lista con cancellazione.
- ✅ API `POST /api/admin/alerts` + `DELETE /api/admin/alerts/[id]`.

### Stripe webhooks (completati)

- ✅ Handler per: `checkout.session.completed`, `customer.subscription.created/updated/deleted`, `invoice.payment_failed`, `customer.subscription.trial_will_end`, `customer.deleted`.
- ✅ Audit log automatico su `trial_will_end` (predisposto per invio email futuro).

### Audit trail

- ✅ Helper `lib/audit.ts` + funzione SQL `log_audit()` SECURITY DEFINER.
- ✅ Audit log wired in API critiche: `ai-systems`, `documents`, `training`, webhook Stripe.
- ✅ Indici DB (`0005_indexes_and_audit.sql`) su tutte le query frequenti.

### CI/CD

- ✅ GitHub Actions workflow `.github/workflows/ci.yml` (lint + typecheck + build) su PR/push main.

### Compliance GDPR (documenti + automazione)

- ✅ **Registro trattamenti** (`legal/registro-trattamenti.md`) — art. 30 GDPR.
- ✅ **Procedura Data Breach** (`legal/procedura-data-breach.md`) — artt. 33-34 + template notifica Garante.
- ✅ **DPIA volontaria** (`legal/dpia.md`) — art. 35.
- ✅ **Pagina pubblica `/legal/sub-processori`** con elenco DPA Supabase/Vercel/Stripe.
- ✅ **Pagina pubblica `/legal/sicurezza`** (Trust Center).
- ✅ **security.txt** RFC 9116 per responsible disclosure.
- ✅ **Cron retention notturno** (Vercel Cron 3:00 + funzione SQL `purge_expired_data`):
  - audit_logs: cancellati oltre 90 giorni
  - quiz_completions: email anonimizzate oltre 24 mesi
  - org_invitations: cancellati oltre 30 giorni dalla scadenza

---

## ⚠️ Azioni manuali OBBLIGATORIE prima del prossimo redeploy

> **Queste sono le uniche cose che DEVI FARE TU**. Tutto il resto è già committato e pushato.

### 1. Eseguire le 4 migration su Supabase

Apri Supabase Dashboard → SQL Editor → **incolla ed esegui in ordine**:

1. `supabase/migrations/0004_grants.sql` (se non già eseguita)
2. `supabase/migrations/0005_indexes_and_audit.sql`
3. `supabase/migrations/0006_team_invitations.sql`
4. `supabase/migrations/0007_retention.sql` (purge automatico GDPR)

Verifica con:
```sql
select proname from pg_proc
 where proname in ('accept_invitation','log_audit','purge_expired_data','recompute_compliance_score');
-- Devi vedere 4 righe.
```

### 2. Aggiungere `ADMIN_EMAILS` su Vercel

Per accedere a `/admin/alerts`:

- Vercel → Settings → Environment Variables → **Add**
- Name: `ADMIN_EMAILS`
- Value: `agatinopasqualinoderetto@gmail.com`

### 3. Aggiungere `CRON_SECRET` su Vercel

Per autenticare il cron retention notturno:

- Genera un valore random (es. `openssl rand -hex 32` o un manager di password)
- Vercel → Env Vars → Name: `CRON_SECRET` → Value: il random generato
- Vercel applicherà automaticamente `Authorization: Bearer $CRON_SECRET` al cron

### 4. Verificare env Stripe già presenti

`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, 4×`STRIPE_PRICE_*`.

### 5. Auth URLs su Supabase

Supabase Dashboard → Authentication → URL Configuration:
- **Site URL**: `https://aicomplyonline.it`
- **Redirect URLs**: aggiungi `https://aicomplyonline.it/**`

### 6. Redeploy su Vercel

Settings → Deployments → Redeploy.

### 7. Personalizzare i 3 documenti privacy interni

Apri e completa con i tuoi dati reali:
- `legal/registro-trattamenti.md` — P.IVA, PEC, eventuale provider newsletter
- `legal/procedura-data-breach.md` — contatti tech lead + avvocato di riferimento
- `legal/dpia.md` — eventuali specifiche del tuo caso

**Conservali a parte** (Google Drive / Dropbox / NAS): vanno mostrati al Garante se richiesto.

---

## 🔴 Blocker residui (cose che IO non posso fare, servono account/strumenti esterni)

### Revisione legale (URGENTE prima del lancio pubblico)

- [ ] **Far validare** Privacy/Terms/Cookie/DPA da un legale italiano specializzato in tech. I testi sono compliant nella forma ma vanno adattati al tuo caso reale (sede CT, dati P.IVA reali, eventuale DPO, lista cookie definitiva post-analytics).
- [ ] **Pubblicare una PEC** ufficiale e aggiungerla ai contatti legali.
- [ ] Verificare la presenza di una **polizza assicurativa professionale** (SLA + indennizzi promessi nei Terms).

**Cosa devi fare**: prenotare consulenza con un avvocato (~€300-800 una tantum).

### Export PDF dei documenti

- [ ] Convertire l'export `/api/documents/[id]/export?format=html` a PDF.
- Tecnologie possibili:
  - **`@react-pdf/renderer`** (richiede installare pacchetto, riscrivere template come componenti React PDF)
  - **`puppeteer-core` + `@sparticuz/chromium`** (rendering headless del HTML esistente — più semplice, ma serve verifica del bundle size su Vercel serverless)

**Cosa devo fare io**: posso implementare con `@react-pdf/renderer` ma serve `npm install` + test in deploy. Dimmi se vuoi che proceda.

### Error tracking (Sentry)

- [ ] Aggiungere `@sentry/nextjs` per intercettare errori in produzione.
- **Cosa devi fare tu**: creare account su https://sentry.io (gratis fino a 5k errori/mese), creare progetto "Next.js", copiare il DSN.
- **Cosa devo fare io**: ti faccio l'integrazione una volta che hai il DSN da incollare in env `SENTRY_DSN`.

### Analytics

- [ ] Scegliere tool e integrarlo:
  - **Vercel Analytics** (gratis, già nella dashboard Vercel — basta `npm i @vercel/analytics` e una riga in layout.tsx).
  - **Plausible** (€9/mese, cookieless, EU-hosted — perfetto per il tuo posizionamento privacy).
- **Cosa devi fare tu**: scegliere quale (consiglio Plausible per coerenza con il pitch).
- **Cosa devo fare io**: l'integrazione (5 min con qualsiasi dei due).

### OAuth Google / Microsoft

- [ ] Abilitare provider su Supabase.
- **Cosa devi fare tu**:
  1. Supabase Dashboard → Authentication → Providers → Google → abilita
  2. Crea OAuth client su https://console.cloud.google.com (gratis) e copia client ID + secret in Supabase
  3. Stesso flusso per Microsoft Azure AD se vuoi anche quello
- **Cosa devo fare io**: aggiungere i pulsanti sulla login page una volta abilitato in Supabase.

### Togliere `ignoreBuildErrors` da `next.config.mjs`

- [ ] Generare i tipi DB reali e fixare gli errori di tipo:
  ```bash
  npx supabase login
  npx supabase link --project-ref <tuo-project-ref>
  npx supabase gen types typescript --linked > src/lib/supabase/types.ts
  npm run typecheck   # vedi gli errori residui
  ```
- **Cosa devi fare tu**: il primo `supabase login + link` (richiede il project ref dal dashboard Supabase).
- **Cosa devo fare io**: una volta rigenerati i tipi, posso fixare gli errori `any` rimasti.

### White-label Enterprise

- [ ] UI per i partner Enterprise per personalizzare logo, colori, footer (campi DB esistono in `partners`).
- **Stima**: 4-6 ore di lavoro. Importante solo se hai effettivamente vendita Enterprise in pipeline.

### Test end-to-end checkout in modalità live

- [ ] Quando passi a `sk_live_...`, ripeti l'intero flusso: signup → onboarding → checkout con carta vera.
- **Cosa devi fare tu**: tu o un tester reale (servono €29).

---

## 🟡 Importante (post-lancio, entro 1-2 mesi)

- [ ] **MFA/2FA**: Supabase Auth supporta TOTP. Da abilitare nel dashboard + aggiungere UI di setup in `/account/security`.
- [ ] **Rate limiter distribuito** (Upstash Redis): l'attuale in-memory non sopravvive a istanze multiple. Account Upstash gratuito fino a 10k req/giorno.
- [ ] **Backup recovery test**: documentare e testare il restore Supabase.
- [ ] **CSP più stretta**: rimuovere `'unsafe-inline'` su script usando nonce SSR.
- [ ] **PDF export firmati digitalmente** (P7M) per i documenti AI Act audit-ready — feature premium.
- [ ] **i18n inglese** se vuoi target B2B internazionale.

---

## 🟢 Nice to have

- [ ] **Test E2E** Playwright per i flussi critici (onboarding, checkout, invito team).
- [ ] **Moduli training interattivi** in-app (oggi solo registrazione ore manuale).
- [ ] **Newsletter normativa**: integrazione con Brevo/Mailchimp.
- [ ] **API pubbliche** per clienti Pro+ (richiede pannello gestione chiavi).
- [ ] **Status page** pubblica (BetterStack free tier).

---

## File toccati in questa sessione (riepilogo per code review)

### Migration SQL
- `supabase/migrations/0006_team_invitations.sql` (nuova)

### API routes nuove
- `src/app/api/orgs/[orgId]/invitations/route.ts`
- `src/app/api/orgs/[orgId]/invitations/[id]/route.ts`
- `src/app/api/orgs/[orgId]/members/[userId]/route.ts`
- `src/app/api/invitations/accept/route.ts`
- `src/app/api/admin/alerts/route.ts`
- `src/app/api/admin/alerts/[id]/route.ts`
- `src/app/api/account/sessions/route.ts`
- `src/app/api/account/export/route.ts`

### Pagine UI nuove
- `src/app/invite/[token]/page.tsx` + `accept-button.tsx`
- `src/app/admin/layout.tsx`
- `src/app/admin/alerts/page.tsx` + `alert-actions.tsx`

### Componenti nuovi
- `src/components/team/invite-form.tsx`
- `src/components/team/member-actions.tsx`
- `src/components/account-actions.tsx`

### Lib nuove
- `src/lib/password.ts`
- `src/lib/audit.ts`

### File modificati
- `src/app/dashboard/[orgId]/settings/team/page.tsx` (riscritta completa)
- `src/app/account/page.tsx` (aggiunti export GDPR + logout globale)
- `src/app/(auth)/signup/signup-form.tsx` (validazione password client)
- `src/app/api/stripe/webhook/route.ts` (trial_will_end + customer.deleted)
- `src/app/api/ai-systems/route.ts` (audit log)
- `src/app/api/documents/route.ts` (audit log)
- `src/app/api/training/route.ts` (audit log)

### Workflow CI
- `.github/workflows/ci.yml` (nuovo)

---

## TL;DR — Cosa devi fare TU adesso

1. **Esegui le migration 0004/0005/0006** su Supabase (SQL Editor).
2. **Aggiungi `ADMIN_EMAILS`** su Vercel.
3. **Verifica Site URL e Redirect URLs** su Supabase Auth.
4. **Redeploy** su Vercel.
5. Per i blocker rimasti che richiedono servizi esterni: scegli quali attivare (Sentry, Plausible, OAuth Google) e dimmelo, te li integro.

Tutto il resto è già nel codice. Buon lancio.
