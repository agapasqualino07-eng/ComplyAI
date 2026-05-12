# AIComplyOnline

> La piattaforma italiana per la compliance **AI Act** (Reg. UE 2024/1689) + **Legge 132/2025**. Per PMI e studi commercialisti/legali.

**Sito**: https://aicomplyonline.it

## Stack

- **Frontend & API**: Next.js 15 (App Router) + TypeScript + Tailwind CSS
- **Auth**: Supabase Auth (password + magic link)
- **DB**: Supabase Postgres con RLS multi-tenant
- **Pagamenti**: Stripe (Checkout + Customer Portal + webhooks)
- **Hosting**: Vercel

## Funzionalità

- 🧠 **Quiz gratuito** di compliance AI Act (17 domande, lead magnet)
- 🤖 **Registro sistemi AI** + classificatore di rischio guidato (5 step)
- 📚 **Vendor Intelligence**: 10+ vendor pre-configurati (ChatGPT, Copilot, Gemini, Claude, Midjourney, ElevenLabs, ...)
- 📄 **4 documenti audit-ready**: Policy interna, Informativa AI ai dipendenti (Art. 11 L.132/2025), Disclosure clienti (Art. 50 AI Act), Registro formale
- 🎓 **Formazione AI literacy**: 4 moduli pronti + tracking ore
- 🔔 **Alert normativi** automatici (AI Act + L.132/2025)
- 🏢 **Multi-azienda** (Enterprise) per studi commercialisti/legali con white-label e audit trail
- 💳 **Stripe**: 2 piani (Pro 29€/mese, Enterprise 199€/mese)

## Pricing

| Piano | Prezzo | Per chi |
|---|---|---|
| **Free** | 0€ | Quiz di compliance + report |
| **Pro** | 29 €/mese | Singola PMI: registro IA, documenti, formazione |
| **Enterprise** | 199 €/mese | Studi: fino a 10 clienti, white-label, audit trail |

## Setup

Vedi [`SETUP.md`](./SETUP.md) per la guida completa al deploy.

## Struttura

```
src/
  app/
    (auth)/         # login, signup, reset password
    (marketing)/    # landing, quiz, pricing, legal
    dashboard/      # area autenticata multi-tenant
    api/            # route handlers (Stripe, quiz, AI systems, documents, training)
  components/
    ui/             # primitive (Button, Card, Input...)
    dashboard/      # sidebar, topbar, switcher
  lib/
    aiact/          # classifier, vendor catalog, quiz, training modules
    supabase/       # client/server/middleware
    policy/         # template documenti (4 tipi AI Act)
    plans.ts        # definizione piani Free/Pro/Enterprise
supabase/
  migrations/       # 3 migration SQL (base + ai_act + pivot)
```

## Branch di sviluppo

Tutto il lavoro avviene su `claude/build-saas-platform-a8Bi7`.

## Licenza

Proprietario, AIComplyOnline.
