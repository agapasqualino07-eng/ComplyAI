-- ============================================================================
-- ComplyAI — Indici aggiuntivi e helper audit log
-- ----------------------------------------------------------------------------
-- 1. Indici mancanti per query frequenti in dashboard
-- 2. Funzione helper per scrivere audit log da API (SECURITY DEFINER)
-- ============================================================================

-- Indici composti per query "lista per org + filtro tipo"
create index if not exists documents_org_type_idx
  on public.documents(organization_id, type);

create index if not exists ai_systems_category_idx
  on public.ai_systems(organization_id, category);

create index if not exists training_records_org_completed_idx
  on public.training_records(organization_id, completed_at desc);

create index if not exists subscriptions_status_idx
  on public.subscriptions(status);

create index if not exists alerts_severity_idx
  on public.alerts(severity, published_at desc);

-- ----------------------------------------------------------------------------
-- audit_logs: helper per scrivere log dall'app
-- ----------------------------------------------------------------------------
-- Funzione helper: scrive un audit log con l'utente corrente come attore.
-- È SECURITY DEFINER per poter bypassare RLS sull'insert; valida org_role.
create or replace function public.log_audit(
  p_organization_id uuid,
  p_action text,
  p_target_type text default null,
  p_target_id text default null,
  p_metadata jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Verifica che la tabella esista (no-op se schema divergente)
  if not exists (select 1 from information_schema.tables
                 where table_schema = 'public' and table_name = 'audit_logs') then
    return;
  end if;

  -- Verifica che il chiamante sia membro dell'org (anti-abuse)
  if not public.is_org_member(p_organization_id) then
    raise exception 'not a member of organization %', p_organization_id
      using errcode = '42501';
  end if;

  insert into public.audit_logs (organization_id, actor_id, action, target_type, target_id, metadata)
  values (p_organization_id, auth.uid(), p_action, p_target_type, p_target_id, p_metadata);
end;
$$;

grant execute on function public.log_audit(uuid, text, text, text, jsonb) to authenticated;
