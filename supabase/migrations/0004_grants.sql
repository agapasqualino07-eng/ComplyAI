-- ============================================================================
-- ComplyAI — Grants espliciti per i ruoli Supabase (authenticated, anon)
-- ----------------------------------------------------------------------------
-- Fix per "permission denied for table organizations" e simili.
-- Le tabelle sono protette da RLS; qui concediamo solo il permesso Postgres
-- di base che PostgREST richiede prima di valutare le policy RLS.
-- ============================================================================

-- USAGE sullo schema public (necessario per qualunque accesso)
grant usage on schema public to authenticated, anon;

-- Tabelle: l'utente autenticato può leggere/scrivere; le RLS filtrano le righe.
grant select, insert, update, delete on all tables in schema public to authenticated;

-- Sequenze (per default DEFAULTs basati su sequence)
grant usage, select on all sequences in schema public to authenticated;

-- Funzioni helper (is_org_member, org_role, recompute_compliance_score, ...)
grant execute on all functions in schema public to authenticated;

-- ----------------------------------------------------------------------------
-- Permessi minimi per ruolo anon (utente non autenticato)
-- ----------------------------------------------------------------------------
-- quiz_completions: chiunque può completare il quiz lead magnet (INSERT)
grant insert on table public.quiz_completions to anon;

-- alerts: feed normativo (la policy RLS limita comunque a 'authenticated',
-- ma non guasta avere il GRANT pronto per eventuali policy future)
grant select on table public.alerts to anon;

-- ----------------------------------------------------------------------------
-- Default privileges: applica gli stessi grant a TUTTE le future tabelle/
-- funzioni create nello schema public dal ruolo postgres.
-- ----------------------------------------------------------------------------
alter default privileges in schema public
  grant select, insert, update, delete on tables to authenticated;

alter default privileges in schema public
  grant usage, select on sequences to authenticated;

alter default privileges in schema public
  grant execute on functions to authenticated;
