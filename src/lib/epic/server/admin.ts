import "server-only";
import { isAdmin } from "@/lib/admin-auth";
import { query } from "./db";

// Consultas do /admin/epic. Toda função que expõe dados pessoais exige admin.

export async function exigirAdmin() {
  if (!(await isAdmin())) throw new Error("Não autorizado");
}

export type Periodo = "7" | "30" | "90" | "tudo";
export const DIAS_PERIODO: Record<Periodo, number> = { "7": 7, "30": 30, "90": 90, tudo: 3650 };
export const periodoDe = (v: string | undefined): Periodo => (v === "7" || v === "90" || v === "tudo" ? v : "30");
const desde = (p: Periodo) => new Date(Date.now() - DIAS_PERIODO[p] * 864e5).toISOString();

/** Checkpoints de caixa recebido (Modelo Financeiro §14). */
export const CHECKPOINTS = [
  { ate: "2026-10-31", valor: 5000, rotulo: "31/10" },
  { ate: "2026-11-30", valor: 20000, rotulo: "30/11" },
  { ate: "2026-12-15", valor: 32000, rotulo: "15/12" },
  { ate: "2026-12-30", valor: 50000, rotulo: "30/12" },
];

export interface Painel {
  visitantes: number;
  sessoes: number;
  mapasIniciados: number;
  mapasConcluidos: number;
  leads: number;
  compras: { tipo: string; n: number; bruto: number }[];
  bruto: number;
  liquido: number;
  taxas: number;
  recebido: number;
  aReceber: number;
  reembolsos: number;
  caixaAcumulado: number;
  porOrigem: { origem: string; visitantes: number; mapas: number; leads: number; compras: number; bruto: number }[];
  porDimensao: { dimensao: string; mapas: number; leads: number; compras: number; bruto: number }[];
}

export async function painel(p: Periodo): Promise<Painel> {
  await exigirAdmin();
  const d = desde(p);
  const [base] = await query<Record<string, string>>(
    `select
       (select count(distinct lead_id) from sessions where session_started_at >= $1) as visitantes,
       (select count(*) from sessions where session_started_at >= $1) as sessoes,
       (select count(*) from map_results where started_at >= $1) as mapas_iniciados,
       (select count(*) from map_results where completed_at >= $1) as mapas_concluidos,
       (select count(distinct lead_id) from events where event_name = 'SubmitMapEmail' and occurred_at >= $1) as leads,
       (select coalesce(sum(amount_gross),0) from transactions where transaction_status = 'approved' and approved_at >= $1) as bruto,
       (select coalesce(sum(amount_net),0) from transactions where transaction_status = 'approved' and approved_at >= $1) as liquido,
       (select coalesce(sum(amount_fee),0) from transactions where transaction_status = 'approved' and approved_at >= $1) as taxas,
       (select coalesce(sum(amount_received),0) from transactions where transaction_status = 'approved' and approved_at >= $1 and received_at <= now()) as recebido,
       (select coalesce(sum(amount_net),0) from transactions where transaction_status = 'approved' and approved_at >= $1 and (received_at is null or received_at > now())) as a_receber,
       (select coalesce(sum(amount_gross),0) from transactions where transaction_status in ('refunded','chargeback') and refunded_at >= $1) as reembolsos,
       (select coalesce(sum(amount_received),0) from transactions where transaction_status = 'approved' and received_at <= now()) as caixa_acumulado`,
    [d]
  );
  const compras = await query<{ tipo: string; n: string; bruto: string }>(
    `select p.product_type as tipo, count(*) as n, coalesce(sum(t.amount_gross),0) as bruto
     from transactions t join products p using (product_id)
     where t.transaction_status = 'approved' and t.approved_at >= $1 group by 1`,
    [d]
  );
  const porOrigem = await query<Record<string, string>>(
    `with o as (
       select coalesce(nullif(utm_source,''),'direto') as origem, count(distinct lead_id) as visitantes, 0 as mapas, 0 as leads, 0 as compras, 0::numeric as bruto
       from sessions where session_started_at >= $1 group by 1
       union all
       select coalesce(nullif(utm_source,''),'direto'), 0, count(*), 0, 0, 0 from map_results where started_at >= $1 group by 1
       union all
       select coalesce(nullif(nullif(l.last_touch_source,''),'direct'),'direto'), 0, 0, count(distinct e.lead_id), 0, 0
       from events e join leads l using (lead_id) where e.event_name = 'SubmitMapEmail' and e.occurred_at >= $1 group by 1
       union all
       select coalesce(nullif(utm_source,''),'direto'), 0, 0, 0, count(*), sum(amount_gross)
       from transactions where transaction_status = 'approved' and approved_at >= $1 group by 1
     )
     select origem, sum(visitantes) visitantes, sum(mapas) mapas, sum(leads) leads, sum(compras) compras, sum(bruto) bruto
     from o group by 1 order by sum(visitantes) desc, sum(bruto) desc limit 15`,
    [d]
  );
  const porDimensao = await query<Record<string, string>>(
    `with x as (
       select coalesce(primary_dimension, map_type) as dimensao, count(*) as mapas, 0 as leads, 0 as compras, 0::numeric as bruto
       from map_results where completed_at >= $1 and map_type <> 'friccao' group by 1
       union all
       select dimension, 0, count(distinct lead_id), 0, 0 from events
       where event_name = 'SubmitMapEmail' and occurred_at >= $1 and dimension is not null group by 1
       union all
       select p.product_dimension, 0, 0, count(*), sum(t.amount_gross) from transactions t join products p using (product_id)
       where t.transaction_status = 'approved' and t.approved_at >= $1 and p.product_dimension is not null group by 1
     )
     select dimensao, sum(mapas) mapas, sum(leads) leads, sum(compras) compras, sum(bruto) bruto
     from x group by 1 order by sum(mapas) desc`,
    [d]
  );
  const n = (v: unknown) => Number(v ?? 0);
  return {
    visitantes: n(base.visitantes), sessoes: n(base.sessoes),
    mapasIniciados: n(base.mapas_iniciados), mapasConcluidos: n(base.mapas_concluidos), leads: n(base.leads),
    compras: compras.map((c) => ({ tipo: c.tipo, n: n(c.n), bruto: n(c.bruto) })),
    bruto: n(base.bruto), liquido: n(base.liquido), taxas: n(base.taxas), recebido: n(base.recebido),
    aReceber: n(base.a_receber), reembolsos: n(base.reembolsos), caixaAcumulado: n(base.caixa_acumulado),
    porOrigem: porOrigem.map((r) => ({ origem: r.origem, visitantes: n(r.visitantes), mapas: n(r.mapas), leads: n(r.leads), compras: n(r.compras), bruto: n(r.bruto) })),
    porDimensao: porDimensao.map((r) => ({ dimensao: r.dimensao, mapas: n(r.mapas), leads: n(r.leads), compras: n(r.compras), bruto: n(r.bruto) })),
  };
}

export interface ResumoMapa {
  map_type: string;
  iniciados: number;
  concluidos: number;
  distribuicao: { valor: string; n: number }[];
  tipos: { kind: string; n: number }[];
  abandono: { passo: number; n: number }[];
}

/** Critérios de validação dos documentos de Mapa (§17): distribuição, empates, abandono. */
export async function resumoMapas(p: Periodo): Promise<ResumoMapa[]> {
  await exigirAdmin();
  const d = desde(p);
  const linhas = await query<{ map_type: string; iniciados: string; concluidos: string }>(
    `select map_type, count(*) iniciados, count(*) filter (where status = 'completed') concluidos
     from map_results where started_at >= $1 group by 1 order by 2 desc`,
    [d]
  );
  const dist = await query<{ map_type: string; valor: string; n: string }>(
    `select map_type, coalesce(primary_pattern, primary_dimension) valor, count(*) n
     from map_results where status = 'completed' and completed_at >= $1 group by 1,2`,
    [d]
  );
  const tipos = await query<{ map_type: string; kind: string; n: string }>(
    `select map_type, result_kind kind, count(*) n from map_results
     where status = 'completed' and completed_at >= $1 group by 1,2`,
    [d]
  );
  const aband = await query<{ map_type: string; passo: number; n: string }>(
    `select map_type, current_step passo, count(*) n from map_results
     where status = 'in_progress' and started_at >= $1 and started_at < now() - interval '1 hour' group by 1,2`,
    [d]
  );
  return linhas.map((l) => ({
    map_type: l.map_type,
    iniciados: Number(l.iniciados),
    concluidos: Number(l.concluidos),
    distribuicao: dist.filter((x) => x.map_type === l.map_type).map((x) => ({ valor: x.valor, n: Number(x.n) })).sort((a, b) => b.n - a.n),
    tipos: tipos.filter((x) => x.map_type === l.map_type).map((x) => ({ kind: x.kind, n: Number(x.n) })),
    abandono: aband.filter((x) => x.map_type === l.map_type).map((x) => ({ passo: x.passo, n: Number(x.n) })).sort((a, b) => a.passo - b.passo),
  }));
}
