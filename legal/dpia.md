# Data Protection Impact Assessment (DPIA) — AIComplyOnline

> Documento ai sensi dell'art. 35 GDPR.
> **Non obbligatoria** per AIComplyOnline (il trattamento non rientra fra quelli ad alto rischio sistematico), ma redatta volontariamente per dimostrare accountability e per uso commerciale (sales material verso clienti Enterprise).
>
> Versione: 1.0 — Aggiornato: 2026-05-11.
> **Da revisionare con un legale prima della pubblicazione esterna.**

---

## 1. Descrizione sistematica del trattamento

### 1.1 Natura del trattamento
AIComplyOnline è una piattaforma SaaS che assiste le aziende italiane nell'adeguamento al Reg. UE 2024/1689 (AI Act) e alla L. 132/2025. Il trattamento riguarda:
- Dati di account dei nostri utenti (B2B)
- Contenuti caricati dai nostri clienti su loro responsabilità (dati di terzi)

### 1.2 Finalità
- Erogazione delle funzionalità di compliance
- Generazione di documenti standard
- Tracciamento ore formazione AI literacy
- Notifica di alert normativi

### 1.3 Interessi del titolare
- Esecuzione del contratto SaaS
- Miglioramento del servizio
- Sicurezza dei sistemi
- Adempimenti fiscali

### 1.4 Categorie di dati e interessati
Vedi `legal/registro-trattamenti.md`.

---

## 2. Valutazione della necessità e proporzionalità

| Requisito | Soddisfatto? | Note |
|---|---|---|
| Liceità (art. 6) | ✅ | Contratto + obbligo legale + legittimo interesse + consenso (newsletter) |
| Limitazione finalità | ✅ | Ogni trattamento ha finalità definita e documentata |
| Minimizzazione dei dati | ✅ | Form raccolgono solo campi necessari; nessuna profilazione |
| Esattezza | ✅ | Utente può modificare i propri dati dal proprio profilo |
| Limitazione conservazione | ✅ | Retention definita per ogni trattamento + cron purge per i log |
| Integrità e riservatezza | ✅ | TLS, AES-256, RLS, RBAC, audit log |
| Responsabilizzazione | ✅ | Registro trattamenti, procedura breach, audit |

---

## 3. Rischi per gli interessati e misure di mitigazione

### Rischio 1 — Accesso non autorizzato ai dati di un'azienda cliente

| Aspetto | Valutazione |
|---|---|
| Origine | Bug RLS, credenziali compromesse, attacco supply chain |
| Severità | Alta (dati aziendali sensibili) |
| Probabilità | Bassa |
| Rischio inerente | Medio |
| **Misure di mitigazione** | RLS Postgres su ogni tabella, isolation multi-tenant, audit log, MFA, password policy, rate limiting, security headers, CSP |
| Rischio residuo | Basso |

### Rischio 2 — Esposizione di dati durante l'export PDF/JSON

| Aspetto | Valutazione |
|---|---|
| Origine | Bug nel rendering, link pubblici accidentali |
| Severità | Media |
| Probabilità | Bassa |
| **Misure di mitigazione** | Slug random con `crypto.randomUUID`, no documenti pubblici di default (`published_at` null), download autenticato, expiring URLs (raccomandato) |
| Rischio residuo | Basso |

### Rischio 3 — Compromissione di Supabase (sub-processor)

| Aspetto | Valutazione |
|---|---|
| Origine | Attacco al provider |
| Severità | Alta |
| Probabilità | Molto bassa (Supabase è SOC 2 Type II) |
| **Misure di mitigazione** | DPA con Supabase, backup cifrati su provider diverso (in roadmap), notifica al Garante entro 72h |
| Rischio residuo | Basso |

### Rischio 4 — Retention oltre i termini dichiarati

| Aspetto | Valutazione |
|---|---|
| Origine | Mancata cancellazione automatica |
| Severità | Media (sanzioni GDPR) |
| Probabilità | Bassa |
| **Misure di mitigazione** | Cron automatico `purge_old_logs` (90gg), endpoint `/api/account` per delete immediato, audit log delle cancellazioni |
| Rischio residuo | Basso |

### Rischio 5 — Uso improprio dei documenti generati

| Aspetto | Valutazione |
|---|---|
| Origine | Cliente che usa documenti senza adeguamento al proprio caso |
| Severità | Reputazionale (AIComplyOnline venduta come compliance) |
| Probabilità | Media |
| **Misure di mitigazione** | Disclaimer nei documenti generati ("modello standard, da personalizzare"), nei Terms ("non costituisce consulenza legale") |
| Rischio residuo | Medio-basso |

### Rischio 6 — Trasferimento dati extra-UE (Stripe, Vercel)

| Aspetto | Valutazione |
|---|---|
| Origine | Sub-processor con entità USA |
| Severità | Media |
| Probabilità | Bassa |
| **Misure di mitigazione** | CCT firmate, EU-US Data Privacy Framework, configurazione regioni EU dove possibile |
| Rischio residuo | Basso |

---

## 4. Consultazione preventiva (art. 36 GDPR)

**Non necessaria**: i rischi residui sono valutati come bassi/medio-bassi. In caso di emergere di rischio elevato non mitigabile, sarà avviata consultazione con il Garante.

---

## 5. Misure organizzative

- **Privacy by Design**: ogni nuova feature passa per una review privacy prima del rilascio.
- **Privacy by Default**: documenti non pubblicati, log limitati, MFA promosso.
- **Formazione del team**: il team interno segue lo stesso quiz/training di AI literacy disponibile sulla piattaforma.
- **DPO**: non nominato (sotto soglia art. 37). Coordinamento privacy gestito dal founder/CEO.
- **Privacy Champion**: ogni feature ha un owner responsabile della componente privacy.

---

## 6. Conclusioni

Il trattamento svolto da AIComplyOnline è **proporzionato** alle finalità, **lecito** in tutte le sue componenti, **adeguatamente protetto** dalle misure tecniche e organizzative descritte. Il rischio residuo per gli interessati è valutato come **basso** e non richiede consultazione preventiva del Garante.

La DPIA viene revisionata:
- Almeno annualmente
- A ogni cambiamento sostanziale del trattamento (nuova feature, nuovo sub-processor, nuova categoria di dati)
- A seguito di incident di sicurezza

---

## Aggiornamenti

| Data | Versione | Modifiche |
|---|---|---|
| 2026-05-11 | 1.0 | Stesura iniziale (volontaria) |
