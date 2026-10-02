import "server-only";
import { lerCsv } from "../kpi/csv";
import {
  linhasCampanha, linhasConteudo, linhasRecebiveis, type Falha, type LinhaCampanha, type LinhaConteudo, type LinhaRecebivel,
} from "../kpi/importacao";
import {
  economiaKpi, resumoCaixa, resumoVendas, retencaoPonderada, type BaseEconomia, type RecebivelValor,
} from "../kpi/metricas";
import { DIAS_PERIODO, exigirAdmin, type Periodo } from "./admin";
import { query, withTx, type Q } from "./db";

// Camada KPI / BI (Blueprint §37-§53, Modelo de Dados §52-§64). Consultas do
// painel semanal e ingestão idempotente de dados externos. As contas ficam
// em ../kpi/metricas (puro, testado); aqui só se busca e se grava.

const desde = (p: Periodo) => new Date(Date.now() - DIAS_PERIODO[p] * 864e5).toISOString();
const n = (v: unknown) => Number(v ?? 0);
const nn = (v: unknown) => (v == null ? null : Number(v));
/** Hoje no fuso do negócio, AAAA-MM-DD. */
export const hojeSP = () => new Date().toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" });

/** SQL: caixa de cada transação a partir dos recebíveis (mesma regra de resumoCaixa). */
const CAIXA_POR_TRANSACAO = `
  select provider, transaction_id,
         sum(case when receivable_status = 'received' then coalesce(net_received_amount, received_amount, expected_amount)
                  when receivable_status = 'scheduled' and source_system = 'kiwify_webhook'
                       and expected_date <= (now() at time zone 'America/Sao_Paulo')::date then expected_amount
                  else 0 end) as caixa
  from receivables group by 1, 2`;

// ───────────── Atribuição de mídia (§55, §56) ─────────────

export type CorteMidia = "campanha" | "criativo";

/** Colunas por corte. Whitelist: nunca vem da requisição. */
const CORTE = {
  campanha: { gasto: "campanha", id: "campaign_id", lead: "last_touch_campaign", utm: "utm_campaign", ext: "external_campaign_id" },
  criativo: { gasto: "criativo", id: "ad_id", lead: "last_touch_content", utm: "utm_content", ext: "external_ad_id" },
} as const;

function ctesAtribuicao(c: CorteMidia) {
  const k = CORTE[c];
  return `
  with g as (
    select ${k.gasto} as k, sum(valor) as investido, array_remove(array_agg(distinct ${k.id}), null) as ids
    from investimento_midia where data >= $1::date and ${k.gasto} is not null group by 1
  ),
  lp as (
    select distinct on (e.lead_id) e.lead_id, lower(l.${k.lead}) as k
    from events e join leads l using (lead_id)
    where e.event_name = 'SubmitMapEmail' and e.occurred_at >= $1
  ),
  tx as (
    select t.provider, t.transaction_id, t.lead_id, lower(t.${k.utm}) as k, t.amount_gross, t.amount_net,
           not exists (select 1 from transactions t0 where t0.lead_id = t.lead_id and t0.approved_at < t.approved_at
                         and t0.transaction_status in ('approved', 'refunded', 'chargeback')) as primeira
    from transactions t where t.transaction_status = 'approved' and t.approved_at >= $1
  ),
  cx as (${CAIXA_POR_TRANSACAO})`;
}

export interface LinhaAtribuicao {
  chave: string;
  investido: number;
  visitantes: number;
  leads: number;
  novos: number;
  compradores: number;
  vendas: number;
  bruto: number;
  liquido: number;
  caixa: number;
  cpl: number | null;
  cacPrimeiroProduto: number | null;
  cacCliente: number | null;
  roasBruto: number | null;
  roasLiquido: number | null;
  roasCaixa: number | null;
}

/** Gasto e resultado por campanha ou criativo, no mesmo período, pelo último toque. */
export async function atribuicaoMidia(p: Periodo, c: CorteMidia): Promise<LinhaAtribuicao[]> {
  await exigirAdmin();
  const k = CORTE[c];
  const rows = await query<Record<string, string>>(
    `${ctesAtribuicao(c)}
     select g.k, g.investido,
       (select count(distinct s.lead_id) from sessions s where s.session_started_at >= $1
          and (lower(s.${k.utm}) = g.k or s.${k.ext} = any(g.ids))) as visitantes,
       (select count(*) from lp where lp.k = g.k) as leads,
       (select count(distinct lead_id) from tx where tx.k = g.k and tx.primeira) as novos,
       (select count(distinct lead_id) from tx where tx.k = g.k) as compradores,
       (select count(*) from tx where tx.k = g.k) as vendas,
       (select coalesce(sum(amount_gross), 0) from tx where tx.k = g.k) as bruto,
       (select coalesce(sum(amount_net), 0) from tx where tx.k = g.k) as liquido,
       (select coalesce(sum(cx.caixa), 0) from tx join cx using (provider, transaction_id) where tx.k = g.k) as caixa
     from g order by g.investido desc limit 60`,
    [desde(p)]
  );
  return rows.map((r) => {
    const base = {
      chave: r.k, investido: n(r.investido), visitantes: n(r.visitantes), leads: n(r.leads), novos: n(r.novos),
      compradores: n(r.compradores), vendas: n(r.vendas), bruto: n(r.bruto), liquido: n(r.liquido), caixa: n(r.caixa),
    };
    const kpi = economiaKpi({
      gasto: base.investido, leads: base.leads, visitantes: base.visitantes, vendas: base.vendas, receitaBruta: base.bruto,
      leadsAtribuidos: base.leads, novosCompradoresAtribuidos: base.novos, compradoresUnicosAtribuidos: base.compradores,
      receitaBrutaAtribuida: base.bruto, receitaLiquidaAtribuida: base.liquido, caixaAtribuido: base.caixa,
    });
    return {
      ...base, cpl: kpi.cpl, cacPrimeiroProduto: kpi.cacPrimeiroProduto, cacCliente: kpi.cacCliente,
      roasBruto: kpi.roasBruto, roasLiquido: kpi.roasLiquido, roasCaixa: kpi.roasCaixa,
    };
  });
}

// ───────────── Painel semanal (Blueprint §44, Financeiro §15) ─────────────

export interface KpisSemana {
  conteudo: { publicados: number; videos: number; views: number; retencao: number | null; salvamentos: number; compartilhamentos: number };
  trafego: { sessoes: number; visitantes: number; origens: { chave: string; n: number }[]; dimensoes: { chave: string; n: number }[] };
  mapas: { iniciados: number; concluidos: number; leads: number };
  vendas: { tipo: string; n: number; bruto: number }[];
  economia: BaseEconomia & ReturnType<typeof economiaKpi>;
  caixa: KpiCaixa;
}

export async function kpisSemana(p: Periodo): Promise<KpisSemana> {
  await exigirAdmin();
  const d = desde(p);
  const [conteudo, [trafego], origens, dimensoes, [mapas], vendas, [eco], caixa] = await Promise.all([
    query<{ content_type: string | null; views: string | null; retention_rate: string | null; saves: string | null; shares: string | null }>(
      "select content_type, views, retention_rate, saves, shares from content_performance where published_at >= $1",
      [d]
    ),
    query<Record<string, string>>(
      "select count(*) sessoes, count(distinct lead_id) visitantes from sessions where session_started_at >= $1", [d]
    ),
    query<{ chave: string; n: string }>(
      `select fonte_normalizada(utm_source) chave, count(*) n from sessions where session_started_at >= $1
       group by 1 order by 2 desc limit 4`, [d]
    ),
    // Dimensão da visita: a página de entrada (dimensão, Mapa, Plano ou Kit).
    query<{ chave: string; n: string }>(
      `select substring(landing_page from '^/(?:dimensoes|mapas|plano|kit)/([a-z]+)') chave, count(*) n
       from sessions where session_started_at >= $1 and landing_page ~ '^/(dimensoes|mapas|plano|kit)/[a-z]+'
       group by 1 order by 2 desc limit 4`, [d]
    ),
    query<Record<string, string>>(
      `select (select count(*) from map_results where started_at >= $1) iniciados,
              (select count(*) from map_results where completed_at >= $1) concluidos,
              (select count(distinct lead_id) from events where event_name = 'SubmitMapEmail' and occurred_at >= $1) leads`,
      [d]
    ),
    query<{ tipo: string; n: string; bruto: string }>(
      `select p.product_type tipo, count(*) n, coalesce(sum(t.amount_gross), 0) bruto
       from transactions t join products p using (product_id)
       where t.transaction_status = 'approved' and t.approved_at >= $1 group by 1`,
      [d]
    ),
    query<Record<string, string>>(
      `${ctesAtribuicao("campanha")}
       select
         (select coalesce(sum(valor), 0) from investimento_midia where data >= $1::date) gasto,
         (select count(*) from lp where k in (select k from g)) leads_atrib,
         (select count(distinct lead_id) from tx where k in (select k from g) and primeira) novos,
         (select count(distinct lead_id) from tx where k in (select k from g)) compradores,
         (select coalesce(sum(amount_gross), 0) from tx where k in (select k from g)) bruto_atrib,
         (select coalesce(sum(amount_net), 0) from tx where k in (select k from g)) liquido_atrib,
         (select coalesce(sum(cx.caixa), 0) from tx join cx using (provider, transaction_id) where tx.k in (select k from g)) caixa_atrib,
         (select count(*) from lp) leads,
         (select count(*) from tx) vendas,
         (select coalesce(sum(amount_gross), 0) from tx) bruto,
         (select count(distinct lead_id) from sessions where session_started_at >= $1) visitantes`,
      [d]
    ),
    caixaDoPeriodo(d),
  ]);

  const base: BaseEconomia = {
    gasto: n(eco.gasto), leads: n(eco.leads), visitantes: n(eco.visitantes), vendas: n(eco.vendas), receitaBruta: n(eco.bruto),
    leadsAtribuidos: n(eco.leads_atrib), novosCompradoresAtribuidos: n(eco.novos), compradoresUnicosAtribuidos: n(eco.compradores),
    receitaBrutaAtribuida: n(eco.bruto_atrib), receitaLiquidaAtribuida: n(eco.liquido_atrib), caixaAtribuido: n(eco.caixa_atrib),
  };
  const conteudoNum = conteudo.map((c) => ({ ...c, views: nn(c.views), retention_rate: nn(c.retention_rate) }));
  return {
    conteudo: {
      publicados: conteudo.length,
      videos: conteudo.filter((c) => c.content_type === "reel" || c.content_type === "video").length,
      views: conteudoNum.reduce((a, c) => a + (c.views ?? 0), 0),
      retencao: retencaoPonderada(conteudoNum),
      salvamentos: conteudo.reduce((a, c) => a + n(c.saves), 0),
      compartilhamentos: conteudo.reduce((a, c) => a + n(c.shares), 0),
    },
    trafego: {
      sessoes: n(trafego.sessoes), visitantes: n(trafego.visitantes),
      origens: origens.map((o) => ({ chave: o.chave, n: n(o.n) })),
      dimensoes: dimensoes.map((o) => ({ chave: o.chave, n: n(o.n) })),
    },
    mapas: { iniciados: n(mapas.iniciados), concluidos: n(mapas.concluidos), leads: n(mapas.leads) },
    vendas: vendas.map((v) => ({ tipo: v.tipo, n: n(v.n), bruto: n(v.bruto) })),
    economia: { ...base, ...economiaKpi(base) },
    caixa,
  };
}

export type KpiCaixa = ReturnType<typeof resumoVendas> & ReturnType<typeof resumoCaixa> & { semRecebivel: number; semRecebivelValor: number };

/** Vendas do período (pela aprovação) + caixa até hoje e projetado (todos os recebíveis). */
async function caixaDoPeriodo(d: string): Promise<KpiCaixa> {
  const [transacoes, recebiveis, [sem]] = await Promise.all([
    query<{ status: string; bruto: string | null; liquido: string | null; taxa: string | null }>(
      `select transaction_status status, amount_gross bruto, amount_net liquido, amount_fee taxa
       from transactions where approved_at >= $1`,
      [d]
    ),
    recebiveisParaCaixa(),
    query<Record<string, string>>(
      `select count(*) n, coalesce(sum(t.amount_net), 0) valor from transactions t
       where t.transaction_status = 'approved'
         and not exists (select 1 from receivables r where r.provider = t.provider and r.transaction_id = t.transaction_id)`
    ),
  ]);
  return {
    ...resumoVendas(transacoes.map((t) => ({ status: t.status, bruto: nn(t.bruto), liquido: nn(t.liquido), taxa: nn(t.taxa) }))),
    ...resumoCaixa(recebiveis, hojeSP()),
    semRecebivel: n(sem.n),
    semRecebivelValor: n(sem.valor),
  };
}

export async function caixaKpi(p: Periodo): Promise<KpiCaixa> {
  await exigirAdmin();
  return caixaDoPeriodo(desde(p));
}

async function recebiveisParaCaixa(): Promise<RecebivelValor[]> {
  const rows = await query<Record<string, string | null>>(
    `select receivable_status, expected_amount, expected_date::text expected_date, received_amount, net_received_amount, source_system
     from receivables`
  );
  return rows.map((r) => ({
    status: r.receivable_status!, valorEsperado: n(r.expected_amount), dataPrevista: r.expected_date,
    valorRecebido: nn(r.received_amount), liquidoRecebido: nn(r.net_received_amount),
    presumivel: r.source_system === "kiwify_webhook",
  }));
}

// ───────────── Frescor dos dados (Blueprint §50, RF-117) ─────────────

export interface Frescor {
  fonte: string;
  quando: string | null;
  detalhe: string;
}

export async function frescor(): Promise<Frescor[]> {
  await exigirAdmin();
  const [r] = await query<Record<string, string | null>>(
    `select
       (select max(ingested_at) from campaign_performance where platform = 'meta') meta,
       (select max(performance_date)::text from campaign_performance where platform = 'meta') meta_dia,
       (select max(ingested_at) from campaign_performance where platform <> 'meta') outras,
       (select max(created_at) from media_spend) manual,
       (select max(ingested_at) from content_performance) conteudo,
       (select max(source_updated_at) from content_performance) conteudo_fonte,
       (select max(ingested_at) from receivables where source_system <> 'kiwify_webhook') receb,
       (select max(received_at) from webhook_events where provider = 'kiwify') kiwify,
       (select count(*) from webhook_events where provider = 'kiwify' and processing_status = 'failed') kiwify_falhas`
  );
  const dia = (v: string | null) => (v ? v.split("-").reverse().join("/") : null);
  const iso = (v: unknown) => (v ? new Date(v as string).toISOString() : null);
  return [
    { fonte: "Meta Ads", quando: iso(r.meta), detalhe: r.meta_dia ? `dados até ${dia(r.meta_dia)}` : "nenhum CSV importado" },
    { fonte: "Outras mídias", quando: iso(r.outras), detalhe: r.outras ? "CSV importado" : "nenhum CSV importado" },
    { fonte: "Mídia lançada à mão", quando: iso(r.manual), detalhe: r.manual ? "último lançamento" : "nenhum lançamento" },
    { fonte: "Conteúdo", quando: iso(r.conteudo), detalhe: r.conteudo_fonte ? `métrica da plataforma de ${new Date(r.conteudo_fonte).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" })}` : "nenhum CSV importado" },
    { fonte: "Recebíveis (extrato)", quando: iso(r.receb), detalhe: r.receb ? "importado ou editado à mão" : "nenhum extrato: recebido usa a data prevista da Kiwify" },
    { fonte: "Webhook Kiwify", quando: iso(r.kiwify), detalhe: n(r.kiwify_falhas) ? `${r.kiwify_falhas} com falha` : r.kiwify ? "sem falhas" : "nenhum recebido" },
  ];
}

// ───────────── Conteúdo por content_id (RF-110, §46) ─────────────

export interface LinhaConteudoKpi {
  content_id: string;
  platform: string;
  published_at: string | null;
  content_type: string | null;
  dimension: string | null;
  organic_or_paid: string;
  views: number | null;
  reach: number | null;
  retention_rate: number | null;
  saves: number | null;
  shares: number | null;
  link_clicks: number | null;
  source_updated_at: string | null;
  sessoes: number;
  leads: number;
  vendas: number;
  receita: number;
}

/** Conteúdo publicado no período + resultado no site pelo utm_content (desde sempre). */
export async function conteudoKpi(p: Periodo): Promise<{ linhas: LinhaConteudoKpi[]; semMetrica: { utm_content: string; sessoes: number }[] }> {
  await exigirAdmin();
  const d = desde(p);
  const [linhas, semMetrica] = await Promise.all([
    query<Record<string, string | null>>(
      `select cp.content_id, cp.platform, cp.published_at, cp.content_type, coalesce(cp.dimension, i.dimensao) dimension,
              cp.organic_or_paid, cp.views, cp.reach, cp.retention_rate, cp.saves, cp.shares, cp.link_clicks, cp.source_updated_at,
              (select count(*) from sessions s where s.utm_content = cp.content_id) sessoes,
              (select count(*) from leads l where l.email is not null and l.merged_into is null
                 and l.last_touch_content = cp.content_id) leads,
              (select count(*) from transactions t where lower(t.utm_content) = cp.content_id and t.transaction_status = 'approved') vendas,
              (select coalesce(sum(t.amount_gross), 0) from transactions t where lower(t.utm_content) = cp.content_id
                 and t.transaction_status = 'approved') receita
       from content_performance cp
       left join editorial_derivations ed on ed.codigo = cp.content_id
       left join editorial_ideas i on i.id = ed.idea_id
       where cp.published_at >= $1 or cp.published_at is null
       order by cp.published_at desc nulls last limit 200`,
      [d]
    ),
    query<{ utm_content: string; sessoes: string }>(
      `select s.utm_content, count(*) sessoes from sessions s
       where s.session_started_at >= $1 and s.utm_content is not null
         and not exists (select 1 from content_performance cp where cp.content_id = s.utm_content)
       group by 1 order by 2 desc limit 10`,
      [d]
    ),
  ]);
  return {
    linhas: linhas.map((r) => ({
      content_id: r.content_id!, platform: r.platform!, published_at: r.published_at, content_type: r.content_type,
      dimension: r.dimension, organic_or_paid: r.organic_or_paid!, views: nn(r.views), reach: nn(r.reach),
      retention_rate: nn(r.retention_rate), saves: nn(r.saves), shares: nn(r.shares), link_clicks: nn(r.link_clicks),
      source_updated_at: r.source_updated_at, sessoes: n(r.sessoes), leads: n(r.leads), vendas: n(r.vendas), receita: n(r.receita),
    })),
    semMetrica: semMetrica.map((s) => ({ utm_content: s.utm_content, sessoes: n(s.sessoes) })),
  };
}

// ───────────── Recebíveis (§57, §58) ─────────────

export async function recebiveisLista(limite = 100) {
  await exigirAdmin();
  return query<Record<string, string | null>>(
    `select r.receivable_id, r.provider, r.transaction_id, r.installment_number, r.installment_total, r.expected_amount,
            r.expected_date::text expected_date, r.received_amount, r.received_date::text received_date, r.receivable_status,
            r.fee_amount, r.net_received_amount, r.source_system, r.ingested_at, p.product_name
     from receivables r join transactions t using (provider, transaction_id) left join products p on p.product_id = t.product_id
     order by coalesce(r.expected_date, r.received_date) desc nulls last, r.ingested_at desc limit $1`,
    [limite]
  );
}

// ───────────── Ingestão idempotente (§62, RF-116) ─────────────

export type Entidade = "content_performance" | "campaign_performance" | "receivables";

export interface ResultadoCarga {
  total: number;
  gravadas: number;
  falhas: Falha[];
}

// Upsert em lote: uma consulta por bloco (jsonb_to_recordset), não uma por
// linha. Linhas já chegam validadas; a chave lógica decide insert ou update.

const COLS_CONTEUDO = `content_id text, platform text, published_at timestamptz, content_type text, dimension text,
  editorial_universe text, organic_or_paid text, campaign_id text, views bigint, reach bigint, impressions bigint,
  watch_time_seconds numeric, average_watch_time_seconds numeric, retention_rate numeric, saves int, shares int,
  comments int, profile_visits int, link_clicks int, source_updated_at timestamptz, source_record_id text`;

async function gravarConteudo(q: Q, rs: LinhaConteudo[], origem: string) {
  await q(
    `insert into content_performance (content_id, platform, published_at, content_type, dimension, editorial_universe,
       organic_or_paid, campaign_id, views, reach, impressions, watch_time_seconds, average_watch_time_seconds,
       retention_rate, saves, shares, comments, profile_visits, link_clicks, source_updated_at, source_system,
       source_record_id, ingested_at, processing_status, processing_error)
     select x.content_id, x.platform, x.published_at, x.content_type, x.dimension, x.editorial_universe, x.organic_or_paid,
            x.campaign_id, x.views, x.reach, x.impressions, x.watch_time_seconds, x.average_watch_time_seconds,
            x.retention_rate, x.saves, x.shares, x.comments, x.profile_visits, x.link_clicks,
            coalesce(x.source_updated_at, now()), $2, x.source_record_id, now(), 'processed', null
     from jsonb_to_recordset($1::jsonb) as x(${COLS_CONTEUDO})
     on conflict (platform, content_id) do update set
       published_at = coalesce(excluded.published_at, content_performance.published_at),
       content_type = coalesce(excluded.content_type, content_performance.content_type),
       dimension = coalesce(excluded.dimension, content_performance.dimension),
       editorial_universe = coalesce(excluded.editorial_universe, content_performance.editorial_universe),
       organic_or_paid = excluded.organic_or_paid,
       campaign_id = coalesce(excluded.campaign_id, content_performance.campaign_id),
       views = coalesce(excluded.views, content_performance.views),
       reach = coalesce(excluded.reach, content_performance.reach),
       impressions = coalesce(excluded.impressions, content_performance.impressions),
       watch_time_seconds = coalesce(excluded.watch_time_seconds, content_performance.watch_time_seconds),
       average_watch_time_seconds = coalesce(excluded.average_watch_time_seconds, content_performance.average_watch_time_seconds),
       retention_rate = coalesce(excluded.retention_rate, content_performance.retention_rate),
       saves = coalesce(excluded.saves, content_performance.saves),
       shares = coalesce(excluded.shares, content_performance.shares),
       comments = coalesce(excluded.comments, content_performance.comments),
       profile_visits = coalesce(excluded.profile_visits, content_performance.profile_visits),
       link_clicks = coalesce(excluded.link_clicks, content_performance.link_clicks),
       source_updated_at = excluded.source_updated_at,
       source_system = excluded.source_system,
       source_record_id = excluded.source_record_id,
       ingested_at = now(), processing_status = 'processed', processing_error = null
     -- Export mais antigo não sobrescreve métrica mais nova.
     where content_performance.source_updated_at is null or excluded.source_updated_at >= content_performance.source_updated_at`,
    [JSON.stringify(rs), origem]
  );
}

const COLS_CAMPANHA = `performance_date date, platform text, account_id text, campaign_id text, campaign_name text,
  adset_id text, adset_name text, ad_id text, ad_name text, utm_source text, utm_medium text, utm_campaign text,
  utm_content text, spend numeric, impressions bigint, reach bigint, clicks bigint, landing_page_views bigint,
  platform_leads int, platform_purchases int, fase smallint, source_updated_at timestamptz, source_record_id text`;

async function gravarCampanha(q: Q, rs: LinhaCampanha[], origem: string) {
  await q(
    `insert into campaign_performance (performance_date, platform, account_id, campaign_id, campaign_name, adset_id,
       adset_name, ad_id, ad_name, utm_source, utm_medium, utm_campaign, utm_content, spend, impressions, reach, clicks,
       landing_page_views, platform_leads, platform_purchases, fase, source_updated_at, source_system, source_record_id,
       ingested_at, processing_status, processing_error)
     select x.performance_date, x.platform, x.account_id, x.campaign_id, x.campaign_name, x.adset_id, x.adset_name, x.ad_id,
            x.ad_name, x.utm_source, x.utm_medium, x.utm_campaign, x.utm_content, x.spend, x.impressions, x.reach, x.clicks,
            x.landing_page_views, x.platform_leads, x.platform_purchases, x.fase, coalesce(x.source_updated_at, now()),
            $2, x.source_record_id, now(), 'processed', null
     from jsonb_to_recordset($1::jsonb) as x(${COLS_CAMPANHA})
     on conflict (performance_date, platform, campaign_id, adset_id, ad_id) do update set
       account_id = coalesce(excluded.account_id, campaign_performance.account_id),
       campaign_name = coalesce(excluded.campaign_name, campaign_performance.campaign_name),
       adset_name = coalesce(excluded.adset_name, campaign_performance.adset_name),
       ad_name = coalesce(excluded.ad_name, campaign_performance.ad_name),
       utm_source = coalesce(excluded.utm_source, campaign_performance.utm_source),
       utm_medium = coalesce(excluded.utm_medium, campaign_performance.utm_medium),
       utm_campaign = coalesce(excluded.utm_campaign, campaign_performance.utm_campaign),
       utm_content = coalesce(excluded.utm_content, campaign_performance.utm_content),
       spend = excluded.spend, impressions = excluded.impressions, reach = excluded.reach, clicks = excluded.clicks,
       landing_page_views = excluded.landing_page_views, platform_leads = excluded.platform_leads,
       platform_purchases = excluded.platform_purchases, fase = coalesce(excluded.fase, campaign_performance.fase),
       source_updated_at = excluded.source_updated_at, source_system = excluded.source_system,
       source_record_id = excluded.source_record_id,
       ingested_at = now(), processing_status = 'processed', processing_error = null`,
    [JSON.stringify(rs), origem]
  );
}

const COLS_RECEBIVEL = `provider text, transaction_id text, installment_number int, installment_total int,
  expected_amount numeric, expected_date date, received_amount numeric, received_date date, receivable_status text,
  fee_amount numeric, net_received_amount numeric, provider_receivable_id text, source_updated_at timestamptz,
  source_record_id text`;

/** Upsert por transação + parcela: reimportar o mesmo extrato não duplica. */
async function gravarRecebiveis(q: Q, rs: (LinhaRecebivel & { provider: string })[], origem: string) {
  await q(
    `insert into receivables (provider, transaction_id, installment_number, installment_total, expected_amount, expected_date,
       received_amount, received_date, receivable_status, fee_amount, net_received_amount, provider_receivable_id,
       source_updated_at, source_system, source_record_id, ingested_at, processing_status, processing_error, updated_at)
     select x.provider, x.transaction_id, x.installment_number, x.installment_total, x.expected_amount, x.expected_date,
            x.received_amount, x.received_date, x.receivable_status, x.fee_amount, x.net_received_amount,
            x.provider_receivable_id, coalesce(x.source_updated_at, now()), $2, x.provider || ':' || x.source_record_id,
            now(), 'processed', null, now()
     from jsonb_to_recordset($1::jsonb) as x(${COLS_RECEBIVEL})
     on conflict (provider, transaction_id, installment_number) do update set
       installment_total = excluded.installment_total, expected_amount = excluded.expected_amount,
       expected_date = excluded.expected_date, received_amount = excluded.received_amount,
       received_date = excluded.received_date, receivable_status = excluded.receivable_status,
       fee_amount = coalesce(excluded.fee_amount, receivables.fee_amount),
       net_received_amount = excluded.net_received_amount,
       provider_receivable_id = coalesce(excluded.provider_receivable_id, receivables.provider_receivable_id),
       source_updated_at = excluded.source_updated_at, source_system = excluded.source_system,
       source_record_id = excluded.source_record_id, ingested_at = now(), processing_status = 'processed',
       processing_error = null, updated_at = now()`,
    [JSON.stringify(rs), origem]
  );
}

/** Liga cada recebível à transação (só Kiwify por enquanto). Sem transação: falha da linha. */
async function comTransacao(q: Q, rs: LinhaRecebivel[], falhas: Falha[]) {
  const achadas = await q<{ transaction_id: string; provider: string }>(
    "select transaction_id, provider from transactions where transaction_id = any($1::text[])",
    [[...new Set(rs.map((r) => r.transaction_id))]]
  );
  const prov = new Map(achadas.map((a) => [a.transaction_id, a.provider]));
  const ok: (LinhaRecebivel & { provider: string })[] = [];
  for (const r of rs) {
    const p = prov.get(r.transaction_id);
    if (p) ok.push({ ...r, provider: p });
    else falhas.push({ linha: 0, erro: `transação ${r.transaction_id} não encontrada` });
  }
  return ok;
}

/** Mesma chave lógica duas vezes no arquivo: vale a última linha. */
function semRepetir<T extends { source_record_id: string }>(rs: T[]): T[] {
  return [...new Map(rs.map((r) => [r.source_record_id, r])).values()];
}

const LOTE = 500;

async function gravar(q: Q, entidade: Entidade, rs: unknown[], origem: string) {
  if (entidade === "content_performance") await gravarConteudo(q, rs as LinhaConteudo[], origem);
  else if (entidade === "campaign_performance") await gravarCampanha(q, rs as LinhaCampanha[], origem);
  else await gravarRecebiveis(q, rs as (LinhaRecebivel & { provider: string })[], origem);
}

/**
 * Importa um CSV (RF-096, RF-098, RF-116). Grava em blocos; se um bloco
 * falhar, refaz linha a linha para registrar só a ruim. A carga fica em
 * ingestion_runs (frescor e auditoria). Reimportar o mesmo arquivo não duplica.
 */
export async function importarCsv(
  entidade: Entidade,
  texto: string,
  opts: { origem: string; arquivo: string | null; plataforma?: string | null }
): Promise<ResultadoCarga> {
  await exigirAdmin();
  const { linhas } = lerCsv(texto);
  const padrao = { platform: opts.plataforma ?? undefined };
  const mapa =
    entidade === "content_performance" ? linhasConteudo(linhas, padrao)
      : entidade === "campaign_performance" ? linhasCampanha(linhas, padrao)
        : linhasRecebiveis(linhas);
  const falhas: Falha[] = [...mapa.falhas];
  return withTx(async (q) => {
    const [run] = await q<{ id: number }>(
      "insert into ingestion_runs (entity, source_system, file_name, rows_total) values ($1, $2, $3, $4) returning id",
      [entidade, opts.origem, opts.arquivo, linhas.length]
    );
    let validas: { source_record_id: string }[] = semRepetir(mapa.ok as { source_record_id: string }[]);
    if (entidade === "receivables") validas = await comTransacao(q, validas as LinhaRecebivel[], falhas);
    let gravadas = 0;
    for (let i = 0; i < validas.length; i += LOTE) {
      const bloco = validas.slice(i, i + LOTE);
      await q("savepoint bloco");
      try {
        await gravar(q, entidade, bloco, opts.origem);
        await q("release savepoint bloco");
        gravadas += bloco.length;
      } catch {
        await q("rollback to savepoint bloco");
        for (const r of bloco) {
          await q("savepoint linha");
          try {
            await gravar(q, entidade, [r], opts.origem);
            await q("release savepoint linha");
            gravadas++;
          } catch (e) {
            await q("rollback to savepoint linha");
            falhas.push({ linha: 0, erro: `${r.source_record_id}: ${e instanceof Error ? e.message.slice(0, 160) : "erro"}` });
          }
        }
      }
    }
    const status = gravadas === 0 ? "failed" : falhas.length ? "partial" : "processed";
    await q(
      `update ingestion_runs set finished_at = now(), rows_ok = $2, rows_failed = $3, errors = $4, processing_status = $5
       where id = $1`,
      [run.id, gravadas, falhas.length, falhas.length ? JSON.stringify(falhas.slice(0, 50)) : null, status]
    );
    return { total: linhas.length, gravadas, falhas };
  });
}

/** Um recebível pelo formulário do admin (mesma regra e mesma chave da importação). */
export async function salvarRecebivelManual(r: LinhaRecebivel): Promise<string | null> {
  await exigirAdmin();
  return withTx(async (q) => {
    const falhas: Falha[] = [];
    const ok = await comTransacao(q, [r], falhas);
    if (!ok.length) return falhas[0]?.erro ?? "transação não encontrada";
    await gravarRecebiveis(q, ok, "manual");
    await q(
      `insert into ingestion_runs (entity, source_system, file_name, finished_at, rows_total, rows_ok, processing_status)
       values ('receivables', 'manual', 'formulário do admin', now(), 1, 1, 'processed')`
    );
    return null;
  });
}

export async function ultimasCargas(entidade: Entidade, limite = 8) {
  await exigirAdmin();
  return query<Record<string, string | number | null>>(
    `select id, source_system, file_name, started_at, rows_total, rows_ok, rows_failed, processing_status, errors
     from ingestion_runs where entity = $1 order by started_at desc limit $2`,
    [entidade, limite]
  );
}
