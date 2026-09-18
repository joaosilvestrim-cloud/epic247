-- EPIC247 — Funil, abandono do quiz e perfil das visitas (set/2026)
--
-- Amplia a origem_eventos (criada no 003_origem.sql) para o /admin mostrar:
--   1. Funil: visitou → viu a oferta → começou o quiz → respondeu tudo →
--      deixou o e-mail → clicou em comprar
--   2. Abandono do quiz: até qual das 15 perguntas as pessoas chegam
--   3. Perfil: aparelho, navegador do Instagram, estado, cidade e horário
--
-- Rodar DEPOIS do 003_origem.sql. Pode rodar de novo sem problema.
-- Não apaga nada do que já foi gravado.

-- ── 1. Novos tipos de evento ───────────────────────────────────────────
alter table public.origem_eventos drop constraint if exists origem_eventos_tipo_check;
alter table public.origem_eventos add constraint origem_eventos_tipo_check
  check (tipo in ('visita', 'checkout', 'oferta_vista', 'quiz_inicio', 'quiz_etapa'));

-- ── 2. Dados da visita ─────────────────────────────────────────────────
-- Cidade e estado vêm da Vercel (pela conexão). O IP em si não é guardado.
alter table public.origem_eventos add column if not exists etapa        smallint;
alter table public.origem_eventos add column if not exists dispositivo  text;
alter table public.origem_eventos add column if not exists sistema      text;
alter table public.origem_eventos add column if not exists app          text;
alter table public.origem_eventos add column if not exists pais         text;
alter table public.origem_eventos add column if not exists estado       text;
alter table public.origem_eventos add column if not exists cidade       text;

create index if not exists origem_eventos_tipo_idx
  on public.origem_eventos (tipo, created_at desc);

-- ── 3. Funil ───────────────────────────────────────────────────────────
-- Conta PESSOAS (visitante_id distinto), não cliques. p_source/p_medium
-- nulos = todas as origens.
create or replace function public.origem_funil(
  p_desde  timestamptz,
  p_source text default null,
  p_medium text default null
)
returns table (etapa text, ordem int, pessoas bigint)
language sql
stable
security definer
set search_path = public
as $$
  with ev as (
    select e.tipo, e.etapa, e.visitante_id
    from public.origem_eventos e
    where e.created_at >= p_desde
      and (p_source is null or coalesce(nullif(e.utm_source, ''), '(sem origem)') = p_source)
      and (p_medium is null or coalesce(e.utm_medium, '') = p_medium)
  ),
  ld as (
    select count(*) as n
    from public.leads l
    where l.created_at >= p_desde
      and (p_source is null or coalesce(nullif(l.utm_source, ''), '(sem origem)') = p_source)
      and (p_medium is null or coalesce(l.utm_medium, '') = p_medium)
  )
  select 'Visitou o site', 1,
         (select count(distinct visitante_id) from ev where tipo = 'visita')
  union all
  select 'Viu a oferta', 2,
         (select count(distinct visitante_id) from ev where tipo = 'oferta_vista')
  union all
  select 'Começou o quiz', 3,
         (select count(distinct visitante_id) from ev where tipo = 'quiz_inicio')
  union all
  select 'Respondeu as 15 perguntas', 4,
         (select count(distinct visitante_id) from ev where tipo = 'quiz_etapa' and etapa >= 15)
  union all
  select 'Deixou o e-mail', 5, (select n from ld)
  union all
  select 'Clicou em comprar', 6,
         (select count(distinct visitante_id) from ev where tipo = 'checkout')
  order by 2;
$$;

-- ── 4. Abandono do quiz ────────────────────────────────────────────────
-- Quantas pessoas responderam cada pergunta. A queda entre uma pergunta e
-- a seguinte é onde o quiz perde gente.
create or replace function public.origem_quiz_etapas(
  p_desde  timestamptz,
  p_source text default null,
  p_medium text default null
)
returns table (etapa int, pessoas bigint)
language sql
stable
security definer
set search_path = public
as $$
  select e.etapa::int, count(distinct e.visitante_id)
  from public.origem_eventos e
  where e.tipo = 'quiz_etapa'
    and e.created_at >= p_desde
    and (p_source is null or coalesce(nullif(e.utm_source, ''), '(sem origem)') = p_source)
    and (p_medium is null or coalesce(e.utm_medium, '') = p_medium)
  group by 1
  order by 1;
$$;

-- ── 5. Perfil das visitas ──────────────────────────────────────────────
-- Uma linha por (dimensão, valor). Horário no fuso de Brasília.
-- dia_semana: 0 = domingo ... 6 = sábado.
create or replace function public.origem_perfil(
  p_desde  timestamptz,
  p_source text default null,
  p_medium text default null
)
returns table (dimensao text, valor text, visitantes bigint)
language sql
stable
security definer
set search_path = public
as $$
  with v as (
    select *,
           created_at at time zone 'America/Sao_Paulo' as local
    from public.origem_eventos e
    where e.tipo = 'visita'
      and e.created_at >= p_desde
      and (p_source is null or coalesce(nullif(e.utm_source, ''), '(sem origem)') = p_source)
      and (p_medium is null or coalesce(e.utm_medium, '') = p_medium)
  )
  select 'dispositivo', coalesce(dispositivo, 'desconhecido'), count(distinct visitante_id)
    from v group by 2
  union all
  select 'sistema', coalesce(sistema, 'desconhecido'), count(distinct visitante_id)
    from v group by 2
  union all
  select 'app', coalesce(app, 'navegador'), count(distinct visitante_id)
    from v group by 2
  union all
  select 'estado', coalesce(estado, 'desconhecido'), count(distinct visitante_id)
    from v where coalesce(pais, 'BR') = 'BR' group by 2
  union all
  select 'cidade', cidade || coalesce(' · ' || estado, ''), count(distinct visitante_id)
    from v where cidade is not null group by 2
  union all
  select 'pais', coalesce(pais, 'desconhecido'), count(distinct visitante_id)
    from v group by 2
  union all
  select 'hora', extract(hour from local)::int::text, count(*)
    from v group by 2
  union all
  select 'dia_semana', extract(dow from local)::int::text, count(*)
    from v group by 2;
$$;

-- Só o servidor chama.
revoke all on function public.origem_funil(timestamptz, text, text) from public, anon, authenticated;
revoke all on function public.origem_quiz_etapas(timestamptz, text, text) from public, anon, authenticated;
revoke all on function public.origem_perfil(timestamptz, text, text) from public, anon, authenticated;
grant execute on function public.origem_funil(timestamptz, text, text) to service_role;
grant execute on function public.origem_quiz_etapas(timestamptz, text, text) to service_role;
grant execute on function public.origem_perfil(timestamptz, text, text) to service_role;
