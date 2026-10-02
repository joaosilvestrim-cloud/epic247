import { createHash } from "node:crypto";

// Adapter da Kiwify (Blueprint §55, Modelo de Dados §65, RC1 §5).
// Função pura: payload do webhook → evento no vocabulário interno. Nada da
// nomenclatura da Kiwify passa daqui para o domínio, exceto provider_status_raw,
// que é só auditoria.
//
// Os nomes de evento e status abaixo seguem os payloads recebidos e a
// documentação pública da Kiwify. Os marcados "a confirmar" precisam ser
// conferidos contra um payload real antes da produção.

/** Estado interno da transação (transactions.transaction_status). */
export type StatusTransacao = "pending" | "approved" | "refused" | "refunded" | "chargeback" | "cancelled";

/** Estado operacional normalizado do pagamento (Blueprint §55). */
export type EstadoPagamento = "purchase_approved" | "payment_waiting" | "payment_refused" | "refund" | "chargeback";

export interface EventoCheckout {
  tipo: "compra" | "reembolso" | "chargeback" | "pendente" | "recusada" | "abandono" | "ignorado";
  /** Estado normalizado. null em abandono e evento ignorado. */
  estado: EstadoPagamento | null;
  provider: string;
  /** Chave de idempotência do webhook (RF-047, §65). */
  chave: string;
  /** Id do evento no provedor, quando ele manda (prioridade 1 de deduplicação). */
  eventoProvedorId: string | null;
  transacaoId: string | null;
  status: StatusTransacao | null;
  /** Valor recebido do provedor, sem tradução. Nunca usar como regra de negócio. */
  statusBruto: string | null;
  produtoProvedor: string | null;
  produtoNome: string | null;
  email: string | null;
  nome: string | null;
  metodo: string | null;
  parcelas: number | null;
  bruto: number | null;
  taxa: number | null;
  liquido: number | null;
  /** Data prevista em que o dinheiro cai na conta (AAAA-MM-DD). */
  previsaoRecebimento: string | null;
  aprovadoEm: string | null;
  reembolsadoEm: string | null;
  rastreio: { src: string | null; sck: string | null; utm_source: string | null; utm_medium: string | null; utm_campaign: string | null; utm_content: string | null };
  linkCheckout: string | null;
}

type Normalizado = { estado: EstadoPagamento; status: StatusTransacao };

const APROVADO: Normalizado = { estado: "purchase_approved", status: "approved" };
const AGUARDANDO: Normalizado = { estado: "payment_waiting", status: "pending" };
const RECUSADO: Normalizado = { estado: "payment_refused", status: "refused" };
const CANCELADO: Normalizado = { estado: "payment_refused", status: "cancelled" };
const REEMBOLSO: Normalizado = { estado: "refund", status: "refunded" };
const CHARGEBACK: Normalizado = { estado: "chargeback", status: "chargeback" };

/** webhook_event_type da Kiwify. */
export const EVENTOS_KIWIFY: Record<string, Normalizado> = {
  order_approved: APROVADO,
  billet_created: AGUARDANDO,
  pix_created: AGUARDANDO,
  order_rejected: RECUSADO,
  order_refunded: REEMBOLSO,
  chargeback: CHARGEBACK,
};

/** order_status da Kiwify (usado quando o tipo de evento não decide). */
export const STATUS_KIWIFY: Record<string, Normalizado> = {
  paid: APROVADO,
  approved: APROVADO, // a confirmar
  waiting_payment: AGUARDANDO,
  pending: AGUARDANDO, // a confirmar
  processing: AGUARDANDO, // a confirmar
  authorized: AGUARDANDO, // a confirmar: cartão autorizado, ainda não capturado
  refused: RECUSADO,
  rejected: RECUSADO, // a confirmar
  refunded: REEMBOLSO,
  chargedback: CHARGEBACK,
  chargeback: CHARGEBACK, // a confirmar
  canceled: CANCELADO, // a confirmar
  cancelled: CANCELADO, // a confirmar
  expired: CANCELADO, // a confirmar: boleto ou Pix vencido
};

/** Traduz evento e status da Kiwify. null = não muda a venda (ex.: assinatura, pedido de reembolso em análise). */
export function normalizarKiwify(evento: string | null, statusPedido: string | null): Normalizado | null {
  const e = evento?.trim().toLowerCase();
  const s = statusPedido?.trim().toLowerCase();
  if (e && EVENTOS_KIWIFY[e]) return EVENTOS_KIWIFY[e];
  if (s && STATUS_KIWIFY[s]) return STATUS_KIWIFY[s];
  return null;
}

const TIPO: Record<EstadoPagamento, EventoCheckout["tipo"]> = {
  purchase_approved: "compra",
  payment_waiting: "pendente",
  payment_refused: "recusada",
  refund: "reembolso",
  chargeback: "chargeback",
};

/**
 * Estado que a transação assume ao receber um novo status. Webhook fora de
 * ordem ou repetido nunca rebaixa uma venda: aprovada só vira reembolso ou
 * chargeback; reembolsada só vira chargeback; chargeback é final. Pendente,
 * recusada e cancelada aceitam qualquer status seguinte (nova tentativa).
 */
export function proximoStatus(atual: StatusTransacao | null | undefined, recebido: StatusTransacao): StatusTransacao {
  if (!atual || atual === recebido) return recebido;
  if (atual === "approved") return recebido === "refunded" || recebido === "chargeback" ? recebido : atual;
  if (atual === "refunded") return recebido === "chargeback" ? recebido : atual;
  if (atual === "chargeback") return atual;
  return recebido;
}

const centavos = (v: unknown) =>
  typeof v === "number" ? Math.round(v) / 100 : typeof v === "string" && v.trim() && Number.isFinite(Number(v)) ? Number(v) / 100 : null;
const texto = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : typeof v === "number" ? String(v) : null);
const obj = (v: unknown) => (v && typeof v === "object" ? (v as Record<string, unknown>) : {});

/** "2026-10-03", "2026-10-03 10:00", "03/10/2026" → "2026-10-03". Outro formato → null. */
export function dataIso(v: unknown): string | null {
  const t = texto(v);
  if (!t) return null;
  let m = t.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return `${m[1]}-${m[2]}-${m[3]}`;
  m = t.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
  if (m) return `${m[3]}-${m[2]}-${m[1]}`;
  return null;
}

export function hashCurto(s: string) {
  return createHash("sha256").update(s).digest("hex").slice(0, 32);
}

const SEM_RASTREIO = { src: null, sck: null, utm_source: null, utm_medium: null, utm_campaign: null, utm_content: null };

export function interpretarKiwify(p: Record<string, unknown>): EventoCheckout {
  const tracking = obj(p.TrackingParameters);
  const cliente = obj(p.Customer);
  const produto = obj(p.Product);
  const comissoes = obj(p.Commissions);
  const evento = texto(p.webhook_event_type);
  const statusPedido = texto(p.order_status);
  const pedido = texto(p.order_id);
  // a confirmar: a Kiwify não documenta id de evento; se vier, tem prioridade.
  const eventoId = texto(p.webhook_event_id) ?? texto(p.event_id);

  // Carrinho abandonado vem num formato próprio, sem order_id.
  if (!pedido && texto(p.status) === "abandoned") {
    return {
      tipo: "abandono", estado: null, provider: "kiwify",
      chave: `abandono:${texto(p.id) ?? hashCurto(JSON.stringify(p))}`, eventoProvedorId: null,
      transacaoId: null, status: null, statusBruto: "abandoned",
      produtoProvedor: texto(p.product_id), produtoNome: texto(p.product_name),
      email: texto(p.email)?.toLowerCase() ?? null, nome: texto(p.name),
      metodo: null, parcelas: null, bruto: null, taxa: null, liquido: null,
      previsaoRecebimento: null, aprovadoEm: null, reembolsadoEm: null,
      rastreio: { ...SEM_RASTREIO }, linkCheckout: texto(p.checkout_link),
    };
  }

  const n = normalizarKiwify(evento, statusPedido);
  const bruto = centavos(comissoes.charge_amount) ?? centavos(comissoes.product_base_price);
  const liquido = centavos(comissoes.my_commission);
  const taxa = bruto !== null && liquido !== null ? Math.round((bruto - liquido) * 100) / 100 : centavos(comissoes.kiwify_fee);
  const parcelas = typeof p.installments === "number" ? p.installments : texto(p.installments) ? Number(p.installments) || null : null;

  return {
    tipo: n ? TIPO[n.estado] : "ignorado",
    estado: n?.estado ?? null,
    provider: "kiwify",
    chave: eventoId ? `evt:${eventoId}` : `${pedido ?? hashCurto(JSON.stringify(p))}:${evento ?? statusPedido ?? "?"}`,
    eventoProvedorId: eventoId,
    transacaoId: pedido,
    status: n?.status ?? null,
    statusBruto: statusPedido ?? evento,
    produtoProvedor: texto(produto.product_id), produtoNome: texto(produto.product_name),
    email: texto(cliente.email)?.toLowerCase() ?? null,
    nome: texto(cliente.first_name) ?? texto(cliente.full_name),
    metodo: texto(p.payment_method), parcelas,
    bruto, taxa, liquido,
    previsaoRecebimento: dataIso(comissoes.estimated_deposit_date),
    aprovadoEm: texto(p.approved_date), reembolsadoEm: texto(p.refunded_at),
    rastreio: {
      src: texto(tracking.src), sck: texto(tracking.sck),
      utm_source: texto(tracking.utm_source), utm_medium: texto(tracking.utm_medium),
      utm_campaign: texto(tracking.utm_campaign), utm_content: texto(tracking.utm_content),
    },
    linkCheckout: null,
  };
}

export interface RecebivelPrevisto {
  parcela: number;
  totalParcelas: number;
  valorEsperado: number;
  dataPrevista: string;
  taxa: number | null;
}

/**
 * Recebível que a venda aprovada gera, só com dado confiável do provedor
 * (Modelo de Dados §65). A Kiwify manda uma data prevista de depósito e o
 * líquido da venda; parcelamento no cartão não muda isso (uma data só).
 * Sem data ou sem líquido: null. Nada de data inventada.
 */
export function recebivelDaVenda(ev: Pick<EventoCheckout, "status" | "liquido" | "previsaoRecebimento" | "taxa">): RecebivelPrevisto | null {
  if (ev.status !== "approved") return null;
  if (ev.liquido == null || !(ev.liquido >= 0) || !ev.previsaoRecebimento) return null;
  return { parcela: 1, totalParcelas: 1, valorEsperado: ev.liquido, dataPrevista: ev.previsaoRecebimento, taxa: ev.taxa };
}
