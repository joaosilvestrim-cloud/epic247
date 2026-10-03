-- CR-01 e Adendo CR-01A: entrega interna e Meu EPIC.
-- A Kiwify continua só como checkout. O EPIC247 concede o acesso (access_grants),
-- autentica por link de uso único (auth_tokens, auth_sessions), guarda os
-- materiais pagos em storage privado (product_assets) e registra o progresso
-- do Protocolo (protocol_progress). Nada do que existe é alterado, só acrescentado.

-- ───────────────────────────── ACESSOS ─────────────────────────────
create table if not exists access_grants (
  grant_id               uuid primary key default gen_random_uuid(),
  lead_id                uuid not null references leads(lead_id),
  product_id             text not null references products(product_id),
  product_type           text not null check (product_type in ('plan','kit','protocol','mentoring')),
  -- dimensão (Plano e Kit), 'protocol' ou 'mentoring'
  scope                  text not null,
  access_status          text not null default 'active' check (access_status in ('active','suspended','revoked')),
  source                 text not null default 'purchase' check (source in ('purchase','admin','migration')),
  provider               text,
  source_transaction_id  text,
  map_result_id          uuid references map_results(map_result_id),
  granted_at             timestamptz not null default now(),
  revoked_at             timestamptz,
  status_reason          text,
  updated_at             timestamptz not null default now()
);
-- Webhook repetido não cria acesso repetido (CR-01, critério 2).
create unique index if not exists access_grants_transacao_uniq
  on access_grants (provider, source_transaction_id, product_id) where source_transaction_id is not null;
create index if not exists access_grants_lead_idx on access_grants (lead_id, access_status);

-- ───────────────────────────── AUTENTICAÇÃO ─────────────────────────────
-- Só o hash do token e da sessão fica no banco: vazamento do banco não abre conta.
create table if not exists auth_tokens (
  token_hash   text primary key,
  lead_id      uuid not null references leads(lead_id),
  purpose      text not null check (purpose in ('login','compra')),
  email        text not null,
  next_path    text,
  created_at   timestamptz not null default now(),
  expires_at   timestamptz not null,
  used_at      timestamptz
);
create index if not exists auth_tokens_lead_idx on auth_tokens (lead_id, created_at desc);

create table if not exists auth_sessions (
  session_hash  text primary key,
  lead_id       uuid not null references leads(lead_id),
  created_at    timestamptz not null default now(),
  expires_at    timestamptz not null,
  last_seen_at  timestamptz not null default now(),
  ended_at      timestamptz,
  device        text
);
create index if not exists auth_sessions_lead_idx on auth_sessions (lead_id);

-- ───────────────────────────── MATERIAIS ─────────────────────────────
create table if not exists product_assets (
  asset_id      uuid primary key default gen_random_uuid(),
  product_type  text not null check (product_type in ('kit','protocol')),
  dimension     text not null,
  asset_kind    text not null check (asset_kind in ('manual','workbook','ferramenta','outro')),
  title         text not null,
  storage_path  text not null,
  file_name     text not null,
  file_size     bigint,
  version       integer not null default 1,
  published     boolean not null default false,
  sort_order    integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists product_assets_dim_idx on product_assets (product_type, dimension, published);

-- Transição: produto que ainda é entregue pela área da Kiwify (o Kit Energia
-- do Ciclo 1) continua à venda sem materiais no Meu EPIC. Ao publicar os
-- materiais, o admin troca a entrega para 'epic'.
alter table products add column if not exists delivery text not null default 'epic'
  check (delivery in ('epic','kiwify'));
update products set delivery = 'kiwify' where product_id = 'kit_energia' and checkout_url is not null;

-- ───────────────────────────── PROGRESSO DO PROTOCOLO ─────────────────────────────
-- Em andamento = abriu ou baixou material da dimensão. Concluído = a pessoa marcou.
create table if not exists protocol_progress (
  lead_id       uuid not null references leads(lead_id),
  dimension     text not null,
  status        text not null check (status in ('in_progress','completed')),
  started_at    timestamptz not null default now(),
  completed_at  timestamptz,
  updated_at    timestamptz not null default now(),
  primary key (lead_id, dimension)
);

alter table access_grants enable row level security;
alter table auth_tokens enable row level security;
alter table auth_sessions enable row level security;
alter table product_assets enable row level security;
alter table protocol_progress enable row level security;

-- Compras aprovadas anteriores (se houver) ganham o acesso correspondente.
insert into access_grants (lead_id, product_id, product_type, scope, provider, source_transaction_id, granted_at, source)
select t.lead_id, t.product_id, p.product_type,
       case when p.product_type in ('plan','kit') then p.product_dimension else p.product_type end,
       t.provider, t.transaction_id, coalesce(t.approved_at, t.created_at), 'migration'
from transactions t join products p using (product_id)
where t.transaction_status = 'approved' and t.lead_id is not null
on conflict do nothing;
