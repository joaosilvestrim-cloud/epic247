-- Camada KPI / BI e pagamentos RC1.
-- Fontes: Modelo de Dados v1.1 §52-§65, Blueprint v1.2 §37-§53 e §55,
-- Requisitos RF-096 a RF-118, Release Candidate RC1 §5, §11, §17.
--
--   §65  Transaction: payment_provider, provider_transaction_id,
--        provider_status_raw, provider_event_id; status 'refused'.
--   §53  content_performance   (conteúdo externo, ligado por content_id = utm_content)
--   §54  campaign_performance  (gasto e entrega de mídia, por dia e anúncio)
--   §57  receivables           (caixa esperado e recebido, 1..N por transação)
--   §62  ingestão idempotente: source_system, source_record_id, source_updated_at,
--        ingested_at, processing_status, processing_error em toda carga externa.
--   §55  external_campaign_id / external_adset_id / external_ad_id em sessão e evento.
--
-- Idempotente: pode rodar de novo sem efeito.

-- ───────────── Transaction (§65) ─────────────
-- O provedor já mora em "provider" (parte da chave). payment_provider é o
-- nome do documento: coluna gerada, nunca diverge.
alter table transactions add column if not exists payment_provider text generated always as (provider) stored;
alter table transactions add column if not exists provider_transaction_id text;
alter table transactions add column if not exists provider_status_raw text;
alter table transactions add column if not exists provider_event_id text;

alter table transactions drop constraint if exists transactions_transaction_status_check;
alter table transactions add constraint transactions_transaction_status_check
  check (transaction_status in ('pending','approved','refused','refunded','chargeback','cancelled'));

update transactions set provider_transaction_id = transaction_id where provider_transaction_id is null;
-- Uma venda do provedor = uma linha (o status muda na mesma linha).
create unique index if not exists transactions_provider_tx_uniq
  on transactions (provider, provider_transaction_id) where provider_transaction_id is not null;
create index if not exists transactions_status_aprov_idx on transactions (transaction_status, approved_at);

-- Log de webhooks: prioridade de deduplicação do §65.
--   1. provider_event_id quando o provedor manda
--   2. provider_transaction_id + tipo de evento/status (já é a event_key)
--   3. transaction_id interno
alter table webhook_events add column if not exists provider_event_id text;
alter table webhook_events add column if not exists provider_transaction_id text;
alter table webhook_events add column if not exists provider_status_raw text;
alter table webhook_events add column if not exists normalized_status text;
create unique index if not exists webhook_events_provider_event_uniq
  on webhook_events (provider, provider_event_id) where provider_event_id is not null;
create index if not exists webhook_events_tx_idx on webhook_events (provider, provider_transaction_id);

-- PurchaseHistory só tem compra de verdade: pendente, recusada e cancelada
-- não entram (§65 "pagamento não aprovado").
create or replace view purchase_history as
select t.lead_id, t.product_id, p.product_type, p.product_dimension, t.provider, t.transaction_id,
       t.transaction_status as status, t.amount_gross, t.amount_net, t.amount_received,
       coalesce(t.approved_at, t.purchased_at, t.created_at) as purchased_at, t.refunded_at
from transactions t left join products p using (product_id)
where t.transaction_status in ('approved', 'refunded', 'chargeback');
alter view purchase_history set (security_invoker = true);
revoke all on purchase_history from anon, authenticated;

-- ───────────── IDs externos de mídia (§55, RF-099) ─────────────
alter table sessions add column if not exists external_campaign_id text;
alter table sessions add column if not exists external_adset_id text;
alter table sessions add column if not exists external_ad_id text;
alter table events   add column if not exists external_campaign_id text;
alter table events   add column if not exists external_adset_id text;
alter table events   add column if not exists external_ad_id text;
create index if not exists sessions_utm_content_idx on sessions (utm_content) where utm_content is not null;
create index if not exists sessions_utm_campaign_idx on sessions (utm_campaign) where utm_campaign is not null;
create index if not exists sessions_ext_campaign_idx on sessions (external_campaign_id) where external_campaign_id is not null;

-- ───────────── ContentPerformance (§53, RF-096) ─────────────
-- Uma linha por conteúdo e plataforma: a métrica mais recente substitui a anterior.
create table if not exists content_performance (
  id                          uuid primary key default gen_random_uuid(),
  content_id                  text not null,
  platform                    text not null
    check (platform in ('instagram','facebook','linkedin','youtube','tiktok','other')),
  published_at                timestamptz,
  content_type                text
    check (content_type in ('reel','story','carousel','static_post','video','article','newsletter','other')),
  dimension                   text,
  editorial_universe          text
    check (editorial_universe in ('eu_me_vi_aqui','ju_pensa','historias','cultura_explica_a_vida','ferramentas','movimento')),
  organic_or_paid             text not null default 'organic' check (organic_or_paid in ('organic','paid','hybrid')),
  campaign_id                 text,
  views                       bigint,
  reach                       bigint,
  impressions                 bigint,
  watch_time_seconds          numeric(14,2),
  average_watch_time_seconds  numeric(10,2),
  retention_rate              numeric(6,2),   -- em %, 0 a 100
  saves                       integer,
  shares                      integer,
  comments                    integer,
  profile_visits              integer,
  link_clicks                 integer,
  source_updated_at           timestamptz,
  source_system               text not null default 'manual',
  source_record_id            text not null,
  ingested_at                 timestamptz not null default now(),
  processing_status           text not null default 'processed' check (processing_status in ('pending','processed','failed')),
  processing_error            text,
  unique (platform, content_id),
  unique (source_system, source_record_id)
);
create index if not exists content_performance_content_idx on content_performance (content_id);

-- ───────────── CampaignPerformance (§54, RF-098) ─────────────
-- Granularidade: dia + plataforma + campanha + conjunto + anúncio.
-- NULLS NOT DISTINCT: linha sem conjunto/anúncio também não duplica.
create table if not exists campaign_performance (
  id                  uuid primary key default gen_random_uuid(),
  performance_date    date not null,
  platform            text not null default 'meta' check (platform in ('meta','google','linkedin','tiktok','other')),
  account_id          text,
  campaign_id         text,
  campaign_name       text,
  adset_id            text,
  adset_name          text,
  ad_id               text,
  ad_name             text,
  utm_source          text,
  utm_medium          text,
  utm_campaign        text,
  utm_content         text,
  spend               numeric(12,2) not null default 0 check (spend >= 0),
  impressions         bigint,
  reach               bigint,
  clicks              bigint,
  landing_page_views  bigint,
  platform_leads      integer,   -- métrica da plataforma: não substitui os eventos do site
  platform_purchases  integer,
  fase                smallint check (fase between 1 and 5),
  source_updated_at   timestamptz,
  source_system       text not null default 'manual',
  source_record_id    text not null,
  ingested_at         timestamptz not null default now(),
  processing_status   text not null default 'processed' check (processing_status in ('pending','processed','failed')),
  processing_error    text,
  unique (source_system, source_record_id)
);
create unique index if not exists campaign_performance_grao_uniq
  on campaign_performance (performance_date, platform, campaign_id, adset_id, ad_id) nulls not distinct;
create index if not exists campaign_performance_campanha_idx on campaign_performance (utm_campaign, performance_date);

-- ───────────── Receivable (§57, §58, RF-104 a RF-109) ─────────────
create table if not exists receivables (
  receivable_id           uuid primary key default gen_random_uuid(),
  provider                text not null default 'kiwify',
  transaction_id          text not null,
  installment_number      integer not null default 1 check (installment_number >= 1),
  installment_total       integer not null default 1,
  expected_amount         numeric(10,2) not null check (expected_amount >= 0),  -- líquido esperado
  expected_date           date,
  received_amount         numeric(10,2),
  received_date           date,
  receivable_status       text not null default 'scheduled' check (receivable_status in
    ('pending','scheduled','received','overdue','cancelled','refunded','chargeback')),
  fee_amount              numeric(10,2),
  net_received_amount     numeric(10,2),
  provider_receivable_id  text,
  source_updated_at       timestamptz,
  source_system           text not null default 'manual',
  source_record_id        text not null,
  ingested_at             timestamptz not null default now(),
  processing_status       text not null default 'processed' check (processing_status in ('pending','processed','failed')),
  processing_error        text,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now(),
  check (installment_total >= installment_number),
  foreign key (provider, transaction_id) references transactions (provider, transaction_id),
  unique (provider, transaction_id, installment_number),
  unique (source_system, source_record_id)
);
create index if not exists receivables_status_data_idx on receivables (receivable_status, expected_date);

-- Vendas já registradas: a Kiwify informa uma data prevista de depósito
-- (estimated_deposit_date, gravada em received_at) e o líquido. Vira um
-- recebível 1/1 agendado. Sem data ou sem líquido, nada é inventado.
insert into receivables (provider, transaction_id, installment_number, installment_total, expected_amount,
                         expected_date, receivable_status, fee_amount, source_system, source_record_id, source_updated_at)
select t.provider, t.transaction_id, 1, 1, t.amount_net, (t.received_at at time zone 'UTC')::date,
       case t.transaction_status when 'approved' then 'scheduled' else t.transaction_status end,
       t.amount_fee, 'kiwify_webhook', t.provider || ':' || t.transaction_id || ':1', t.updated_at
from transactions t
where t.transaction_status in ('approved', 'refunded', 'chargeback')
  and t.received_at is not null and t.amount_net is not null
on conflict do nothing;

-- ───────────── Registro de cargas (§62, RF-116, RF-117) ─────────────
create table if not exists ingestion_runs (
  id                 bigint generated always as identity primary key,
  entity             text not null check (entity in ('content_performance','campaign_performance','receivables')),
  source_system      text not null,
  file_name          text,
  started_at         timestamptz not null default now(),
  finished_at        timestamptz,
  rows_total         integer not null default 0,
  rows_ok            integer not null default 0,
  rows_failed        integer not null default 0,
  errors             jsonb,
  processing_status  text not null default 'pending' check (processing_status in ('pending','processed','partial','failed'))
);
create index if not exists ingestion_runs_entity_idx on ingestion_runs (entity, started_at desc);

-- ───────────── Investimento unificado ─────────────
-- Economia lê daqui: gasto importado (campaign_performance) + lançamento
-- manual (media_spend). Não lançar à mão o que já veio no CSV da plataforma.
-- Chave de campanha: utm_campaign; linha da mesma campanha sem utm herda o
-- utm das outras linhas dela; sem nenhum, o nome; sem nome, o id.
create or replace view investimento_midia as
select 'importado'::text as origem, c.performance_date as data, c.platform as canal,
       coalesce(nullif(lower(c.utm_campaign), ''),
                max(nullif(lower(c.utm_campaign), '')) over (partition by c.platform, c.campaign_id),
                nullif(lower(c.campaign_name), ''), nullif(c.campaign_id, '')) as campanha,
       coalesce(nullif(lower(c.utm_content), ''),
                case when c.ad_id is not null
                     then max(nullif(lower(c.utm_content), '')) over (partition by c.platform, c.ad_id) end) as criativo,
       c.campaign_id, c.ad_id, c.fase, c.spend as valor, c.ingested_at as registrado_em
from campaign_performance c where c.processing_status = 'processed'
union all
select 'manual', m.period_start, m.channel, nullif(lower(m.campaign), ''), nullif(lower(m.content), ''),
       null, null, m.fase, m.amount, m.created_at
from media_spend m;
alter view investimento_midia set (security_invoker = true);
revoke all on investimento_midia from anon, authenticated;

alter table content_performance  enable row level security;
alter table campaign_performance enable row level security;
alter table receivables          enable row level security;
alter table ingestion_runs       enable row level security;
