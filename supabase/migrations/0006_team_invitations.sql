-- ============================================================================
-- ComplyAI — Inviti team, GDPR export, audit, signin event
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. org_invitations: inviti pendenti a unirsi a un'organizzazione
-- ---------------------------------------------------------------------------
create table if not exists public.org_invitations (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  email text not null,
  role public.org_role not null default 'editor',
  token text not null unique default encode(gen_random_bytes(24), 'hex'),
  invited_by uuid references auth.users(id) on delete set null,
  expires_at timestamptz not null default (now() + interval '14 days'),
  accepted_at timestamptz,
  created_at timestamptz not null default now(),
  unique (organization_id, email)
);

create index if not exists org_invitations_org_idx on public.org_invitations(organization_id);
create index if not exists org_invitations_email_idx on public.org_invitations(lower(email));
create index if not exists org_invitations_token_idx on public.org_invitations(token);

alter table public.org_invitations enable row level security;

-- Membri admin/owner vedono e gestiscono gli inviti della propria org
create policy "invitations_admin_select" on public.org_invitations
  for select using (public.org_role(organization_id) in ('owner', 'admin'));

create policy "invitations_admin_write" on public.org_invitations
  for all using (public.org_role(organization_id) in ('owner', 'admin'))
  with check (public.org_role(organization_id) in ('owner', 'admin'));

-- ---------------------------------------------------------------------------
-- 2. Helper RPC: accetta un invito (transazionale, sicura)
-- ---------------------------------------------------------------------------
create or replace function public.accept_invitation(p_token text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  inv record;
  user_email text;
begin
  -- L'utente deve essere autenticato
  if auth.uid() is null then
    raise exception 'not authenticated' using errcode = '42501';
  end if;

  -- Recupera email dell'utente corrente
  select email into user_email from auth.users where id = auth.uid();
  if user_email is null then
    raise exception 'user not found' using errcode = '42501';
  end if;

  -- Lock dell'invito per evitare doppia accettazione
  select * into inv from public.org_invitations
    where token = p_token
    for update;

  if not found then
    return jsonb_build_object('ok', false, 'reason', 'invitation_not_found');
  end if;

  if inv.accepted_at is not null then
    return jsonb_build_object('ok', false, 'reason', 'already_accepted', 'organization_id', inv.organization_id);
  end if;

  if inv.expires_at < now() then
    return jsonb_build_object('ok', false, 'reason', 'expired');
  end if;

  if lower(inv.email) <> lower(user_email) then
    return jsonb_build_object('ok', false, 'reason', 'email_mismatch');
  end if;

  -- Aggiungi membership (idempotente)
  insert into public.org_members (organization_id, user_id, role)
  values (inv.organization_id, auth.uid(), inv.role)
  on conflict (organization_id, user_id) do nothing;

  update public.org_invitations
    set accepted_at = now()
    where id = inv.id;

  return jsonb_build_object('ok', true, 'organization_id', inv.organization_id);
end;
$$;

grant execute on function public.accept_invitation(text) to authenticated;
