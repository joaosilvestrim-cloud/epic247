-- Fecha o "Modelo de Dados, Eventos e Campos CRM v1.0" e o que o Modelo
-- Financeiro, o Sistema Editorial e o Blueprint pedem de dados:
--   §11 first_product / last_product        §24 campos de automação
--   §25 frequency cap calculado              §27 flags de supressão
--   §23 checkout com status                  §30 purchase_history
--   §46 webhooks site → CRM (fila)           Blueprint §29 rate limiting
--   Financeiro §10/§15 investimento em mídia Editorial §7 banco de ideias
--   Funis §44 envio de edição da newsletter

-- ── lead_profile: tudo derivado, nada duplicado ──
drop view if exists lead_profile;
create view lead_profile as
select
  l.*,
  coalesce(c.plan_purchased, false)      as plan_purchased,
  coalesce(c.kit_purchased, false)       as kit_purchased,
  coalesce(c.protocol_purchased, false)  as protocol_purchased,
  coalesce(c.mentoring_purchased, false) as mentoring_purchased,
  c.kits_owned,
  c.products_owned,
  coalesce(c.lifetime_revenue_gross, 0)  as lifetime_revenue_gross,
  coalesce(c.lifetime_revenue_net, 0)    as lifetime_revenue_net,
  coalesce(c.lifetime_cash_received, 0)  as lifetime_cash_received,
  c.customer_since,
  c.last_purchase_at,
  h.first_product,
  h.last_product,
  -- §24 campos de automação
  m.current_automation_id,
  m.last_automation_at,
  m.last_email_sent_at,
  m.last_email_opened_at,
  m.last_email_clicked_at,
  coalesce(m.email_send_count_7d, 0)            as email_send_count_7d,
  coalesce(m.non_transactional_messages_24h, 0) as non_transactional_messages_24h,
  -- §27 flags de supressão (lógicas, calculadas na hora)
  coalesce(c.protocol_purchased, false) as suppress_plan_offer,
  coalesce(c.protocol_purchased, false) as suppress_protocol_offer,
  (coalesce(c.mentoring_purchased, false) or l.unsubscribed_at is not null
     or not l.marketing_email_allowed or l.email_bounced_at is not null) as suppress_promotional_email,
  coalesce(c.products_owned, '{}')      as suppress_paid_remarketing_product
from leads l
left join lateral (
  select
    bool_or(p.product_type = 'plan')      as plan_purchased,
    bool_or(p.product_type = 'kit')       as kit_purchased,
    bool_or(p.product_type = 'protocol')  as protocol_purchased,
    bool_or(p.product_type = 'mentoring') as mentoring_purchased,
    array_agg(distinct p.product_dimension) filter (where p.product_type = 'kit') as kits_owned,
    array_agg(distinct t.product_id) as products_owned,
    sum(t.amount_gross)    as lifetime_revenue_gross,
    sum(t.amount_net)      as lifetime_revenue_net,
    sum(t.amount_received) as lifetime_cash_received,
    min(t.approved_at)     as customer_since,
    max(t.approved_at)     as last_purchase_at
  from transactions t join products p using (product_id)
  where t.lead_id = l.lead_id and t.transaction_status = 'approved'
) c on true
left join lateral (
  -- Primeiro e último produto comprados (mesmo que depois reembolsados: é histórico).
  select
    (array_agg(t.product_id order by coalesce(t.approved_at, t.created_at)))[1] as first_product,
    (array_agg(t.product_id order by coalesce(t.approved_at, t.created_at) desc))[1] as last_product
  from transactions t
  where t.lead_id = l.lead_id and t.transaction_status in ('approved', 'refunded', 'chargeback')
) h on true
left join lateral (
  select
    (select m2.automation_id from messages m2 where m2.lead_id = l.lead_id and m2.status = 'scheduled'
      order by m2.scheduled_for limit 1) as current_automation_id,
    max(ms.sent_at) as last_automation_at,
    max(ms.sent_at) filter (where ms.status = 'sent') as last_email_sent_at,
    max(ms.opened_at)  as last_email_opened_at,
    max(ms.clicked_at) as last_email_clicked_at,
    count(*) filter (where ms.status = 'sent' and ms.sent_at > now() - interval '7 days') as email_send_count_7d,
    count(*) filter (where ms.status = 'sent' and ms.priority >= 4 and ms.sent_at > now() - interval '24 hours')
      as non_transactional_messages_24h
  from messages ms where ms.lead_id = l.lead_id
) m on true
where l.merged_into is null;

alter view lead_profile set (security_invoker = true);
revoke all on lead_profile from anon, authenticated;

-- ── §30 histórico de compras ──
create or replace view purchase_history as
select t.lead_id, t.product_id, p.product_type, p.product_dimension, t.provider, t.transaction_id,
       t.transaction_status as status, t.amount_gross, t.amount_net, t.amount_received,
       coalesce(t.approved_at, t.purchased_at, t.created_at) as purchased_at, t.refunded_at
from transactions t left join products p using (product_id);
alter view purchase_history set (security_invoker = true);
revoke all on purchase_history from anon, authenticated;

-- ── §23 checkout: cada StartCheckout é um checkout_id ──
create or replace view checkouts as
select
  e.event_id   as checkout_id,
  e.lead_id,
  e.product_id as checkout_product_id,
  e.occurred_at as checkout_started_at,
  case
    when ok.transaction_id is not null then 'completed'
    when e.occurred_at < now() - interval '72 hours' then 'expired'
    when e.occurred_at < now() - interval '1 hour' then 'abandoned'
    else 'started'
  end as checkout_status,
  case when ok.transaction_id is null and e.occurred_at < now() - interval '1 hour'
       then e.occurred_at + interval '1 hour' end as checkout_abandoned_at,
  ok.transaction_id,
  e.utm_source, e.utm_medium, e.utm_campaign, e.utm_content
from events e
left join lateral (
  select t.transaction_id from transactions t
  where t.lead_id = e.lead_id and t.product_id = e.product_id
    and t.transaction_status in ('approved', 'refunded', 'chargeback')
    and coalesce(t.approved_at, t.created_at) >= e.occurred_at - interval '5 minutes'
  order by coalesce(t.approved_at, t.created_at) limit 1
) ok on true
where e.event_name = 'StartCheckout';
alter view checkouts set (security_invoker = true);
revoke all on checkouts from anon, authenticated;

-- ── §46 fila de saída para CRM externo ──
create table if not exists crm_outbox (
  id                 bigint generated always as identity primary key,
  lead_id            uuid references leads(lead_id),
  event_type         text not null,
  payload            jsonb not null,
  created_at         timestamptz not null default now(),
  processing_status  text not null default 'pending'
    check (processing_status in ('pending','processed','failed','skipped')),
  processing_error   text,
  retry_count        integer not null default 0,
  last_retry_at      timestamptz,
  sent_at            timestamptz
);
create index if not exists crm_outbox_pending_idx on crm_outbox (created_at) where processing_status in ('pending','failed');
alter table crm_outbox enable row level security;

-- ── Blueprint §29 limite de requisições (janela fixa por chave) ──
create table if not exists rate_limits (
  chave    text not null,
  janela   timestamptz not null,
  contagem integer not null default 0,
  primary key (chave, janela)
);
alter table rate_limits enable row level security;

-- ── Financeiro §10/§15 investimento em mídia ──
create table if not exists media_spend (
  id           uuid primary key default gen_random_uuid(),
  period_start date not null,
  period_end   date not null,
  channel      text not null default 'meta',
  campaign     text,
  content      text,
  fase         smallint check (fase between 1 and 5),
  amount       numeric(10,2) not null check (amount >= 0),
  notes        text,
  created_at   timestamptz not null default now(),
  check (period_end >= period_start)
);
alter table media_spend enable row level security;

-- ── Editorial §7: a unidade é a IDEIA, não o post ──
create table if not exists editorial_ideas (
  id            uuid primary key default gen_random_uuid(),
  ideia_mae     text not null,
  tensao        text,
  dimensao      text,
  estado_icp    text check (estado_icp in ('funcional_exausto','lucido_imovel','bem_sucedido_desalinhado',
                  'decidido_com_medo','inquieto_em_expansao')),
  universo      text check (universo in ('eu_me_vi_aqui','ju_pensa','historias','cultura','ferramentas','movimento')),
  gatilho       text check (gatilho in ('contradicao','custo','reconhecimento','possibilidade')),
  objetivo      text check (objetivo in ('atencao','reconhecimento','movimento')),
  formato_mae   text,
  cta_nivel     smallint check (cta_nivel between 0 and 3),
  produto_id    text references products(product_id),
  status        text not null default 'ideia' check (status in ('ideia','producao','publicada','arquivada')),
  notas         text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create table if not exists editorial_derivations (
  id               uuid primary key default gen_random_uuid(),
  idea_id          uuid not null references editorial_ideas(id) on delete cascade,
  formato          text not null,
  canal            text not null default 'instagram',
  codigo           text not null unique,          -- vira utm_content: liga a peça a visitas, Mapas e receita
  destino          text not null default '/mapa',
  pago             boolean not null default false,
  publicado_em     date,
  views            integer,
  retencao_3s      numeric(5,2),
  retencao_50      numeric(5,2),
  salvamentos      integer,
  compartilhamentos integer,
  relatos          integer,                        -- §11: respostas contando a própria vida
  notas            text,
  created_at       timestamptz not null default now()
);
create index if not exists editorial_derivations_idea_idx on editorial_derivations (idea_id);
alter table editorial_ideas enable row level security;
alter table editorial_derivations enable row level security;

-- ── Funis §44 edição da newsletter enviada pelo admin ──
alter table content_items add column if not exists newsletter_sent_at timestamptz;
alter table content_items add column if not exists newsletter_recipients integer;
