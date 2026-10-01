-- EPIC247 2.0 — Núcleo de dados (Sprint 0)
--
-- Base: "Modelo de Dados, Eventos e Campos CRM v1.0" + Blueprint §15-16.
-- Desvios intencionais do documento (decisão de arquitetura do time):
--   1. plan_purchased / kit_purchased / protocol_purchased / mentoring_purchased
--      NÃO são colunas: são derivados das transações na view lead_profile
--      (o próprio doc recomenda histórico relacional, §29). Nunca dessincronizam.
--   2. first_touch_* é imutável no BANCO (trigger), não só por convenção.
--   3. A fila de e-mails (messages) mora aqui: é o motor de automação
--      com Resend. A supressão é aplicada na hora do envio, com o estado atual.
--
-- Pensado para rodar num banco NOVO (staging). Em produção já existe uma
-- tabela "leads" do quiz antigo: a virada renomeia a antiga para legacy_leads
-- antes de rodar este arquivo (script de virada separado).
--
-- Escrita só pelo servidor (service role). RLS ligado e sem policy pública.

create extension if not exists pgcrypto;

-- ───────────────────────────── ENUMS (como CHECK) ─────────────────────────────
-- CHECK em texto, e não ENUM do Postgres: acrescentar valor é um ALTER simples.

-- ───────────────────────────── LEADS ─────────────────────────────
create table if not exists leads (
  lead_id                     uuid primary key default gen_random_uuid(),
  email                       text,
  first_name                  text,
  lifecycle_stage             text not null default 'anonymous_visitor'
    check (lifecycle_stage in ('anonymous_visitor','map_started','map_completed','identified_lead',
      'plan_buyer','kit_buyer','protocol_buyer','mentoring_lead','mentoring_client')),
  -- "inactive" é flag, não estágio: não apaga o estágio comercial (Matriz §15).
  inactive_flag               boolean not null default false,
  inactive_since              timestamptz,
  -- Quando dois perfis anônimos viram a mesma pessoa, o antigo aponta para o vivo.
  merged_into                 uuid references leads(lead_id),

  first_touch_source          text,
  first_touch_medium          text,
  first_touch_campaign        text,
  first_touch_content         text,
  first_touch_term            text,
  first_touch_landing_page    text,
  first_touch_at              timestamptz,
  last_touch_source           text,
  last_touch_medium           text,
  last_touch_campaign         text,
  last_touch_content          text,
  last_touch_term             text,
  last_touch_landing_page     text,
  last_touch_at               timestamptz,

  first_map                   text,
  last_map                    text,
  maps_completed_count        integer not null default 0,
  first_primary_dimension     text,
  latest_primary_dimension    text,
  latest_secondary_dimension  text,
  last_primary_pattern        text,
  last_secondary_pattern      text,

  email_consent               boolean not null default false,
  email_consent_at            timestamptz,
  email_consent_source        text,
  privacy_policy_version      text,
  marketing_email_allowed     boolean not null default false,
  unsubscribed_at             timestamptz,

  mentoring_interest          boolean not null default false,
  mentoring_waitlist          boolean not null default false,
  mentoring_waitlist_at       timestamptz,

  created_at                  timestamptz not null default now(),
  last_activity_at            timestamptz not null default now()
);

-- Um e-mail = uma pessoa (sem duplicar identidade, RF-017). Merged não conta.
create unique index if not exists leads_email_uniq
  on leads (lower(email)) where email is not null and merged_into is null;
create index if not exists leads_stage_idx on leads (lifecycle_stage);

-- First-touch é imutável depois de preenchido (RF-023).
create or replace function leads_protege_first_touch() returns trigger
language plpgsql as $$
begin
  if old.first_touch_at is not null and (
       new.first_touch_source       is distinct from old.first_touch_source
    or new.first_touch_medium       is distinct from old.first_touch_medium
    or new.first_touch_campaign     is distinct from old.first_touch_campaign
    or new.first_touch_content      is distinct from old.first_touch_content
    or new.first_touch_term         is distinct from old.first_touch_term
    or new.first_touch_landing_page is distinct from old.first_touch_landing_page
    or new.first_touch_at           is distinct from old.first_touch_at) then
    raise exception 'first_touch é imutável (lead %)', old.lead_id;
  end if;
  return new;
end $$;

drop trigger if exists leads_first_touch_imutavel on leads;
create trigger leads_first_touch_imutavel before update on leads
  for each row execute function leads_protege_first_touch();

-- Hierarquia de estágio (RF-053): só sobe, nunca desce por evento comum.
create or replace function lifecycle_rank(stage text) returns int
language sql immutable as $$
  select case stage
    when 'anonymous_visitor' then 0 when 'map_started' then 1 when 'map_completed' then 2
    when 'identified_lead' then 3 when 'plan_buyer' then 4 when 'kit_buyer' then 5
    when 'protocol_buyer' then 6 when 'mentoring_lead' then 7 when 'mentoring_client' then 8
    else -1 end
$$;

create or replace function promote_lifecycle(p_lead uuid, p_stage text) returns text
language plpgsql as $$
declare atual text;
begin
  select lifecycle_stage into atual from leads where lead_id = p_lead for update;
  if lifecycle_rank(p_stage) > lifecycle_rank(atual) then
    update leads set lifecycle_stage = p_stage, last_activity_at = now() where lead_id = p_lead;
    return p_stage;
  end if;
  return atual;
end $$;

-- ───────────────────────────── SESSÕES ─────────────────────────────
create table if not exists sessions (
  session_id          uuid primary key,
  lead_id             uuid references leads(lead_id),
  session_started_at  timestamptz not null default now(),
  landing_page        text,
  referrer            text,
  utm_source          text,
  utm_medium          text,
  utm_campaign        text,
  utm_content         text,
  utm_term            text,
  -- perfil técnico, sem IP (o IP não é guardado)
  device              text,
  os                  text,
  in_app              text,
  country             text,
  region              text,
  city                text
);
create index if not exists sessions_lead_idx on sessions (lead_id);

-- ───────────────────────────── MAPAS ─────────────────────────────
create table if not exists map_results (
  map_result_id        uuid primary key default gen_random_uuid(),
  lead_id              uuid not null references leads(lead_id),
  session_id           uuid references sessions(session_id),
  map_type             text not null check (map_type in ('friccao','energia','mentalidade',
    'autoconhecimento','felicidade','planejamento','coragem','acao','inteligencia','excelencia','amor')),
  map_version          text not null,
  scoring_version      text not null,
  result_copy_version  text,
  status               text not null default 'in_progress' check (status in ('in_progress','completed')),
  -- respostas parciais/finais (RF-012). Nunca vão para URL nem para analytics.
  answers_json         jsonb not null default '{}'::jsonb,
  current_step         integer not null default 0,
  started_at           timestamptz not null default now(),
  completed_at         timestamptz,
  -- Fricção:
  primary_dimension    text,
  secondary_dimension  text,
  -- Dimensionais:
  primary_pattern      text,
  secondary_pattern    text,
  result_kind          text check (result_kind in ('single','close','tie','low')),
  result_band_primary  text check (result_band_primary in ('stable','observe','attention','priority')),
  -- eixo -> pontos (dimensionais) ou dimensão -> pontos (fricção)
  scores               jsonb,
  -- revisitar resultado sem expor nada (RF-021): 32 bytes aleatórios
  result_token         text unique,
  utm_source           text,
  utm_medium           text,
  utm_campaign         text,
  utm_content          text
);
create index if not exists map_results_lead_idx on map_results (lead_id, started_at desc);
create index if not exists map_results_open_idx on map_results (status, started_at) where status = 'in_progress';

-- ───────────────────────────── PRODUTOS ─────────────────────────────
create table if not exists products (
  product_id           text primary key,
  product_type         text not null check (product_type in ('plan','kit','protocol','mentoring')),
  product_dimension    text,
  product_name         text not null,
  price_list           numeric(10,2) not null,
  checkout_url         text,
  -- id do produto no Kiwify, para o webhook achar qual produto foi pago
  provider_product_id  text,
  active               boolean not null default false,
  updated_at           timestamptz not null default now()
);

-- ───────────────────────────── TRANSAÇÕES ─────────────────────────────
create table if not exists transactions (
  provider            text not null default 'kiwify',
  transaction_id      text not null,
  lead_id             uuid references leads(lead_id),
  product_id          text references products(product_id),
  transaction_status  text not null check (transaction_status in
    ('pending','approved','refunded','chargeback','cancelled')),
  payment_method      text,
  installments        integer,
  amount_gross        numeric(10,2),
  amount_fee          numeric(10,2),
  amount_net          numeric(10,2),
  amount_received     numeric(10,2),
  currency            text not null default 'BRL',
  buyer_email         text,
  purchased_at        timestamptz,
  approved_at         timestamptz,
  received_at         timestamptz,
  refunded_at         timestamptz,
  utm_source          text,
  utm_medium          text,
  utm_campaign        text,
  utm_content         text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  -- idempotência (RF-047): o mesmo pedido nunca vira duas compras
  primary key (provider, transaction_id)
);
create index if not exists transactions_lead_idx on transactions (lead_id);

-- Todo webhook recebido, cru, com reprocessamento (RF-079).
create table if not exists webhook_events (
  id                 bigint generated always as identity primary key,
  provider           text not null,
  event_key          text not null,
  event_type         text,
  payload            jsonb not null,
  received_at        timestamptz not null default now(),
  processing_status  text not null default 'pending'
    check (processing_status in ('pending','processed','failed','ignored')),
  processing_error   text,
  retry_count        integer not null default 0,
  last_retry_at      timestamptz,
  unique (provider, event_key)
);

-- ───────────────────────────── EVENTOS ─────────────────────────────
create table if not exists events (
  event_id           uuid primary key,
  event_name         text not null,
  lead_id            uuid references leads(lead_id),
  session_id         uuid,
  occurred_at        timestamptz not null default now(),
  page_url           text,
  referrer           text,
  utm_source         text,
  utm_medium         text,
  utm_campaign       text,
  utm_content        text,
  utm_term           text,
  map_type           text,
  dimension          text,
  primary_pattern    text,
  secondary_pattern  text,
  product_id         text,
  product_type       text,
  product_price      numeric(10,2),
  transaction_id     text,
  question_index     integer,
  props              jsonb
);
create index if not exists events_name_time_idx on events (event_name, occurred_at desc);
create index if not exists events_lead_idx on events (lead_id, occurred_at desc);

-- ───────────────────────────── PLANO PERSONALIZADO ─────────────────────────────
create table if not exists plan_generations (
  plan_generation_id  uuid primary key default gen_random_uuid(),
  lead_id             uuid not null references leads(lead_id),
  map_result_id       uuid references map_results(map_result_id),
  product_id          text references products(product_id),
  provider            text,
  transaction_id      text,
  generated_at        timestamptz,
  input_version       text,
  output_version      text,
  content             jsonb,
  access_token        text unique,
  processing_status   text not null default 'pending'
    check (processing_status in ('pending','generated','failed')),
  processing_error    text,
  retry_count         integer not null default 0,
  last_retry_at       timestamptz
);

-- ───────────────────────────── FILA DE MENSAGENS ─────────────────────────────
-- Motor de automação: cada e-mail agendado é uma linha. Um cron envia o que
-- venceu, reavaliando supressão e prioridade com o estado ATUAL do lead.
create table if not exists messages (
  message_id          uuid primary key default gen_random_uuid(),
  lead_id             uuid not null references leads(lead_id),
  automation_id       text not null,
  automation_version  text,
  step                text not null,
  template_key        text not null,
  -- 1 transacional ... 6 promocional (Modelo de Dados §26)
  priority            smallint not null check (priority between 1 and 6),
  scheduled_for       timestamptz not null,
  status              text not null default 'scheduled'
    check (status in ('scheduled','sent','skipped','cancelled','failed')),
  skip_reason         text,
  context             jsonb,
  sent_at             timestamptz,
  provider_message_id text,
  opened_at           timestamptz,
  clicked_at          timestamptz,
  error               text,
  -- a mesma etapa da mesma automação nunca é agendada duas vezes
  dedupe_key          text not null unique,
  created_at          timestamptz not null default now()
);
create index if not exists messages_due_idx on messages (scheduled_for) where status = 'scheduled';
create index if not exists messages_lead_idx on messages (lead_id, created_at desc);

-- ───────────────────────────── MENTORIA E CONTATO ─────────────────────────────
create table if not exists mentoring_applications (
  id              uuid primary key default gen_random_uuid(),
  lead_id         uuid references leads(lead_id),
  name            text not null,
  email           text not null,
  challenge       text,
  desired_change  text,
  availability    text,
  origin_dimension text,
  status          text not null default 'new'
    check (status in ('new','in_conversation','client','waitlist','disqualified')),
  created_at      timestamptz not null default now()
);

create table if not exists contact_messages (
  id          uuid primary key default gen_random_uuid(),
  lead_id     uuid references leads(lead_id),
  name        text not null,
  email       text not null,
  subject     text,
  message     text not null,
  status      text not null default 'new' check (status in ('new','answered','archived')),
  created_at  timestamptz not null default now()
);

-- ───────────────────────────── IDEIAS (CMS) ─────────────────────────────
create table if not exists content_items (
  id               uuid primary key default gen_random_uuid(),
  content_type     text not null check (content_type in ('artigo','newsletter','video','repertorio')),
  title            text not null,
  slug             text not null unique,
  excerpt          text,
  cover            text,
  body             text,
  video_url        text,
  dimension        text,
  author           text,
  seo_title        text,
  seo_description  text,
  status           text not null default 'draft' check (status in ('draft','published')),
  published_at     timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create index if not exists content_items_pub_idx on content_items (status, published_at desc);

-- ───────────────────────────── VISÃO DO LEAD ─────────────────────────────
-- Campos comerciais derivados das transações (supressão e CRM leem daqui).
create or replace view lead_profile as
select
  l.*,
  exists (select 1 from transactions t join products p using (product_id)
          where t.lead_id = l.lead_id and t.transaction_status = 'approved' and p.product_type = 'plan')      as plan_purchased,
  exists (select 1 from transactions t join products p using (product_id)
          where t.lead_id = l.lead_id and t.transaction_status = 'approved' and p.product_type = 'kit')       as kit_purchased,
  exists (select 1 from transactions t join products p using (product_id)
          where t.lead_id = l.lead_id and t.transaction_status = 'approved' and p.product_type = 'protocol')  as protocol_purchased,
  exists (select 1 from transactions t join products p using (product_id)
          where t.lead_id = l.lead_id and t.transaction_status = 'approved' and p.product_type = 'mentoring') as mentoring_purchased,
  (select array_agg(distinct p.product_dimension) from transactions t join products p using (product_id)
    where t.lead_id = l.lead_id and t.transaction_status = 'approved' and p.product_type = 'kit')            as kits_owned,
  (select coalesce(sum(t.amount_gross),0) from transactions t where t.lead_id = l.lead_id
    and t.transaction_status = 'approved')                                                                   as lifetime_revenue_gross,
  (select coalesce(sum(t.amount_net),0) from transactions t where t.lead_id = l.lead_id
    and t.transaction_status = 'approved')                                                                   as lifetime_revenue_net,
  (select coalesce(sum(t.amount_received),0) from transactions t where t.lead_id = l.lead_id
    and t.transaction_status = 'approved')                                                                   as lifetime_cash_received,
  (select min(t.approved_at) from transactions t where t.lead_id = l.lead_id
    and t.transaction_status = 'approved')                                                                   as customer_since,
  (select max(t.approved_at) from transactions t where t.lead_id = l.lead_id
    and t.transaction_status = 'approved')                                                                   as last_purchase_at
from leads l
where l.merged_into is null;

-- ───────────────────────────── RLS ─────────────────────────────
alter table leads                   enable row level security;
alter table sessions                enable row level security;
alter table map_results             enable row level security;
alter table products                enable row level security;
alter table transactions            enable row level security;
alter table webhook_events          enable row level security;
alter table events                  enable row level security;
alter table plan_generations        enable row level security;
alter table messages                enable row level security;
alter table mentoring_applications  enable row level security;
alter table contact_messages        enable row level security;
alter table content_items           enable row level security;

-- A view roda com as permissões de quem consulta: só o service role a lê.
alter view lead_profile set (security_invoker = true);
revoke all on lead_profile from anon, authenticated;
