-- ============================================================================
-- ComplyAI — Riscrittura compliance_score allineata al vero AI Act
-- ============================================================================
-- Sostituisce la funzione recompute_compliance_score con una formula che
-- riflette gli obblighi reali del Reg. UE 2024/1689 e della L. 132/2025.
--
-- Aree valutate (per organizzazioni in ruolo Deployer, caso più comune):
--   A. Identificazione sistemi AI (10%)
--   B. Pratiche vietate Art. 5 — DEAL-BREAKER (score → 0 se presenti)
--   C. AI Literacy Art. 4 (20%)
--   D. Trasparenza Art. 50 (15%)
--   E. Obblighi Annex III alto rischio (25%)
--   F. Legge italiana 132/2025 (20%)
--   G. Governance interna (10%)
-- ============================================================================

-- Aggiungiamo una colonna jsonb per persistere il breakdown (utile per UI/audit)
alter table public.organizations
  add column if not exists compliance_breakdown jsonb not null default '{}'::jsonb;

create or replace function public.recompute_compliance_score(org uuid)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  -- Conteggi sistemi
  sys_total int := 0;
  sys_prohibited int := 0;
  sys_high int := 0;
  sys_high_with_oversight int := 0;
  sys_transparency int := 0;
  sys_transparency_disclosed int := 0;
  -- Conteggi documenti pubblicati
  doc_policy int := 0;        -- ai_use_policy
  doc_employee int := 0;      -- ai_employee_notice (L. 132 Art. 11)
  doc_disclosure int := 0;    -- ai_disclosure (AI Act Art. 50)
  doc_registry int := 0;      -- ai_registry_export
  -- Formazione
  training_people int := 0;
  declared_employees int := 0;
  literacy_ratio numeric := 0;
  -- Punteggi per area (max nel commento)
  score_a int := 0;   -- 10
  score_c int := 0;   -- 20
  score_d int := 0;   -- 15
  score_e int := 0;   -- 25
  score_f int := 0;   -- 20
  score_g int := 0;   -- 10
  final_score int;
  emp_band text;
  breakdown jsonb;
begin
  -- ----- Conteggi base -----
  select count(*) into sys_total from ai_systems where organization_id = org;
  select count(*) into sys_prohibited from ai_systems
    where organization_id = org and category = 'vietato';
  select count(*) into sys_high from ai_systems
    where organization_id = org and category = 'alto';
  select count(*) into sys_high_with_oversight from ai_systems
    where organization_id = org and category = 'alto'
      and human_oversight is not null and length(trim(human_oversight)) > 10;
  select count(*) into sys_transparency from ai_systems
    where organization_id = org and category in ('trasparenza', 'gpai');

  -- Trasparenza: per ogni sistema limited/gpai vogliamo almeno 1 ai_disclosure
  -- pubblicata. Per semplicità: se ho >=1 documento ai_disclosure published e
  -- ho almeno 1 sistema trasparenza → considera coperto.
  select count(distinct id) into doc_disclosure from documents
    where organization_id = org and type = 'ai_disclosure'
      and published_at is not null;

  if sys_transparency > 0 and doc_disclosure > 0 then
    sys_transparency_disclosed := sys_transparency;
  end if;

  -- Documenti pubblicati per tipo
  select count(*) into doc_policy from documents
    where organization_id = org and type = 'ai_use_policy' and published_at is not null;
  select count(*) into doc_employee from documents
    where organization_id = org and type = 'ai_employee_notice' and published_at is not null;
  select count(*) into doc_registry from documents
    where organization_id = org and type = 'ai_registry_export' and published_at is not null;

  -- Formazione: persone uniche addestrate
  select count(distinct lower(coalesce(employee_email, employee_name))) into training_people
    from training_records where organization_id = org;

  -- Stima dipendenti dichiarati (in onboarding il campo 'employees' è una fascia
  -- testuale tipo "1-10", "11-50", "51-200", "201-500", "500+")
  select employees into emp_band from organizations where id = org;
  declared_employees := case emp_band
    when '1-10' then 5
    when '11-50' then 25
    when '51-200' then 100
    when '201-500' then 300
    when '500+' then 600
    else 1
  end;

  -- ----- DEAL-BREAKER: pratiche vietate Art. 5 -----
  if sys_prohibited > 0 then
    breakdown := jsonb_build_object(
      'final', 0,
      'reason', 'prohibited_practice_detected',
      'message', 'Hai uno o più sistemi classificati come pratica vietata ex Art. 5 AI Act. Il punteggio è azzerato finché non rimuovi o riprogetti il sistema. Sanzione fino a 35M€ o 7% del fatturato.',
      'prohibited_systems', sys_prohibited
    );
    update organizations
       set compliance_score = 0, compliance_breakdown = breakdown
     where id = org;
    return 0;
  end if;

  -- ----- A. Identificazione sistemi (10 pt) -----
  -- 0 sistemi e mai compilato il questionario → 0
  -- Se ho registrato anche solo 1 sistema → 7
  -- Se ne ho registrati ≥3 → 10
  if sys_total = 0 then
    score_a := 0;
  elsif sys_total < 3 then
    score_a := 7;
  else
    score_a := 10;
  end if;

  -- ----- C. AI Literacy Art. 4 (20 pt) -----
  -- Ratio = persone formate / dipendenti dichiarati. Obiettivo: ≥80% → 20.
  if declared_employees > 0 then
    literacy_ratio := least(training_people::numeric / declared_employees::numeric, 1.0);
  end if;
  score_c := round(literacy_ratio * 20)::int;

  -- ----- D. Trasparenza Art. 50 (15 pt) -----
  -- Se non ho sistemi limited/gpai → l'area non si applica, score pieno.
  -- Se ne ho e ho disclosure pubblicata → 15. Altrimenti 0.
  if sys_transparency = 0 then
    score_d := 15;
  elsif sys_transparency_disclosed >= sys_transparency then
    score_d := 15;
  elsif sys_transparency_disclosed > 0 then
    score_d := 8;  -- parziale
  else
    score_d := 0;
  end if;

  -- ----- E. Alto rischio Annex III (25 pt) -----
  -- Se non ho sistemi alto rischio → l'area non si applica, score pieno.
  -- Se li ho: % di sistemi alto con oversight definito.
  if sys_high = 0 then
    score_e := 25;
  else
    score_e := round((sys_high_with_oversight::numeric / sys_high::numeric) * 25)::int;
  end if;

  -- ----- F. Legge 132/2025 (20 pt) -----
  -- Art. 11: informativa dipendenti pubblicata
  -- Se non ho dipendenti dichiarati (1-10 → solo titolare) → l'area pesa meno
  if declared_employees <= 1 then
    score_f := 20;  -- non applicabile, score pieno
  elsif doc_employee > 0 then
    score_f := 20;
  else
    score_f := 0;
  end if;

  -- ----- G. Governance interna (10 pt) -----
  -- 5 pt per policy interna pubblicata + 5 pt per registro aggiornato
  score_g := (case when doc_policy > 0 then 5 else 0 end) +
             (case when doc_registry > 0 then 5 else 0 end);

  -- ----- Totale -----
  final_score := greatest(0, least(100, score_a + score_c + score_d + score_e + score_f + score_g));

  breakdown := jsonb_build_object(
    'final', final_score,
    'areas', jsonb_build_object(
      'a_identification', jsonb_build_object('score', score_a, 'max', 10, 'systems', sys_total),
      'c_literacy',       jsonb_build_object('score', score_c, 'max', 20, 'trained', training_people, 'declared_employees', declared_employees, 'ratio', round(literacy_ratio, 2)),
      'd_transparency',   jsonb_build_object('score', score_d, 'max', 15, 'requiring', sys_transparency, 'covered', sys_transparency_disclosed),
      'e_high_risk',      jsonb_build_object('score', score_e, 'max', 25, 'requiring', sys_high, 'with_oversight', sys_high_with_oversight),
      'f_law_132',        jsonb_build_object('score', score_f, 'max', 20, 'employee_notice_published', doc_employee > 0),
      'g_governance',     jsonb_build_object('score', score_g, 'max', 10, 'policy_published', doc_policy > 0, 'registry_published', doc_registry > 0)
    ),
    'computed_at', now()
  );

  update organizations
     set compliance_score = final_score,
         compliance_breakdown = breakdown
   where id = org;

  return final_score;
end;
$$;

grant execute on function public.recompute_compliance_score(uuid) to authenticated;
