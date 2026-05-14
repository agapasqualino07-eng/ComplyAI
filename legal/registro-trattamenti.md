# Registro delle attività di trattamento — AIComplyOnline

> Documento interno ai sensi dell'art. 30 GDPR (Reg. UE 2016/679).
> Da conservare e aggiornare. **NON pubblicare**.
>
> Versione: 1.0 — Aggiornato: 2026-05-11.

---

## Titolare del trattamento

| Campo | Valore |
|---|---|
| Ragione sociale | AIComplyOnline S.r.l.s. |
| Sede legale | Via Vitaliano Brancati 10, 95030 Mascalucia (CT), Italia |
| P.IVA | IT123456789 *(da aggiornare con valore reale)* |
| Email | privacy@aicomplyonline.it |
| PEC | *(da impostare e inserire qui)* |
| DPO | Non nominato (non obbligatorio ex art. 37 GDPR) |
| Rappresentante UE | N/A (sede UE) |

---

## Trattamento 1 — Gestione utenti SaaS

| Campo | Valore |
|---|---|
| Finalità | Erogazione del servizio AIComplyOnline, autenticazione, supporto |
| Base giuridica | Esecuzione del contratto (art. 6.1.b GDPR) |
| Categorie di interessati | Utenti registrati (titolari/dipendenti delle aziende clienti) |
| Categorie di dati | Email, nome e cognome, password (hashed bcrypt), preferenze account |
| Categorie particolari (art. 9) | Nessuna |
| Origine | Direttamente dall'interessato (registrazione web) |
| Destinatari | Supabase Inc. (hosting), Vercel Inc. (frontend) |
| Trasferimenti extra-UE | Supabase/Vercel: CCT + EU-US DPF se applicabile |
| Conservazione | Durata del contratto + 10 anni post-cessazione (obblighi fiscali) |
| Misure di sicurezza | TLS 1.2+, password hashed, RLS Postgres, MFA opzionale |

## Trattamento 2 — Gestione abbonamenti e pagamenti

| Campo | Valore |
|---|---|
| Finalità | Gestione subscription Pro/Enterprise, fatturazione |
| Base giuridica | Esecuzione del contratto (1.b) + Obbligo legale fiscale (1.c) |
| Categorie di interessati | Clienti business titolari di abbonamento |
| Categorie di dati | Ragione sociale, P.IVA, indirizzo fatturazione, identificativi Stripe (customer_id, subscription_id), ultime 4 cifre carta (da Stripe, NO PAN intero) |
| Categorie particolari | Nessuna |
| Origine | Interessato (form) + Stripe (response API) |
| Destinatari | Stripe Payments Europe Ltd, commercialista, Agenzia Entrate (SDI) |
| Trasferimenti extra-UE | Stripe: CCT + EU-US DPF |
| Conservazione | 10 anni (obbligo civilistico/fiscale art. 2220 c.c.) |
| Misure di sicurezza | Stripe PCI-DSS Level 1, nessun dato carta in DB AIComplyOnline, webhook con firma HMAC |

## Trattamento 3 — Contenuti AI Act caricati dai clienti

| Campo | Valore |
|---|---|
| Finalità | Erogazione delle funzionalità di compliance (registro AI, documenti, formazione) |
| Base giuridica | AIComplyOnline agisce come **responsabile del trattamento** (art. 28). Vedi DPA. |
| Categorie di interessati | Dipendenti, collaboratori, fornitori dei clienti AIComplyOnline |
| Categorie di dati | Anagrafica formazione, descrizione sistemi AI in uso, ruoli aziendali |
| Categorie particolari | Possibili (dipende dai sistemi AI che il cliente registra) — il cliente è responsabile della liceità del trattamento |
| Origine | Cliente AIComplyOnline (titolare) |
| Destinatari | Supabase (database) |
| Trasferimenti extra-UE | Supabase EU (Francoforte) |
| Conservazione | Durata del contratto del cliente + 30 giorni post-cessazione (per export). Su richiesta del cliente: cancellazione immediata. |
| Misure di sicurezza | RLS multi-tenant, isolamento per org, cifratura, audit log |

## Trattamento 4 — Quiz pubblico (lead generation)

| Campo | Valore |
|---|---|
| Finalità | Erogare il quiz di compliance gratuito; statistiche aggregate per migliorare il servizio |
| Base giuridica | Consenso (per email) + Legittimo interesse (per statistiche, art. 6.1.f) |
| Categorie di interessati | Visitatori del sito che compilano il quiz |
| Categorie di dati | Settore, fascia dipendenti, risposte quiz, email (facoltativa) |
| Categorie particolari | Nessuna |
| Origine | Interessato |
| Destinatari | Supabase |
| Trasferimenti extra-UE | No |
| Conservazione | 24 mesi, poi anonimizzazione |
| Misure di sicurezza | Rate limiting, validazione input |

## Trattamento 5 — Sicurezza e prevenzione frodi (log)

| Campo | Valore |
|---|---|
| Finalità | Monitoraggio accessi, prevenzione brute-force, audit |
| Base giuridica | Legittimo interesse (art. 6.1.f) — sicurezza dei sistemi |
| Categorie di interessati | Utenti del servizio, visitatori |
| Categorie di dati | Indirizzo IP, user-agent, timestamp, endpoint chiamato, esito (200/4xx/5xx) |
| Categorie particolari | Nessuna |
| Conservazione | **90 giorni** (purge automatica via cron) |
| Destinatari | Vercel (web server log), Supabase (audit log applicativo) |
| Misure di sicurezza | Accesso solo via admin role |

## Trattamento 6 — Marketing diretto (newsletter)

| Campo | Valore |
|---|---|
| Finalità | Invio aggiornamenti normativi e novità di prodotto |
| Base giuridica | Consenso (art. 6.1.a) o soft opt-in clienti (D.lgs. 196/2003 art. 130 c.4) |
| Categorie di interessati | Iscritti alla newsletter, clienti registrati |
| Categorie di dati | Email, nome, eventuali preferenze tematiche |
| Conservazione | Fino a revoca / unsubscribe |
| Destinatari | *(provider email da definire: Brevo / Resend / Mailchimp)* |
| Trasferimenti extra-UE | Dipende dal provider scelto |
| Diritto opposizione | Link unsubscribe in ogni email + sezione account |

---

## Aggiornamenti

| Data | Versione | Modifiche |
|---|---|---|
| 2026-05-11 | 1.0 | Stesura iniziale |

## Note operative

- Il registro va aggiornato ogni volta che si introduce un nuovo trattamento (es. nuova feature che raccoglie dati).
- In caso di ispezione del Garante, va esibito entro le tempistiche richieste (art. 30.4).
- Riferimento: [Garante Privacy — Registro delle attività di trattamento](https://www.garanteprivacy.it/regolamentoue/registro-delle-attivita-di-trattamento)
