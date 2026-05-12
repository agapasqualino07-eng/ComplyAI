-- ============================================================================
-- ComplyAI — Retention automatica dei dati (GDPR art. 5.1.e)
-- ----------------------------------------------------------------------------
-- Funzione che applica i periodi di conservazione dichiarati nella Privacy
-- Policy e nel registro trattamenti. Invocata via cron Vercel ogni notte.
-- ============================================================================

create or replace function public.purge_expired_data()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  audit_deleted int := 0;
  quiz_anonymized int := 0;
  invitations_purged int := 0;
begin
  -- 1) Audit log: 90 giorni di retention (sicurezza, prevenzione frodi)
  with del as (
    delete from public.audit_logs
    where created_at < now() - interval '90 days'
    returning 1
  )
  select count(*) into audit_deleted from del;

  -- 2) Quiz completions: dopo 24 mesi anonimizziamo (rimuoviamo email)
  with upd as (
    update public.quiz_completions
    set email = null
    where created_at < now() - interval '24 months'
      and email is not null
    returning 1
  )
  select count(*) into quiz_anonymized from upd;

  -- 3) Inviti scaduti da oltre 30 giorni: rimossi
  with del as (
    delete from public.org_invitations
    where expires_at < now() - interval '30 days'
      and accepted_at is null
    returning 1
  )
  select count(*) into invitations_purged from del;

  return jsonb_build_object(
    'audit_deleted', audit_deleted,
    'quiz_anonymized', quiz_anonymized,
    'invitations_purged', invitations_purged,
    'ran_at', now()
  );
end;
$$;

-- Solo service_role può invocarla (no authenticated)
revoke all on function public.purge_expired_data() from public;
grant execute on function public.purge_expired_data() to service_role;
