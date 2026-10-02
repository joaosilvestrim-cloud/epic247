// Contas dos KPIs (Modelo de Dados §56, §59, §63; Blueprint §44, §45).
// Puras e testáveis: o servidor busca os números, aqui só se divide e soma.
// Denominador ausente ou zero dá null ("—" na tela), nunca infinito.

/** Data de corte da meta de caixa (Modelo Financeiro §1). */
export const CORTE_CAIXA = "2026-12-30";

export const razao = (num: number, den: number | null | undefined): number | null =>
  den != null && den > 0 && Number.isFinite(num) ? num / den : null;

// ───────────── Conteúdo ─────────────

/** Denominador fixo: views. É a métrica que toda plataforma entrega. */
export const DEFINICAO_CONTEUDO = "Save Rate = salvamentos ÷ views. Share Rate = compartilhamentos ÷ views. CTR = cliques no link ÷ views.";

export function taxasConteudo(c: { views: number | null; saves: number | null; shares: number | null; link_clicks: number | null }) {
  return {
    saveRate: c.saves == null ? null : razao(c.saves, c.views),
    shareRate: c.shares == null ? null : razao(c.shares, c.views),
    ctr: c.link_clicks == null ? null : razao(c.link_clicks, c.views),
  };
}

/** Retenção média ponderada pelas views (conteúdo sem views não pesa). */
export function retencaoPonderada(itens: { views: number | null; retention_rate: number | null }[]): number | null {
  let soma = 0;
  let peso = 0;
  for (const i of itens) {
    if (i.retention_rate == null || !i.views) continue;
    soma += i.retention_rate * i.views;
    peso += i.views;
  }
  return razao(soma, peso);
}

// ───────────── Economia ─────────────

export const MODELO_ATRIBUICAO =
  "Atribuição: último toque com origem (last non-direct click), por utm_campaign e utm_content. Lead pelo último toque do lead. Venda pelo utm do link de checkout. Plataforma de mídia não entra.";

export const DEFINICAO_ECONOMIA =
  "CPL = gasto ÷ leads atribuídos. CAC 1º produto = gasto ÷ quem fez a 1ª compra no período. CAC cliente EPIC = gasto ÷ compradores únicos. Ticket = bruto ÷ vendas. RPL = bruto ÷ leads. RPV = bruto ÷ visitantes. ROAS = receita atribuída ÷ gasto.";

export interface BaseEconomia {
  gasto: number;
  /** Todos os leads identificados no período (qualquer origem). */
  leads: number;
  visitantes: number;
  vendas: number;
  receitaBruta: number;
  /** Atribuídos a campanhas com gasto. */
  leadsAtribuidos: number;
  novosCompradoresAtribuidos: number;
  compradoresUnicosAtribuidos: number;
  receitaBrutaAtribuida: number;
  receitaLiquidaAtribuida: number;
  caixaAtribuido: number;
}

export function economiaKpi(b: BaseEconomia) {
  return {
    cpl: razao(b.gasto, b.leadsAtribuidos),
    cacPrimeiroProduto: razao(b.gasto, b.novosCompradoresAtribuidos),
    cacCliente: razao(b.gasto, b.compradoresUnicosAtribuidos),
    ticketMedio: razao(b.receitaBruta, b.vendas),
    rpl: razao(b.receitaBruta, b.leads),
    rpv: razao(b.receitaBruta, b.visitantes),
    roasBruto: razao(b.receitaBrutaAtribuida, b.gasto),
    roasLiquido: razao(b.receitaLiquidaAtribuida, b.gasto),
    roasCaixa: razao(b.caixaAtribuido, b.gasto),
  };
}

// ───────────── Vendas e caixa ─────────────

export interface TransacaoValor {
  status: string;
  bruto: number | null;
  liquido: number | null;
  taxa: number | null;
}

/**
 * Vendido conta toda venda aprovada no período, mesmo que reembolsada depois.
 * Receita líquida e taxas só das que seguem aprovadas: reembolso e chargeback
 * corrigem (Modelo de Dados §59).
 */
export function resumoVendas(ts: TransacaoValor[]) {
  let vendido = 0, receitaLiquida = 0, taxas = 0, reembolsado = 0, vendas = 0;
  for (const t of ts) {
    const pago = t.status === "approved" || t.status === "refunded" || t.status === "chargeback";
    if (!pago) continue;
    vendas++;
    vendido += t.bruto ?? 0;
    if (t.status === "approved") {
      receitaLiquida += t.liquido ?? 0;
      taxas += t.taxa ?? 0;
    } else reembolsado += t.bruto ?? 0;
  }
  return { vendas, vendido: centavo(vendido), receitaLiquida: centavo(receitaLiquida), taxas: centavo(taxas), reembolsado: centavo(reembolsado) };
}

export interface RecebivelValor {
  status: string;
  valorEsperado: number;
  dataPrevista: string | null;
  valorRecebido: number | null;
  liquidoRecebido: number | null;
  /** Origem com data de depósito definida pelo provedor (webhook Kiwify). */
  presumivel: boolean;
}

export const DEFINICAO_CAIXA =
  "Recebido = recebíveis confirmados + recebíveis da Kiwify com data de depósito já passada. A receber = previstos ainda não recebidos. Projetado = recebido + a receber com data até o corte.";

/**
 * Caixa por data (Modelo de Dados §59, RF-107 a RF-109). A Kiwify não
 * confirma depósito por webhook: recebível dela com data vencida conta como
 * "recebido presumido" até um extrato importado confirmar. Recebível sem data
 * não entra na projeção (não se inventa data).
 */
export function resumoCaixa(rs: RecebivelValor[], hoje: string, corte: string = CORTE_CAIXA) {
  let confirmado = 0, presumido = 0, aReceber = 0, aReceberAteCorte = 0, vencido = 0, semData = 0;
  for (const r of rs) {
    if (r.status === "received") {
      confirmado += r.liquidoRecebido ?? r.valorRecebido ?? r.valorEsperado;
      continue;
    }
    if (r.status !== "pending" && r.status !== "scheduled" && r.status !== "overdue") continue;
    if (r.status === "scheduled" && r.presumivel && r.dataPrevista && r.dataPrevista <= hoje) {
      presumido += r.valorEsperado;
      continue;
    }
    aReceber += r.valorEsperado;
    if (!r.dataPrevista) { semData += r.valorEsperado; continue; }
    if (r.dataPrevista < hoje || r.status === "overdue") vencido += r.valorEsperado;
    if (r.dataPrevista <= corte) aReceberAteCorte += r.valorEsperado;
  }
  const recebido = confirmado + presumido;
  return {
    recebidoConfirmado: centavo(confirmado),
    recebidoPresumido: centavo(presumido),
    recebido: centavo(recebido),
    aReceber: centavo(aReceber),
    aReceberAteCorte: centavo(aReceberAteCorte),
    vencido: centavo(vencido),
    semData: centavo(semData),
    projetadoAteCorte: centavo(recebido + aReceberAteCorte),
  };
}

const centavo = (v: number) => Math.round(v * 100) / 100;

// ───────────── Frescor ─────────────

/** "há 3 horas", "há 2 dias", "nunca". */
export function idade(iso: string | null, agora: number = Date.now()): string {
  if (!iso) return "nunca";
  const ms = agora - new Date(iso).getTime();
  if (!Number.isFinite(ms)) return "nunca";
  const min = Math.max(0, Math.round(ms / 60000));
  if (min < 60) return min <= 1 ? "agora há pouco" : `há ${min} min`;
  const h = Math.round(min / 60);
  if (h < 48) return `há ${h} hora${h === 1 ? "" : "s"}`;
  const d = Math.round(h / 24);
  return `há ${d} dias`;
}
