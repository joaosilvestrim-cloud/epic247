-- EPIC247 — schema do Supabase
-- Tabela de leads capturados pelo Quiz de Diagnóstico dos 5 Drenos.

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  nome text,
  email text not null,
  dreno_dominante text not null,
  dreno_secundario text,
  scores jsonb,
  origem text default 'quiz_5_drenos',
  created_at timestamptz not null default now()
);

create index if not exists leads_email_idx on public.leads (email);
create index if not exists leads_created_at_idx on public.leads (created_at desc);

-- RLS ligado. A gravação acontece via Service Role (rota /api/lead), que
-- ignora RLS por padrão. Nenhuma policy de INSERT pública é criada de
-- propósito, para evitar spam direto no banco a partir do client anônimo.
alter table public.leads enable row level security;

-- ============================================================
-- Configurações dinâmicas do site (editáveis pelo /admin):
-- URL do vídeo da VSL e da foto da Ju Ferreira.
-- Lidas e gravadas via Service Role (servidor).
-- ============================================================
create table if not exists public.settings (
  key        text primary key,
  value      text,
  updated_at timestamptz default now()
);

alter table public.settings enable row level security;

-- ============================================================
-- Storage: bucket público "assets" para vídeo e imagens.
-- Upload feito via signed URL (token gerado pela Service Role);
-- leitura pública pela URL do arquivo.
-- ============================================================
insert into storage.buckets (id, name, public)
values ('assets', 'assets', true)
on conflict (id) do nothing;

-- ============================================================
-- Gestão de Tarefas (painel /admin)
-- ============================================================
create table if not exists public.tarefas (
  id           uuid primary key default gen_random_uuid(),
  titulo       text not null,
  descricao    text,
  categoria    text,
  responsavel  text,
  status       text not null default 'a_fazer',   -- a_fazer | fazendo | concluido
  prioridade   text not null default 'media',     -- baixa | media | alta
  prazo        date,
  ordem        int default 0,
  concluido_em timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists tarefas_status_idx on public.tarefas (status);
create index if not exists tarefas_prazo_idx on public.tarefas (prazo);

-- RLS ligado. Toda a gestão acontece via Service Role nas rotas /api/admin/tarefas.
alter table public.tarefas enable row level security;

-- Recarrega o cache de schema do PostgREST
notify pgrst, 'reload schema';
