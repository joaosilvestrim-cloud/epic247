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
