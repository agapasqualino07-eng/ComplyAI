# ComplyAI

> Compliance GDPR + AI Act automatica: banner cookie, generatori documenti, registri GDPR, registro sistemi AI con classificatore di rischio AI Act — tutto in un SaaS.

**Sito**: https://aicomplyonline.it

## Stack

- **Frontend & API**: Next.js 15 (App Router) + TypeScript + Tailwind CSS
- **Auth**: Supabase Auth (password + magic link)
- **DB**: Supabase Postgres con RLS multi-tenant
- **Pagamenti**: Stripe (Checkout + Customer Portal + webhooks)
- **Hosting**: Vercel
- **CMP banner script**: vanilla JS, servito da `/cmp/v1.js` (edge)

## Funzionalità

- 🍪 Banner cookie configurabile (CMP) + registro consensi automatico
- 📄 Generatori Privacy Policy, Cookie Policy, Termini e Condizioni (italiano)
- 📋 Registro trattamenti GDPR (art. 30)
- 🤖 **AI Act**: registro sistemi AI + classificatore rischio guidato (vietato/alto/limitato/minimo/GPAI) + AI Use Policy interna + AI Disclosure Notice pubblica
- 🌐 Multi-tenant: gestisci più aziende e siti da un singolo account
- 💳 Abbonamenti Stripe con trial 14 giorni e portale self-service

## Setup

Vedi [`SETUP.md`](./SETUP.md) per la guida completa al deploy.

## Struttura del progetto

```
src/
  app/
    (auth)/         # login, signup, reset password
    (marketing)/    # landing, pricing, legal
    dashboard/      # area autenticata multi-tenant
    api/            # route handlers (Stripe, Supabase, CMP)
    cmp/v1.js/      # script CMP servito agli iscritti
    p/[slug]/       # pagine pubbliche delle policy generate
  components/
    ui/             # primitive (Button, Card, Input...)
    dashboard/      # sidebar, topbar, switcher
  lib/
    supabase/       # client/server/middleware
    policy/         # template generatori documenti
    stripe.ts       # client Stripe
    plans.ts        # definizione piani e prezzi
supabase/
  migrations/       # schema SQL iniziale (eseguire su Supabase)
```

## Sviluppo locale

```bash
npm install
cp .env.example .env.local
# completa .env.local con le credenziali (vedi SETUP.md)
npm run dev
```

## Branch di sviluppo

Tutto il lavoro avviene su `claude/build-saas-platform-a8Bi7`.

## Licenza

Proprietario, ComplyAI.
