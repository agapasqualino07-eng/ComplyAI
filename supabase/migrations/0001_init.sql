-- ============================================================================
-- ComplyAI - Schema iniziale (multi-tenant con RLS)
-- ============================================================================

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- profiles: estende auth.users con info pubbliche
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_self_select" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles_self_update" on public.profiles
  for update using (auth.uid() = id);

-- ---------------------------------------------------------------------------
-- organizations: l'azienda/cliente del SaaS (titolare del trattamento)
-- ---------------------------------------------------------------------------
create table public.organizations (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  legal_name text,
  vat_number text,
  tax_code text,
  country text not null default 'IT',
  address text,
  city text,
  postal_code text,
  email text,
  owner_id uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now()
);

create index organizations_owner_idx on public.organizations(owner_id);

alter table public.organizations enable row level security;

-- ---------------------------------------------------------------------------
-- org_members: utenti con accesso a un'organizzazione + ruolo
-- ---------------------------------------------------------------------------
create type public.org_role as enum ('owner', 'admin', 'editor', 'viewer');

create table public.org_members (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.org_role not null default 'editor',
  created_at timestamptz not null default now(),
  unique (organization_id, user_id)
);

create index org_members_org_idx on public.org_members(organization_id);
create index org_members_user_idx on public.org_members(user_id);

alter table public.org_members enable row level security;

-- Helper function: l'utente corrente è membro dell'org?
create or replace function public.is_org_member(org_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.org_members
    where organization_id = org_id and user_id = auth.uid()
  );
$$;

-- Helper function: ruolo dell'utente corrente nell'org
create or replace function public.org_role(org_id uuid)
returns public.org_role
language sql
security definer
set search_path = public
as $$
  select role from public.org_members
  where organization_id = org_id and user_id = auth.uid()
  limit 1;
$$;

-- Policies su organizations e org_members
create policy "orgs_member_select" on public.organizations
  for select using (public.is_org_member(id));
create policy "orgs_owner_insert" on public.organizations
  for insert with check (auth.uid() = owner_id);
create policy "orgs_owner_update" on public.organizations
  for update using (public.org_role(id) in ('owner', 'admin'));
create policy "orgs_owner_delete" on public.organizations
  for delete using (public.org_role(id) = 'owner');

create policy "members_self_select" on public.org_members
  for select using (user_id = auth.uid() or public.is_org_member(organization_id));
create policy "members_admin_write" on public.org_members
  for all using (public.org_role(organization_id) in ('owner', 'admin'))
  with check (public.org_role(organization_id) in ('owner', 'admin'));

-- ---------------------------------------------------------------------------
-- subscriptions: abbonamento Stripe per organizzazione
-- ---------------------------------------------------------------------------
create type public.plan_id as enum ('free', 'solo', 'pro', 'business', 'enterprise');
create type public.subscription_status as enum (
  'trialing', 'active', 'past_due', 'canceled',
  'incomplete', 'incomplete_expired', 'unpaid', 'paused'
);

create table public.subscriptions (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null unique references public.organizations(id) on delete cascade,
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  stripe_price_id text,
  plan public.plan_id not null default 'free',
  cadence text check (cadence in ('monthly', 'yearly')),
  status public.subscription_status not null default 'trialing',
  trial_end timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index subs_org_idx on public.subscriptions(organization_id);
create index subs_customer_idx on public.subscriptions(stripe_customer_id);

alter table public.subscriptions enable row level security;

create policy "subs_member_select" on public.subscriptions
  for select using (public.is_org_member(organization_id));
-- Insert/Update solo da service-role (webhook Stripe), nessuna policy per anon/auth.

-- ---------------------------------------------------------------------------
-- sites: i siti web del cliente
-- ---------------------------------------------------------------------------
create table public.sites (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  domain text not null,
  public_id text not null unique default encode(gen_random_bytes(8), 'hex'),
  created_at timestamptz not null default now()
);

create index sites_org_idx on public.sites(organization_id);
create index sites_public_idx on public.sites(public_id);

alter table public.sites enable row level security;

create policy "sites_member_select" on public.sites
  for select using (public.is_org_member(organization_id));
create policy "sites_editor_write" on public.sites
  for all using (public.org_role(organization_id) in ('owner', 'admin', 'editor'))
  with check (public.org_role(organization_id) in ('owner', 'admin', 'editor'));

-- ---------------------------------------------------------------------------
-- documents: policy generate (privacy/cookie/terms/eula)
-- ---------------------------------------------------------------------------
create type public.document_type as enum ('privacy', 'cookie', 'terms', 'eula');

create table public.documents (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  site_id uuid references public.sites(id) on delete set null,
  type public.document_type not null,
  title text not null,
  slug text not null,
  language text not null default 'it',
  version int not null default 1,
  questionnaire jsonb not null default '{}'::jsonb,
  rendered_html text not null default '',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (slug, language)
);

create index documents_org_idx on public.documents(organization_id);
create index documents_site_idx on public.documents(site_id);
create index documents_slug_idx on public.documents(slug);

alter table public.documents enable row level security;

-- Documenti pubblicati sono pubblici per la rotta /p/{slug} (lettura via service role)
create policy "documents_member_select" on public.documents
  for select using (public.is_org_member(organization_id));
create policy "documents_editor_write" on public.documents
  for all using (public.org_role(organization_id) in ('owner', 'admin', 'editor'))
  with check (public.org_role(organization_id) in ('owner', 'admin', 'editor'));

-- ---------------------------------------------------------------------------
-- cmp_configs: configurazione del banner CMP per ogni sito
-- ---------------------------------------------------------------------------
create table public.cmp_configs (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  site_id uuid not null unique references public.sites(id) on delete cascade,
  theme text not null default 'light' check (theme in ('light','dark','auto')),
  accent_color text not null default '#6d28d9',
  position text not null default 'bottom' check (position in ('bottom','top','center')),
  layout text not null default 'bar' check (layout in ('bar','box')),
  consent_mode text not null default 'opt_in' check (consent_mode in ('opt_in','opt_out','info')),
  categories jsonb not null default
    '[{"id":"necessary","label":"Necessari","required":true},{"id":"preferences","label":"Preferenze","required":false},{"id":"statistics","label":"Statistica","required":false},{"id":"marketing","label":"Marketing","required":false}]'::jsonb,
  texts jsonb not null default
    '{"title":"Rispettiamo la tua privacy","body":"Usiamo cookie per offrirti la migliore esperienza. Puoi accettare tutti i cookie, rifiutarli o personalizzare le tue preferenze.","accept":"Accetta tutti","reject":"Rifiuta","customize":"Personalizza","save":"Salva preferenze"}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.cmp_configs enable row level security;

create policy "cmp_member_select" on public.cmp_configs
  for select using (public.is_org_member(organization_id));
create policy "cmp_editor_write" on public.cmp_configs
  for all using (public.org_role(organization_id) in ('owner', 'admin', 'editor'))
  with check (public.org_role(organization_id) in ('owner', 'admin', 'editor'));

-- ---------------------------------------------------------------------------
-- consent_logs: registro consensi (immutabile, nessun update/delete dal client)
-- ---------------------------------------------------------------------------
create table public.consent_logs (
  id uuid primary key default uuid_generate_v4(),
  site_id uuid not null references public.sites(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  subject_id text not null,
  consent_string text not null,
  categories jsonb not null,
  user_agent text,
  ip_hash text,
  page_url text,
  created_at timestamptz not null default now()
);

create index consent_logs_site_idx on public.consent_logs(site_id, created_at desc);
create index consent_logs_org_idx on public.consent_logs(organization_id, created_at desc);
create index consent_logs_subject_idx on public.consent_logs(subject_id);

alter table public.consent_logs enable row level security;

create policy "consent_member_select" on public.consent_logs
  for select using (public.is_org_member(organization_id));
-- Insert solo via service role (endpoint /api/consent), niente policy auth.

-- ---------------------------------------------------------------------------
-- processing_records: registro trattamenti GDPR (art. 30)
-- ---------------------------------------------------------------------------
create table public.processing_records (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  purpose text not null,
  legal_basis text not null,
  data_categories text[] not null default '{}',
  data_subjects text[] not null default '{}',
  retention text,
  recipients text,
  transfers_outside_eu boolean not null default false,
  security_measures text,
  dpo_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index processing_records_org_idx on public.processing_records(organization_id);

alter table public.processing_records enable row level security;

create policy "pr_member_select" on public.processing_records
  for select using (public.is_org_member(organization_id));
create policy "pr_editor_write" on public.processing_records
  for all using (public.org_role(organization_id) in ('owner', 'admin', 'editor'))
  with check (public.org_role(organization_id) in ('owner', 'admin', 'editor'));

-- ---------------------------------------------------------------------------
-- audit_logs: tracciamento azioni significative
-- ---------------------------------------------------------------------------
create table public.audit_logs (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  target_type text,
  target_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index audit_logs_org_idx on public.audit_logs(organization_id, created_at desc);

alter table public.audit_logs enable row level security;

create policy "audit_admin_select" on public.audit_logs
  for select using (public.org_role(organization_id) in ('owner', 'admin'));
-- Insert via service role.

-- ---------------------------------------------------------------------------
-- Trigger: crea profilo automaticamente al signup
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Trigger: aggiunge automaticamente l'owner come membro 'owner' dell'org
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_org()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.org_members (organization_id, user_id, role)
  values (new.id, new.owner_id, 'owner')
  on conflict do nothing;

  insert into public.subscriptions (organization_id, plan, status, trial_end)
  values (new.id, 'free', 'trialing', now() + interval '14 days')
  on conflict do nothing;

  return new;
end;
$$;

drop trigger if exists on_org_created on public.organizations;
create trigger on_org_created
  after insert on public.organizations
  for each row execute function public.handle_new_org();

-- ---------------------------------------------------------------------------
-- updated_at trigger generico
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger trg_documents_updated before update on public.documents
  for each row execute function public.set_updated_at();
create trigger trg_subs_updated before update on public.subscriptions
  for each row execute function public.set_updated_at();
create trigger trg_pr_updated before update on public.processing_records
  for each row execute function public.set_updated_at();
create trigger trg_cmp_updated before update on public.cmp_configs
  for each row execute function public.set_updated_at();
