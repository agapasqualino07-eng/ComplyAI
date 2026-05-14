# Procedura interna — Gestione Data Breach

> Documento operativo ai sensi degli artt. 33 e 34 GDPR.
> **NON pubblicare**. Da conservare e seguire alla lettera in caso di evento.
>
> Versione: 1.0 — Aggiornato: 2026-05-11.

---

## Definizioni

**Data Breach (violazione di dati personali)**: violazione di sicurezza che comporta accidentalmente o in modo illecito la **distruzione, perdita, modifica, divulgazione non autorizzata o accesso** a dati personali trasmessi, conservati o trattati.

Esempi nel contesto AIComplyOnline:
- Accesso non autorizzato al database Supabase
- Compromissione di credenziali admin
- Esposizione accidentale di dati via bug (es. user A vede dati di user B)
- Furto di backup
- Ransomware
- Smarrimento di un device aziendale con dati clienti
- Bug RLS che bypassa l'isolamento multi-tenant

---

## ⏱️ Tempistiche legali

| Fase | Deadline | Riferimento |
|---|---|---|
| Notifica al Garante | **Entro 72 ore** dalla scoperta | Art. 33 GDPR |
| Comunicazione agli interessati | **Senza ingiustificato ritardo** se alto rischio | Art. 34 GDPR |
| Documentazione interna | Sempre, anche per breach non notificabili | Art. 33.5 |

---

## Procedura step-by-step

### Step 1 — Rilevazione (T+0)

Il breach può essere rilevato da:
- Alert automatico (Sentry, log monitoring, IDS Supabase)
- Segnalazione di un utente / dipendente
- Comunicazione da un sub-processor (Supabase / Stripe / Vercel)
- Audit interno

**Chi rileva → contatta IMMEDIATAMENTE**: `privacy@aicomplyonline.it` + Telegram/Slack al team.

### Step 2 — Triage e contenimento (entro T+4 ore)

**Responsabile**: founder o tech lead in turno.

Azioni:
1. **Confermare l'evento**: è davvero un breach o un falso positivo?
2. **Contenere il danno**: revocare credenziali compromesse, rimuovere accessi, ruotare API key, deploy hotfix se necessario.
3. **Preservare le prove**: salvare log, screenshot, output, **NON cancellare nulla** che possa servire all'indagine.

### Step 3 — Valutazione del rischio (entro T+24 ore)

Compilare il **Modulo di valutazione interna** (vedi Allegato A).

Domande chiave:
- Quanti interessati coinvolti?
- Quali categorie di dati (anagrafici, accesso, fiscali, particolari)?
- Probabilità di pregiudizio: pubblicità, danno economico, discriminazione, furto identità?

**Soglia di notifica**:
- ❌ **NO notifica** se è "improbabile che presenti un rischio per i diritti e le libertà"
- ✅ **SÌ notifica al Garante** se c'è rischio
- ✅ **SÌ comunicazione agli interessati** se ALTO rischio (es. password in chiaro pubblicate)

In dubbio → **notifica**. È meglio una notifica in più che una in meno.

### Step 4 — Notifica al Garante (entro T+72 ore)

Procedura ufficiale: https://servizi.gpdp.it/databreach/s/

Dati da fornire:
- Natura della violazione (categorie, numero interessati, categorie dati)
- Punto di contatto interno
- Conseguenze probabili
- Misure adottate o proposte

Se non si rispetta il termine di 72 ore, va giustificato il ritardo.

### Step 5 — Comunicazione agli interessati (se ALTO rischio)

Quando notificare anche gli interessati:
- Compromissione password (anche se hashed, se debole)
- Esposizione di dati identificativi + finanziari
- Esposizione di dati particolari (art. 9 GDPR)
- Esposizione di dati di minori

**Modalità**: email diretta (no banner sul sito). Linguaggio chiaro, no legalese.

**Template** in Allegato B.

### Step 6 — Documentazione (sempre, anche per breach non notificati)

Compilare il **Registro interno violazioni** (vedi `legal/registro-violazioni.md` — da creare alla prima occorrenza).

Dato che il Garante ha 5 anni di tempo per controllare, conservare tutto per **almeno 5 anni**.

### Step 7 — Lesson learned e remediation (entro T+30 giorni)

Post-mortem:
- Root cause
- Misure tecniche aggiuntive da implementare
- Procedure da modificare
- Eventuale formazione del team

---

## Allegato A — Modulo valutazione interna

```
INCIDENT ID: DB-YYYY-NNN
DATA RILEVAZIONE: ____________________
ORA RILEVAZIONE: ____________________
RILEVATO DA: ____________________

DESCRIZIONE DELL'EVENTO:
____________________________________________
____________________________________________

CATEGORIE DI DATI COINVOLTI:
[ ] Anagrafici (nome, email, telefono)
[ ] Credenziali (password, token)
[ ] Dati di pagamento
[ ] Contenuti caricati dai clienti
[ ] Log applicativi
[ ] Altro: ______________

NUMERO INTERESSATI: ____________________
CATEGORIE: ____________________

CAUSA PRESUNTA:
[ ] Attacco esterno (intrusione)
[ ] Errore umano
[ ] Bug software
[ ] Smarrimento/furto device
[ ] Errore configurazione
[ ] Sub-processor
[ ] Altro: ______________

RISCHIO PER GLI INTERESSATI:
[ ] Trascurabile
[ ] Medio
[ ] Alto
Motivazione: ____________________

NOTIFICA AL GARANTE:
[ ] No (motivare): ____________________
[ ] Sì, entro: ____/____/____ ore: ____

COMUNICAZIONE INTERESSATI:
[ ] No (motivare): ____________________
[ ] Sì, entro: ____/____/____

MISURE DI CONTENIMENTO ADOTTATE:
____________________________________________

MISURE FUTURE PROPOSTE:
____________________________________________

RESPONSABILE PROCEDURA: ____________________
DATA CHIUSURA INCIDENTE: ____________________
```

---

## Allegato B — Template comunicazione agli interessati

```
Oggetto: Comunicazione importante sulla sicurezza dei tuoi dati su AIComplyOnline

Ciao [NOME],

ti scriviamo per informarti tempestivamente di un incidente di sicurezza che
potrebbe aver coinvolto i tuoi dati personali su AIComplyOnline.

COSA È SUCCESSO
Il giorno [DATA] abbiamo rilevato [DESCRIZIONE BREVE NON TECNICA].

QUALI DATI SONO STATI COINVOLTI
[ELENCO PRECISO]

COSA NON È SUCCESSO
[Chiarire per rassicurare: es. "le password non sono state esposte" o "i
dati di pagamento sono gestiti da Stripe e non sono interessati"]

COSA STIAMO FACENDO
- [Misura 1: es. abbiamo isolato il sistema compromesso]
- [Misura 2: es. abbiamo ruotato tutte le chiavi]
- [Misura 3: es. abbiamo notificato il Garante]

COSA TI CONSIGLIAMO DI FARE
- [Es. Cambia la password al prossimo login]
- [Es. Verifica gli accessi recenti dal tuo profilo]

I TUOI DIRITTI
Hai diritto a ulteriori informazioni e ad esercitare i diritti GDPR
contattandoci a privacy@aicomplyonline.it.

Siamo dispiaciuti per l'accaduto. La sicurezza dei tuoi dati è la nostra
massima priorità.

Il team AIComplyOnline
```

---

## Contatti d'emergenza

- **Privacy lead**: privacy@aicomplyonline.it
- **Tech lead**: *(da inserire)*
- **Avvocato di riferimento**: *(da inserire)*
- **Portale Garante (notifica)**: https://servizi.gpdp.it/databreach/s/

## Aggiornamenti

| Data | Versione | Modifiche |
|---|---|---|
| 2026-05-11 | 1.0 | Stesura iniziale |
