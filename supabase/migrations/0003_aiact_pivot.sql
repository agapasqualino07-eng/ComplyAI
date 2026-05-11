-- ============================================================================
-- ComplyAI / AIComply — Pivot AI Act-first (Reg. UE 2024/1689 + L. 132/2025)
-- ============================================================================
-- Questa migration:
--   1. Estende organizations con campi compliance (sector, employees, score)
--   2. Aggiunge partners (studi commercialisti/legali Enterprise)
--   3. Aggiunge training_records, alerts, quiz_completions
--   4. Adatta ai_systems al modello aicomply (category, vendor_key)
--   5. Adatta documents ai 4 tipi audit-ready
--   6. RIMUOVE le tabelle GDPR non più usate (sites, cmp, consensi, processing)
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. Drop tabelle GDPR (CASCADE per togliere anche RLS e indici)
-- ---------------------------------------------------------------------------
drop table if exists public.consent_logs cascade;
drop table if exists public.cmp_configs cascade;
drop table if exists public.processing_records cascade;
drop table if exists public.sites cascade;

-- ---------------------------------------------------------------------------
-- 2. Estendi organizations con campi AI Act
-- ---------------------------------------------------------------------------
alter table public.organizations
  add column if not exists sector text,
  add column if not exists employees text,
  add column if not exists compliance_score int not null default 0,
  add column if not exists compliance_status text not null default 'bozza'
    check (compliance_status in ('bozza', 'in_corso', 'completato', 'scaduto')),
  add column if not exists questionnaire_data jsonb,
  add column if not exists partner_id uuid references public.organizations(id) on delete set null;

-- Indice per query per partner
create index if not exists organizations_partner_idx on public.organizations(partner_id);

-- ---------------------------------------------------------------------------
-- 3. Tabella partners (studi commercialisti/legali per piano Enterprise)
-- ---------------------------------------------------------------------------
create table if not exists public.partners (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  studio_name text not null,
  contact_name text,
  contact_email text,
  vat_number text,
  client_slots int not null default 10,
  clients_used int not null default 0,
  -- White-label
  logo_url text,
  brand_color text default '#6d28d9',
  footer_text text,
  welcome_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.partners enable row level security;

create policy "partners_self_select" on public.partners
  for select using (auth.uid() = user_id);
create policy "partners_self_update" on public.partners
  for update using (auth.uid() = user_id);
create policy "partners_self_insert" on public.partners
  for insert with check (auth.uid() = user_id);

create trigger trg_partners_updated before update on public.partners
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 4. training_records: tracciamento formazione AI literacy (Art. 4 AI Act)
-- ---------------------------------------------------------------------------
create table if not exists public.training_records (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  employee_name text not null,
  employee_email text,
  topic text not null,
  module_id text,
  duration_hours numeric(5,2) not null default 0,
  completed_at date not null default current_date,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists training_records_org_idx on public.training_records(organization_id);

alter table public.training_records enable row level security;

create policy "training_member_select" on public.training_records
  for select using (public.is_org_member(organization_id));
create policy "training_editor_write" on public.training_records
  for all using (public.org_role(organization_id) in ('owner', 'admin', 'editor'))
  with check (public.org_role(organization_id) in ('owner', 'admin', 'editor'));

-- ---------------------------------------------------------------------------
-- 5. alerts: feed normativo (globale, leggibile da tutti gli utenti)
-- ---------------------------------------------------------------------------
create table if not exists public.alerts (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  content text not null,
  severity text not null default 'info' check (severity in ('info', 'warning', 'critical')),
  impact text,
  source text,
  published_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists alerts_published_idx on public.alerts(published_at desc);

alter table public.alerts enable row level security;

-- Tutti gli utenti autenticati possono leggere gli alert
create policy "alerts_authenticated_select" on public.alerts
  for select using (auth.role() = 'authenticated');

-- Seed: 4 alert iniziali allineati al calendario AI Act + L.132/2025
insert into public.alerts (title, content, severity, impact, source, published_at) values
  (
    'AI Act in vigore (Reg. UE 2024/1689)',
    'Il Regolamento europeo sull''Intelligenza Artificiale è entrato in vigore. Verifica se la tua azienda è un Provider o un Deployer e mappa i sistemi AI in uso.',
    'info',
    'Tutte le aziende che usano AI nell''UE',
    'Reg. UE 2024/1689 — Art. 113',
    '2024-08-01'
  ),
  (
    'Pratiche AI vietate operative (Art. 5)',
    'Da oggi sono vietate 8 pratiche di IA (social scoring, scraping facciale, riconoscimento emozioni al lavoro/scuola, manipolazione subliminale, ecc.). Verifica che nessun sistema in uso rientri tra queste. Sanzione fino a 35M€ o 7%% del fatturato.',
    'critical',
    'Tutte le aziende',
    'AI Act, Art. 5 — applicabile dal 2/2/2025',
    '2025-02-02'
  ),
  (
    'Legge italiana 132/2025 in vigore',
    'La Legge 132/2025 sull''IA è applicabile. Obblighi chiave: informativa scritta ai dipendenti sull''uso di AI (Art. 11), trasparenza per le professioni intellettuali (Art. 13), supremazia del giudizio umano in sanità e giustizia (Artt. 7, 15).',
    'warning',
    'Datori di lavoro, professionisti, sanità, PA',
    'Legge 23/9/2025 n. 132 — in vigore dal 10/10/2025',
    '2025-10-10'
  ),
  (
    'Sistemi AI ad alto rischio: scadenza 2 agosto 2026',
    'Dal 2 agosto 2026 si applicano gli obblighi per i sistemi AI ad alto rischio (Annex III): HR/screening CV, credito, istruzione, sanità, ecc. Richiesti gestione del rischio, documentazione tecnica, supervisione umana, registrazione nel database UE.',
    'warning',
    'Aziende con sistemi alto rischio (HR, credito, education, sanità)',
    'AI Act, Capo III — applicabile dal 2/8/2026',
    '2025-11-01'
  )
on conflict do nothing;

-- ---------------------------------------------------------------------------
-- 6. quiz_completions: tracking anonimo del quiz lead magnet
-- ---------------------------------------------------------------------------
create table if not exists public.quiz_completions (
  id uuid primary key default uuid_generate_v4(),
  sector text,
  employees text,
  score int,
  systems_count int,
  risk_summary jsonb default '{}'::jsonb,
  answers jsonb default '{}'::jsonb,
  email text,
  clicked_pro boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists quiz_completions_created_idx on public.quiz_completions(created_at desc);

alter table public.quiz_completions enable row level security;

-- INSERT pubblico (chiunque, anche non autenticato, può completare il quiz)
create policy "quiz_public_insert" on public.quiz_completions
  for insert with check (true);
-- SELECT solo per admin (via service role)

-- ---------------------------------------------------------------------------
-- 7. Adatta ai_systems al modello aicomply
-- ---------------------------------------------------------------------------
alter table public.ai_systems
  add column if not exists vendor_key text,
  add column if not exists obligation text,
  add column if not exists category text;

-- Mappa risk_class -> category (per i record esistenti)
update public.ai_systems
set category = case risk_class
  when 'prohibited' then 'vietato'
  when 'high' then 'alto'
  when 'limited' then 'trasparenza'
  when 'gpai' then 'gpai'
  when 'minimal' then 'minimo'
  else null
end
where category is null;

-- ---------------------------------------------------------------------------
-- 8. Adatta documents per i 4 tipi audit-ready AI Act
-- ---------------------------------------------------------------------------
alter type public.document_type add value if not exists 'ai_employee_notice';
alter type public.document_type add value if not exists 'ai_registry_export';

-- ---------------------------------------------------------------------------
-- 9. Function helper: aggiorna compliance_score automaticamente
-- ---------------------------------------------------------------------------
create or replace function public.recompute_compliance_score(org uuid)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  base int := 30;
  systems_count int;
  high_risk_count int;
  training_count int;
  signed_docs_count int;
  total_docs_count int;
  bonus_systems int;
  bonus_training int;
  bonus_docs int;
  penalty_high int;
  final_score int;
begin
  select count(*) into systems_count from ai_systems where organization_id = org;
  select count(*) into high_risk_count from ai_systems where organization_id = org and category = 'alto';
  select count(*) into training_count from training_records where organization_id = org;
  select count(*) into signed_docs_count from documents where organization_id = org and published_at is not null;
  select greatest(count(*),1) into total_docs_count from documents where organization_id = org;

  bonus_systems := least(systems_count * 4, 20);
  penalty_high := least(high_risk_count * 12, 36);
  bonus_training := least(training_count * 5, 20);
  bonus_docs := least(round((signed_docs_count::numeric / total_docs_count::numeric) * 30)::int, 30);

  final_score := greatest(0, least(100, base + bonus_systems + bonus_training + bonus_docs - penalty_high));

  update organizations set compliance_score = final_score where id = org;
  return final_score;
end;
$$;
