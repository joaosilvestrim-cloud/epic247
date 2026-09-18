-- EPIC247 — Origem do tráfego (set/2026)
--
-- Guarda de onde veio cada visita (utm da bio do Instagram, stories, Google,
-- acesso direto...) e leva essa origem junto para o lead do quiz, para o
-- /admin mostrar visitas → leads → cliques em comprar por fonte.
--
-- Rodar UMA vez no SQL Editor do Supabase. Pode rodar de novo sem problema:
-- tudo usa "if not exists" / "or replace".

-- ── 1. Eventos de origem ───────────────────────────────────────────────
-- Uma linha por visita (1 por sessão do navegador) e por clique no botão
-- de compra. Não guarda IP nem nada que identifique a pessoa: o
-- visitante_id é um código aleatório gerado no navegador.
create table if not exists public.origem_eventos (
  id            bigint generated always as identity primary key,
  created_at    timestamptz not null default now(),
  tipo          text not null check (tipo in ('visita', 'checkout')),
  visitante_id  text,
  utm_source    text,
  utm_medium    text,
  utm_campaign  text,
  utm_content   text,
  referrer      text,
  pagina        text
);

create index if not exists origem_eventos_created_at_idx
  on public.origem_eventos (created_at desc);
create index if not exists origem_eventos_fonte_idx
  on public.origem_eventos (utm_source, utm_medium);

-- Gravação só pelo servidor (service role). Sem policy pública, de propósito.
alter table public.origem_eventos enable row level security;

-- ── 2. Origem no lead ──────────────────────────────────────────────────
alter table public.leads add column if not exists utm_source   text;
alter table public.leads add column if not exists utm_medium   text;
alter table public.leads add column if not exists utm_campaign text;
alter table public.leads add column if not exists utm_content  text;
alter table public.leads add column if not exists referrer     text;
alter table public.leads add column if not exists visitante_id text;

-- ── 3. Resumo por fonte (usado pelo /admin) ────────────────────────────
-- Agrega no banco para o painel não precisar baixar linha por linha.
-- Leads anteriores a esta migration ficam com fonte "(sem origem)".
create or replace function public.origem_resumo(p_desde timestamptz)
returns table (
  utm_source  text,
  utm_medium  text,
  visitantes  bigint,
  visitas     bigint,
  checkouts   bigint,
  leads       bigint
)
language sql
stable
security definer
set search_path = public
as $$
  with ev as (
    select
      coalesce(nullif(e.utm_source, ''), '(sem origem)') as src,
      coalesce(nullif(e.utm_medium, ''), '')             as med,
      count(distinct e.visitante_id) filter (where e.tipo = 'visita') as visitantes,
      count(*) filter (where e.tipo = 'visita')                      as visitas,
      count(*) filter (where e.tipo = 'checkout')                    as checkouts
    from public.origem_eventos e
    where e.created_at >= p_desde
    group by 1, 2
  ),
  ld as (
    select
      coalesce(nullif(l.utm_source, ''), '(sem origem)') as src,
      coalesce(nullif(l.utm_medium, ''), '')             as med,
      count(*) as leads
    from public.leads l
    where l.created_at >= p_desde
    group by 1, 2
  )
  select
    coalesce(ev.src, ld.src)          as utm_source,
    coalesce(ev.med, ld.med)          as utm_medium,
    coalesce(ev.visitantes, 0)        as visitantes,
    coalesce(ev.visitas, 0)           as visitas,
    coalesce(ev.checkouts, 0)         as checkouts,
    coalesce(ld.leads, 0)             as leads
  from ev
  full outer join ld on ld.src = ev.src and ld.med = ev.med
  order by visitas desc, leads desc;
$$;

-- Só o servidor chama. Tira o acesso dos papéis públicos.
revoke all on function public.origem_resumo(timestamptz) from public, anon, authenticated;
grant execute on function public.origem_resumo(timestamptz) to service_role;
