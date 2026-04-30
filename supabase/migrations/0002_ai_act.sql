-- ============================================================================
-- ComplyAI - Modulo AI Act (Regolamento UE 2024/1689)
-- ============================================================================

-- Ruolo dell'organizzazione rispetto al sistema AI
create type public.ai_role as enum ('provider', 'deployer', 'distributor', 'importer');

-- Classificazione rischio AI Act
create type public.ai_risk as enum ('prohibited', 'high', 'limited', 'minimal', 'gpai');

-- Stato del sistema AI nel ciclo di vita aziendale
create type public.ai_status as enum ('in_use', 'in_evaluation', 'decommissioned');

-- ---------------------------------------------------------------------------
-- ai_systems: registro dei sistemi AI usati/forniti dall'azienda
-- ---------------------------------------------------------------------------
create table public.ai_systems (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  vendor text,
  vendor_url text,
  description text,
  purpose text,
  org_role public.ai_role not null default 'deployer',
  risk_class public.ai_risk,
  status public.ai_status not null default 'in_use',
  is_gpai boolean not null default false,
  uses_personal_data boolean not null default false,
  affects_individuals boolean not null default false,
  domains text[] not null default '{}',
  questionnaire jsonb not null default '{}'::jsonb,
  human_oversight text,
  data_sources text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index ai_systems_org_idx on public.ai_systems(organization_id);
create index ai_systems_risk_idx on public.ai_systems(organization_id, risk_class);

alter table public.ai_systems enable row level security;

create policy "ai_systems_member_select" on public.ai_systems
  for select using (public.is_org_member(organization_id));
create policy "ai_systems_editor_write" on public.ai_systems
  for all using (public.org_role(organization_id) in ('owner', 'admin', 'editor'))
  with check (public.org_role(organization_id) in ('owner', 'admin', 'editor'));

-- Trigger updated_at
create trigger trg_ai_systems_updated before update on public.ai_systems
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Estende il document_type enum con i nuovi tipi AI Act
-- ---------------------------------------------------------------------------
alter type public.document_type add value if not exists 'ai_use_policy';
alter type public.document_type add value if not exists 'ai_disclosure';
