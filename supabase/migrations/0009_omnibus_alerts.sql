-- ============================================================================
-- ComplyAI — Aggiornamento feed normativo: Omnibus AI Act (7/5/2026)
-- ----------------------------------------------------------------------------
-- La Commissione UE ha rinviato i principali obblighi AI Act:
--   * Sistemi alto rischio Annex III: da 2 ago 2026 → 2 dic 2027
--   * Sistemi alto rischio Annex I:   da 2 ago 2027 → 2 ago 2028
--   * Watermarking AI content:        da 2 ago 2026 → 2 dic 2026
--   * Divieto deepfake nudificazione: nuovo, 2 dic 2026
-- La Legge italiana 132/2025 NON è interessata dal rinvio.
-- ============================================================================

-- 1) Aggiorna la vecchia scadenza "2 ago 2026" se è stata seedata
update public.alerts
   set title = 'Sistemi AI ad alto rischio: scadenza spostata al 2 dicembre 2027',
       content = 'Con il pacchetto Omnibus AI Act del 7 maggio 2026, gli obblighi per i sistemi AI ad alto rischio (Annex III) sono rinviati al 2 dicembre 2027 (prima: 2 agosto 2026). Resta valido l''invito a iniziare ora il percorso di adeguamento: chi si prepara nei prossimi 12-18 mesi avrà un netto vantaggio sui competitor.',
       severity = 'info',
       impact = 'Aziende con sistemi alto rischio (HR, credito, education, sanità)',
       source = 'AI Act Omnibus — Decisione UE 7/5/2026'
 where title = 'Sistemi AI ad alto rischio: scadenza 2 agosto 2026';

-- 2) Nuovi alert
insert into public.alerts (title, content, severity, impact, source, published_at) values
  (
    'Omnibus AI Act: rinvio scadenze ufficiale',
    'Il 7 maggio 2026 la Commissione UE ha approvato il pacchetto Omnibus che rinvia gli obblighi più gravosi dell''AI Act: sistemi alto rischio Annex III a dicembre 2027 (era agosto 2026), Annex I ad agosto 2028 (era agosto 2027). Restano invariate le pratiche vietate Art. 5 e gli obblighi di AI literacy (Art. 4), già applicabili. Anche la Legge italiana 132/2025 non è stata toccata: l''informativa dipendenti Art. 11 resta obbligatoria.',
    'info',
    'Tutte le aziende che usano AI',
    'Commissione Europea — pacchetto Omnibus AI Act, 7/5/2026',
    '2026-05-07'
  ),
  (
    'Watermarking AI obbligatorio dal 2 dicembre 2026',
    'Tutti i contenuti generati o significativamente modificati da AI (immagini, video, audio, testo) dovranno essere etichettati come tali in modo machine-readable. Riguarda agenzie marketing, editori, content creator, servizi clienti che usano chatbot generativi. Adeguati per tempo o rischi il blocco delle pubblicazioni.',
    'warning',
    'Agenzie marketing, editori, content creator, servizi clienti',
    'AI Act Art. 50.2 — applicabile dal 2/12/2026',
    '2026-05-08'
  ),
  (
    'Divieto deepfake e immagini di nudo non consensuali (nuovo Art. 5)',
    'L''Omnibus AI Act introduce un nuovo divieto in Art. 5: la generazione e diffusione di deepfake e immagini di nudificazione non consensuali è espressamente vietata dal 2 dicembre 2026. Sanzione fino a 35M€ o 7%% del fatturato globale. Le piattaforme che ospitano contenuti generati dagli utenti devono implementare misure di moderazione.',
    'critical',
    'Piattaforme UGC, social media, app fotografiche, content creator',
    'AI Act Art. 5 modificato — Omnibus 2026, applicabile dal 2/12/2026',
    '2026-05-08'
  )
on conflict do nothing;
