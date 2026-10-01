import "server-only";
import { isAdmin } from "@/lib/admin-auth";
import { getMetaCapiTokenConfigurado, getTracking } from "@/lib/settings";
import { DIMENSION_IDS, DIMENSIONS } from "../dimensions";
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
       select fonte_normalizada(utm_source) as origem, count(distinct lead_id) as visitantes, 0 as mapas, 0 as leads, 0 as compras, 0::numeric as bruto
       from sessions where session_started_at >= $1 group by 1
       union all
       select fonte_normalizada(utm_source), 0, count(*), 0, 0, 0 from map_results where started_at >= $1 group by 1
       union all
       select fonte_normalizada(l.last_touch_source), 0, 0, count(distinct e.lead_id), 0, 0
       from events e join leads l using (lead_id) where e.event_name = 'SubmitMapEmail' and e.occurred_at >= $1 group by 1
       union all
       select fonte_normalizada(utm_source), 0, 0, 0, count(*), sum(amount_gross)
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
  feedback: { perfil: string; sim: number; em_parte: number; nao: number }[];
  comentarios: { perfil: string; resposta: string; texto: string; quando: string }[];
  /** Só Fricção: quem fez o Mapa da dimensão indicada depois, e quem comprou. */
  aprofundamento: { dimensao: string; concluidos: number; aprofundaram: number; compraram: number }[];
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
  const fb = await query<{ map_type: string; perfil: string; sim: string; em_parte: string; nao: string }>(
    `select map_type, coalesce(primary_pattern, primary_dimension) perfil,
            count(*) filter (where feedback = 'sim') sim, count(*) filter (where feedback = 'em_parte') em_parte,
            count(*) filter (where feedback = 'nao') nao
     from map_results where feedback is not null and completed_at >= $1 group by 1, 2`,
    [d]
  );
  const coments = await query<{ map_type: string; perfil: string; resposta: string; texto: string; quando: string }>(
    `select map_type, coalesce(primary_pattern, primary_dimension) perfil, feedback resposta, feedback_comment texto, feedback_at quando
     from map_results where feedback_comment is not null and completed_at >= $1 order by feedback_at desc limit 60`,
    [d]
  );
  const aprof = await query<{ dimensao: string; concluidos: string; aprofundaram: string; compraram: string }>(
    `select f.primary_dimension dimensao, count(*) concluidos,
            count(*) filter (where exists (select 1 from map_results m where m.map_type = f.primary_dimension
               and m.started_at > f.completed_at
               and m.lead_id in (select lead_id from leads where lead_id = f.lead_id or merged_into = f.lead_id))) aprofundaram,
            count(*) filter (where exists (select 1 from transactions t where t.transaction_status = 'approved'
               and t.approved_at > f.completed_at
               and t.lead_id in (select lead_id from leads where lead_id = f.lead_id or merged_into = f.lead_id))) compraram
     from map_results f where f.map_type = 'friccao' and f.status = 'completed' and f.completed_at >= $1
     group by 1 order by 2 desc`,
    [d]
  );
  return linhas.map((l) => ({
    map_type: l.map_type,
    iniciados: Number(l.iniciados),
    concluidos: Number(l.concluidos),
    distribuicao: dist.filter((x) => x.map_type === l.map_type).map((x) => ({ valor: x.valor, n: Number(x.n) })).sort((a, b) => b.n - a.n),
    tipos: tipos.filter((x) => x.map_type === l.map_type).map((x) => ({ kind: x.kind, n: Number(x.n) })),
    abandono: aband.filter((x) => x.map_type === l.map_type).map((x) => ({ passo: x.passo, n: Number(x.n) })).sort((a, b) => a.passo - b.passo),
    feedback: fb.filter((x) => x.map_type === l.map_type).map((x) => ({ perfil: x.perfil, sim: +x.sim, em_parte: +x.em_parte, nao: +x.nao })),
    comentarios: coments.filter((x) => x.map_type === l.map_type).slice(0, 8).map((x) => ({ perfil: x.perfil, resposta: x.resposta, texto: x.texto, quando: x.quando })),
    aprofundamento: l.map_type === "friccao"
      ? aprof.map((x) => ({ dimensao: x.dimensao, concluidos: +x.concluidos, aprofundaram: +x.aprofundaram, compraram: +x.compraram }))
      : [],
  }));
}

// ───────────── Funil, cortes e economia (Funis §30, Modelo de Dados §40, Financeiro §9/§15) ─────────────

export interface Corte {
  chave: string;
  visitantes: number;
  mapas: number;
  leads: number;
  compras: number;
  bruto: number;
}

/** Cortes obrigatórios do dashboard: campanha e criativo (utm_content). */
export async function cortes(p: Periodo, campo: "utm_campaign" | "utm_content"): Promise<Corte[]> {
  await exigirAdmin();
  const d = desde(p);
  // Nome de coluna vem do tipo (whitelist), nunca da requisição.
  const c = campo === "utm_campaign" ? "utm_campaign" : "utm_content";
  const last = campo === "utm_campaign" ? "last_touch_campaign" : "last_touch_content";
  const rows = await query<Record<string, string>>(
    `with o as (
       select coalesce(nullif(${c},''),'(sem)') k, count(distinct lead_id) v, 0 m, 0 l, 0 c, 0::numeric b
       from sessions where session_started_at >= $1 group by 1
       union all
       select coalesce(nullif(${c},''),'(sem)'), 0, count(*), 0, 0, 0 from map_results where started_at >= $1 group by 1
       union all
       select coalesce(nullif(l.${last},''),'(sem)'), 0, 0, count(distinct e.lead_id), 0, 0
       from events e join leads l using (lead_id) where e.event_name = 'SubmitMapEmail' and e.occurred_at >= $1 group by 1
       union all
       select coalesce(nullif(${c},''),'(sem)'), 0, 0, 0, count(*), sum(amount_gross)
       from transactions where transaction_status = 'approved' and approved_at >= $1 group by 1
     )
     select k, sum(v) v, sum(m) m, sum(l) l, sum(c) c, sum(b) b from o group by 1
     order by sum(b) desc, sum(l) desc, sum(v) desc limit 25`,
    [d]
  );
  return rows.map((r) => ({ chave: r.k, visitantes: +r.v, mapas: +r.m, leads: +r.l, compras: +r.c, bruto: +(r.b ?? 0) }));
}

export interface Economia {
  ofertas: { oferta: string; vistas: number; compras: number }[];
  mentoriaInteresse: number;
  ticketMedio: number;
  caixaPorLead: number;
  progressao: { de: string; para: string; base: number; avancaram: number }[];
  diasMapaPrimeiraCompra: number | null;
  diasPrimeiraSegunda: number | null;
  porPerfil: { mapa: string; perfil: string; concluidos: number; leads: number; compradores: number }[];
  porProduto: { produto: string; nome: string; vendas: number; bruto: number; reembolsos: number }[];
  acumulado: Record<string, number>;
  coortes: { mes: string; clientes: number; receita30: number; receita60: number; segundaCompra: number }[];
}

export async function economia(p: Periodo): Promise<Economia> {
  await exigirAdmin();
  const d = desde(p);
  const ofertas = await query<{ oferta: string; vistas: string; compras: string }>(
    `select x.oferta,
            (select count(*) from events where event_name = x.vista and occurred_at >= $1) vistas,
            (select count(*) from events where event_name = x.compra and occurred_at >= $1) compras
     from (values ('Plano','ViewPlanOffer','PurchasePlan'), ('Kit','ViewKitOffer','PurchaseKit'),
                  ('Protocolo','ViewProtocolOffer','PurchaseProtocol'), ('Mentoria','ViewMentoring','MentoringInterest'))
          as x(oferta, vista, compra)`,
    [d]
  );
  const [base] = await query<Record<string, string | null>>(
    `select
       (select count(distinct lead_id) from events where event_name = 'MentoringInterest' and occurred_at >= $1) mentoria,
       (select coalesce(avg(amount_gross),0) from transactions where transaction_status = 'approved' and approved_at >= $1) ticket,
       (select coalesce(sum(amount_received),0) from transactions where transaction_status = 'approved' and received_at <= now()) caixa,
       (select count(*) from leads where email is not null and merged_into is null) leads_total,
       (select avg(extract(epoch from (pc.primeira - mr.primeiro)) / 86400) from
          (select lead_id, min(approved_at) primeira from transactions where transaction_status = 'approved' group by 1) pc
          join (select lead_id, min(completed_at) primeiro from map_results where status = 'completed' group by 1) mr using (lead_id)
          where pc.primeira >= mr.primeiro) dias_mapa,
       (select avg(extract(epoch from (s.segunda - s.primeira)) / 86400) from
          (select lead_id, min(approved_at) primeira, (array_agg(approved_at order by approved_at))[2] segunda
           from transactions where transaction_status = 'approved' group by 1) s
          where s.segunda is not null) dias_segunda`,
    [d]
  );
  const progressao = await query<{ de: string; para: string; base: string; avancaram: string }>(
    `with c as (
       select t.lead_id, p.product_type tipo, min(t.approved_at) quando
       from transactions t join products p using (product_id)
       where t.transaction_status = 'approved' group by 1, 2
     )
     select x.de, x.para,
            (select count(*) from c where c.tipo = x.de_t) base,
            (select count(*) from c a join c b on b.lead_id = a.lead_id and b.tipo = x.para_t and b.quando > a.quando
             where a.tipo = x.de_t) avancaram
     from (values ('Plano','Kit','plan','kit'), ('Plano','Protocolo','plan','protocol'),
                  ('Kit','Protocolo','kit','protocol'), ('Protocolo','Mentoria','protocol','mentoring'))
          as x(de, para, de_t, para_t)`
  );
  const porPerfil = await query<{ mapa: string; perfil: string; concluidos: string; leads: string; compradores: string }>(
    `select mr.map_type mapa, coalesce(mr.primary_pattern, mr.primary_dimension) perfil, count(*) concluidos,
            count(distinct mr.lead_id) filter (where l.email is not null) leads,
            count(distinct mr.lead_id) filter (where exists (
              select 1 from transactions t where t.lead_id = mr.lead_id and t.transaction_status = 'approved'
                and t.approved_at >= mr.completed_at)) compradores
     from map_results mr join leads l using (lead_id)
     where mr.status = 'completed' and mr.completed_at >= $1
     group by 1, 2 order by 3 desc limit 40`,
    [d]
  );
  const porProduto = await query<{ produto: string; nome: string; vendas: string; bruto: string; reembolsos: string }>(
    `select t.product_id produto, coalesce(p.product_name, t.product_id) nome,
            count(*) filter (where t.transaction_status = 'approved') vendas,
            coalesce(sum(t.amount_gross) filter (where t.transaction_status = 'approved'), 0) bruto,
            count(*) filter (where t.transaction_status in ('refunded','chargeback')) reembolsos
     from transactions t left join products p using (product_id)
     where coalesce(t.approved_at, t.created_at) >= $1 group by 1, 2 order by 4 desc`,
    [d]
  );
  const acumulado = await query<{ tipo: string; n: string }>(
    `select p.product_type tipo, count(*) n from transactions t join products p using (product_id)
     where t.transaction_status = 'approved' group by 1`
  );
  // LTV por coorte (Financeiro §9): mês da 1ª compra, receita acumulada em 30 e 60 dias.
  const coortes = await query<{ mes: string; clientes: string; r30: string; r60: string; segunda: string }>(
    `with primeira as (
       select lead_id, min(approved_at) inicio from transactions where transaction_status = 'approved' group by 1
     )
     select to_char(date_trunc('month', p.inicio at time zone 'America/Sao_Paulo'), 'MM/YYYY') mes,
            count(*) clientes,
            sum((select coalesce(sum(t.amount_gross),0) from transactions t where t.lead_id = p.lead_id
                  and t.transaction_status = 'approved' and t.approved_at < p.inicio + interval '30 days')) r30,
            sum((select coalesce(sum(t.amount_gross),0) from transactions t where t.lead_id = p.lead_id
                  and t.transaction_status = 'approved' and t.approved_at < p.inicio + interval '60 days')) r60,
            count(*) filter (where (select count(*) from transactions t where t.lead_id = p.lead_id
                  and t.transaction_status = 'approved') >= 2) segunda
     from primeira p group by date_trunc('month', p.inicio at time zone 'America/Sao_Paulo'), 1 order by date_trunc('month', p.inicio at time zone 'America/Sao_Paulo') desc limit 6`
  );
  const leadsTotal = Number(base.leads_total ?? 0);
  return {
    ofertas: ofertas.map((o) => ({ oferta: o.oferta, vistas: +o.vistas, compras: +o.compras })),
    mentoriaInteresse: Number(base.mentoria ?? 0),
    ticketMedio: Number(base.ticket ?? 0),
    caixaPorLead: leadsTotal ? Number(base.caixa ?? 0) / leadsTotal : 0,
    progressao: progressao.map((r) => ({ de: r.de, para: r.para, base: +r.base, avancaram: +r.avancaram })),
    diasMapaPrimeiraCompra: base.dias_mapa == null ? null : Number(base.dias_mapa),
    diasPrimeiraSegunda: base.dias_segunda == null ? null : Number(base.dias_segunda),
    porPerfil: porPerfil.map((r) => ({ mapa: r.mapa, perfil: r.perfil, concluidos: +r.concluidos, leads: +r.leads, compradores: +r.compradores })),
    porProduto: porProduto.map((r) => ({ produto: r.produto, nome: r.nome, vendas: +r.vendas, bruto: +r.bruto, reembolsos: +r.reembolsos })),
    acumulado: Object.fromEntries(acumulado.map((a) => [a.tipo, +a.n])),
    coortes: coortes.map((c) => ({ mes: c.mes, clientes: +c.clientes, receita30: +c.r30, receita60: +c.r60, segundaCompra: +c.segunda })),
  };
}

/** Cenários do Modelo Financeiro §8 (quantidade de vendas até 30/12). */
export const CENARIOS = {
  conservador: { plan: 100, kit: 45, protocol: 30, mentoring: 3 },
  base: { plan: 150, kit: 65, protocol: 60, mentoring: 5 },
  forte: { plan: 200, kit: 90, protocol: 80, mentoring: 5 },
} as const;

// ───────────── Mídia paga (Financeiro §10, §11, §16) ─────────────

/** Fases de orçamento: até R$10 mil liberados por evidência. */
export const FASES_MIDIA = [
  { fase: 1, nome: "Descoberta", teto: 1000 },
  { fase: 2, nome: "Aquisição", teto: 2000 },
  { fase: 3, nome: "Remarketing", teto: 2000 },
  { fase: 4, nome: "Oferta", teto: 2000 },
  { fase: 5, nome: "Escala", teto: 3000 },
] as const;

/** Guardrails de CPL (Financeiro §11): abaixo de 12 é a meta, 35 tende a quebrar o modelo. */
export function sinalMidia(cpl: number | null, rpl: number | null, investido = 0): "verde" | "amarelo" | "vermelho" | "sem_dados" {
  // Sem lead: até o custo de um lead "que quebra o modelo" ainda é cedo; passou disso, é vermelho.
  if (cpl == null) return investido >= 35 ? "vermelho" : "sem_dados";
  // CPL isolado não decide: com receita por lead que paga o lead, segue verde.
  if (rpl != null && rpl >= cpl && cpl <= 20) return "verde";
  if (cpl <= 12) return "verde";
  if (cpl < 35) return "amarelo";
  return "vermelho";
}

export interface LinhaMidia {
  campanha: string;
  investido: number;
  visitantes: number;
  leads: number;
  compradores: number;
  receita: number;
  cpl: number | null;
  cac: number | null;
  roas: number | null;
  rpl: number | null;
  sinal: ReturnType<typeof sinalMidia>;
}

/** Junta o investimento lançado com o que cada campanha trouxe (pelo utm_campaign). */
export async function resumoMidia(): Promise<{ linhas: LinhaMidia[]; porFase: { fase: number; investido: number }[]; total: number }> {
  await exigirAdmin();
  const rows = await query<Record<string, string>>(
    `with gasto as (
       select coalesce(nullif(campaign,''),'(sem campanha)') campanha, sum(amount) investido
       from media_spend group by 1
     )
     select g.campanha, g.investido,
            (select count(distinct lead_id) from sessions s where s.utm_campaign = g.campanha) visitantes,
            (select count(distinct e.lead_id) from events e join leads l using (lead_id)
              where e.event_name = 'SubmitMapEmail' and (l.first_touch_campaign = g.campanha or l.last_touch_campaign = g.campanha)) leads,
            (select count(distinct t.lead_id) from transactions t where t.transaction_status = 'approved' and t.utm_campaign = g.campanha) compradores,
            (select coalesce(sum(t.amount_gross),0) from transactions t where t.transaction_status = 'approved' and t.utm_campaign = g.campanha) receita
     from gasto g order by g.investido desc`
  );
  const porFase = await query<{ fase: number; investido: string }>(
    "select fase, sum(amount) investido from media_spend where fase is not null group by 1 order by 1"
  );
  const [{ total }] = await query<{ total: string }>("select coalesce(sum(amount),0) total from media_spend");
  const linhas = rows.map((r) => {
    const investido = +r.investido;
    const leads = +r.leads;
    const compradores = +r.compradores;
    const receita = +r.receita;
    const cpl = leads ? investido / leads : null;
    const rpl = leads ? receita / leads : null;
    return {
      campanha: r.campanha, investido, visitantes: +r.visitantes, leads, compradores, receita,
      cpl, rpl, cac: compradores ? investido / compradores : null, roas: investido ? receita / investido : null,
      sinal: sinalMidia(cpl, rpl, investido),
    };
  });
  return { linhas, porFase: porFase.map((f) => ({ fase: f.fase, investido: +f.investido })), total: +total };
}

// ───────────── KPIs de automação (Funis §31) ─────────────

export interface KpiAutomacao {
  automation_id: string;
  enviados: number;
  entregues: number;
  abertos: number;
  cliques: number;
  descadastros: number;
  spam: number;
  compradores: number;
  receita: number;
}

/**
 * Receita por sequência: compra aprovada até 7 dias depois de um e-mail
 * enviado daquela automação (atribuição pelo último e-mail, simples e
 * explicável). Uma compra conta para uma automação só.
 */
export async function kpisAutomacao(p: Periodo): Promise<KpiAutomacao[]> {
  await exigirAdmin();
  const d = desde(p);
  const rows = await query<Record<string, string>>(
    `with env as (
       select * from messages where status = 'sent' and sent_at >= $1 and coalesce(delivery_mode,'live') = 'live'
     ),
     atrib as (
       select distinct on (t.provider, t.transaction_id) t.transaction_id, t.amount_gross, t.lead_id, m.automation_id
       from transactions t
       join env m on m.lead_id = t.lead_id and m.sent_at <= t.approved_at and m.sent_at > t.approved_at - interval '7 days'
       where t.transaction_status = 'approved' and t.approved_at >= $1
       order by t.provider, t.transaction_id, m.sent_at desc
     )
     select e.automation_id,
            count(*) enviados,
            count(*) filter (where e.delivered_at is not null) entregues,
            count(*) filter (where e.opened_at is not null) abertos,
            count(*) filter (where e.clicked_at is not null) cliques,
            count(*) filter (where e.complained_at is not null) spam,
            (select count(distinct u.lead_id) from events u where u.event_name = 'Unsubscribe' and u.occurred_at >= $1
               and exists (select 1 from env x where x.lead_id = u.lead_id and x.automation_id = e.automation_id
                           and x.sent_at <= u.occurred_at and x.sent_at > u.occurred_at - interval '2 days')) descadastros,
            (select count(distinct a.lead_id) from atrib a where a.automation_id = e.automation_id) compradores,
            (select coalesce(sum(a.amount_gross),0) from atrib a where a.automation_id = e.automation_id) receita
     from env e group by 1 order by receita desc, enviados desc`,
    [d]
  );
  return rows.map((r) => ({
    automation_id: r.automation_id, enviados: +r.enviados, entregues: +r.entregues, abertos: +r.abertos,
    cliques: +r.cliques, descadastros: +r.descadastros, spam: +r.spam, compradores: +r.compradores, receita: +r.receita,
  }));
}

// ───────────── Pronto para tráfego pago? (Financeiro §18) ─────────────

export interface ItemProntidao {
  item: string;
  ok: boolean;
  detalhe: string;
}

/** Checklist calculado do estado real: nada aqui é marcado à mão. */
export async function prontidao(): Promise<ItemProntidao[]> {
  await exigirAdmin();
  const producao = process.env.NEXT_PUBLIC_EPIC_ENV === "production";
  const mapasNoAr = DIMENSION_IDS.filter((d) => DIMENSIONS[d].map === "published");
  const [r] = await query<Record<string, string | null>>(
    `select
       (select count(*) from products where active and checkout_url is not null and product_type = 'plan') planos,
       (select count(*) from products where active and checkout_url is not null and product_type = 'kit') kits,
       (select count(*) from products where active and checkout_url is not null and product_type = 'protocol') protocolo,
       (select count(*) from products where active and checkout_url is not null and provider_product_id is null) sem_id,
       (select count(*) from webhook_events where provider = 'kiwify') webhooks,
       (select value #>> '{}' from app_settings where key = 'cron_last_run') cron,
       (select count(*) from messages where status = 'scheduled' and scheduled_for < now() - interval '1 hour') atrasadas`
  );
  const tracking = await getTracking();
  const capi = await getMetaCapiTokenConfigurado().catch(() => false);
  const cron = r.cron ? new Date(r.cron) : null;
  const cronVivo = Boolean(cron && Date.now() - cron.getTime() < 30 * 60 * 1000);
  const modo = process.env.EPIC_EMAIL_MODE ?? (producao ? "live" : "simulate");
  return [
    { item: "Site 2.0 em produção", ok: producao, detalhe: producao ? "NEXT_PUBLIC_EPIC_ENV=production" : "ambiente de homologação" },
    {
      item: "Pelo menos 2 Mapas ao vivo",
      ok: mapasNoAr.length >= 2,
      detalhe: `Fricção + ${mapasNoAr.length} dimensional(is): ${mapasNoAr.map((d) => DIMENSIONS[d].name).join(", ") || "nenhum publicado"}`,
    },
    { item: "Plano EPIC à venda", ok: +r.planos! > 0, detalhe: `${r.planos} Plano(s) ativo(s) com checkout` },
    { item: "Kit à venda", ok: +r.kits! > 0, detalhe: `${r.kits} Kit(s) ativo(s) com checkout` },
    { item: "Protocolo à venda", ok: +r.protocolo! > 0, detalhe: +r.protocolo! > 0 ? "ativo com checkout" : "sem checkout ativo" },
    {
      item: "Checkout ligado ao site",
      ok: Boolean(process.env.KIWIFY_WEBHOOK_TOKEN) && +r.sem_id! === 0 && +r.webhooks! > 0,
      detalhe: [
        process.env.KIWIFY_WEBHOOK_TOKEN ? "token do webhook ok" : "falta KIWIFY_WEBHOOK_TOKEN",
        +r.sem_id! ? `${r.sem_id} produto(s) à venda sem ID da Kiwify` : "todos os produtos com ID",
        +r.webhooks! ? `${r.webhooks} webhook(s) já recebidos` : "nenhum webhook recebido ainda",
      ].join(" · "),
    },
    {
      item: "Pixels e eventos",
      ok: Boolean(tracking.metaPixelId) && Boolean(capi),
      detalhe: [tracking.metaPixelId ? "Pixel Meta ok" : "sem Pixel Meta", capi ? "Conversions API ok" : "sem token da Conversions API",
        tracking.ga4Id ? "GA4 ok" : "sem GA4"].join(" · "),
    },
    {
      item: "Automação de e-mail rodando",
      ok: modo === "live" && cronVivo && +r.atrasadas! === 0,
      detalhe: [`modo ${modo}`, cronVivo ? "agendador ativo" : cron ? `agendador parado desde ${cron.toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })}` : "agendador nunca rodou",
        +r.atrasadas! ? `${r.atrasadas} mensagem(ns) atrasada(s)` : "fila em dia"].join(" · "),
    },
    {
      item: "Retorno do e-mail (abertura, clique, bounce)",
      ok: Boolean(process.env.RESEND_WEBHOOK_SECRET),
      detalhe: process.env.RESEND_WEBHOOK_SECRET ? "webhook do Resend configurado" : "falta RESEND_WEBHOOK_SECRET",
    },
  ];
}

/** Quem fez a Fricção, deixou e-mail e espera o Mapa da dimensão principal (Fricção §7). */
export async function esperandoMapa(): Promise<{ dimensao: string; esperando: number; avisados: number }[]> {
  await exigirAdmin();
  const rows = await query<{ dimensao: string; esperando: string; avisados: string }>(
    `with ult as (
       select distinct on (f.lead_id) f.lead_id, f.primary_dimension dim
       from map_results f where f.map_type = 'friccao' and f.status = 'completed'
       order by f.lead_id, f.completed_at desc
     )
     select u.dim dimensao,
            count(*) filter (where not exists (select 1 from messages m where m.lead_id = u.lead_id
               and m.automation_id = 'AUT_MAP_AVAILABLE' and m.context->>'related' = u.dim)) esperando,
            count(*) filter (where exists (select 1 from messages m where m.lead_id = u.lead_id
               and m.automation_id = 'AUT_MAP_AVAILABLE' and m.context->>'related' = u.dim)) avisados
     from ult u join leads l on l.lead_id = u.lead_id
     where l.email is not null and l.merged_into is null
       and not exists (select 1 from map_results m where m.lead_id = u.lead_id and m.map_type = u.dim and m.status = 'completed')
     group by 1 order by 2 desc`
  );
  return rows.map((r) => ({ dimensao: r.dimensao, esperando: +r.esperando, avisados: +r.avisados }));
}
