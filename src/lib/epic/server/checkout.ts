import "server-only";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import type { Product } from "../products";

// Camada de checkout desacoplada (RF-042, Blueprint §21). A interface não
// sabe qual é o provedor: troca de Kiwify para outro = novo adapter aqui.

export type StatusTransacao = "pending" | "approved" | "refunded" | "chargeback" | "cancelled";

export interface EventoCheckout {
  tipo: "compra" | "reembolso" | "chargeback" | "pendente" | "recusada" | "abandono" | "ignorado";
  provider: string;
  /** Chave de idempotência do webhook (RF-047). */
  chave: string;
  transacaoId: string | null;
  status: StatusTransacao | null;
  produtoProvedor: string | null;
  produtoNome: string | null;
  email: string | null;
  nome: string | null;
  metodo: string | null;
  parcelas: number | null;
  bruto: number | null;
  taxa: number | null;
  liquido: number | null;
  /** Data prevista em que o dinheiro cai na conta (meta é caixa recebido). */
  previsaoRecebimento: string | null;
  aprovadoEm: string | null;
  reembolsadoEm: string | null;
  rastreio: { src: string | null; sck: string | null; utm_source: string | null; utm_medium: string | null; utm_campaign: string | null; utm_content: string | null };
  linkCheckout: string | null;
}

export interface ProvedorCheckout {
  nome: string;
  /** URL de checkout com rastreio para o webhook achar o lead e o Mapa. */
  montarUrl(p: Product, ctx: { leadId: string; mapResultId?: string | null; utm: Record<string, string | null> }): string;
  assinaturaValida(corpo: string, req: Request): boolean;
  interpretar(payload: Record<string, unknown>): EventoCheckout;
}

// ───────────────────────────── Kiwify ─────────────────────────────

const centavos = (v: unknown) => (typeof v === "number" ? Math.round(v) / 100 : typeof v === "string" && v ? Number(v) / 100 : null);
const texto = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : null);
const obj = (v: unknown) => (v && typeof v === "object" ? (v as Record<string, unknown>) : {});

export const kiwify: ProvedorCheckout = {
  nome: "kiwify",

  montarUrl(p, ctx) {
    const url = new URL(p.checkout_url!);
    // sck e src voltam no webhook em TrackingParameters: é como ligamos a
    // compra ao lead e ao Mapa sem depender do e-mail digitado no checkout.
    url.searchParams.set("sck", ctx.leadId);
    if (ctx.mapResultId) url.searchParams.set("src", ctx.mapResultId);
    for (const k of ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"]) {
      const v = ctx.utm[k];
      if (v) url.searchParams.set(k, v);
    }
    return url.toString();
  },

  /**
   * O Kiwify assina com HMAC-SHA1 do corpo usando o token do webhook e manda
   * no parâmetro ?signature= da URL. Sem token configurado: só staging aceita.
   */
  assinaturaValida(corpo, req) {
    const token = process.env.KIWIFY_WEBHOOK_TOKEN;
    if (!token) return process.env.NEXT_PUBLIC_EPIC_ENV !== "production";
    const recebida = new URL(req.url).searchParams.get("signature") ?? "";
    const esperada = createHmac("sha1", token).update(corpo).digest("hex");
    const a = Buffer.from(recebida);
    const b = Buffer.from(esperada);
    return a.length === b.length && timingSafeEqual(a, b);
  },

  interpretar(p) {
    const tracking = obj(p.TrackingParameters);
    const cliente = obj(p.Customer);
    const produto = obj(p.Product);
    const comissoes = obj(p.Commissions);
    const evento = texto(p.webhook_event_type);
    const statusPedido = texto(p.order_status);
    const pedido = texto(p.order_id);

    // Carrinho abandonado vem num formato próprio, sem order_id.
    if (!pedido && texto(p.status) === "abandoned") {
      return {
        tipo: "abandono", provider: "kiwify",
        chave: `abandono:${texto(p.id) ?? hash(JSON.stringify(p))}`,
        transacaoId: null, status: null,
        produtoProvedor: texto(p.product_id), produtoNome: texto(p.product_name),
        email: texto(p.email)?.toLowerCase() ?? null, nome: texto(p.name),
        metodo: null, parcelas: null, bruto: null, taxa: null, liquido: null,
        previsaoRecebimento: null, aprovadoEm: null, reembolsadoEm: null,
        rastreio: { src: null, sck: null, utm_source: null, utm_medium: null, utm_campaign: null, utm_content: null },
        linkCheckout: texto(p.checkout_link),
      };
    }

    let tipo: EventoCheckout["tipo"] = "ignorado";
    let status: StatusTransacao | null = null;
    if (evento === "order_approved" || statusPedido === "paid") { tipo = "compra"; status = "approved"; }
    else if (evento === "order_refunded" || statusPedido === "refunded") { tipo = "reembolso"; status = "refunded"; }
    else if (evento === "chargeback" || statusPedido === "chargedback") { tipo = "chargeback"; status = "chargeback"; }
    else if (evento === "billet_created" || evento === "pix_created" || statusPedido === "waiting_payment") { tipo = "pendente"; status = "pending"; }
    else if (evento === "order_rejected" || statusPedido === "refused") { tipo = "recusada"; status = "cancelled"; }

    const bruto = centavos(comissoes.charge_amount) ?? centavos(comissoes.product_base_price);
    const liquido = centavos(comissoes.my_commission);
    const taxa = bruto !== null && liquido !== null ? Math.round((bruto - liquido) * 100) / 100 : centavos(comissoes.kiwify_fee);

    return {
      tipo, provider: "kiwify",
      chave: `${pedido ?? hash(JSON.stringify(p))}:${evento ?? statusPedido ?? "?"}`,
      transacaoId: pedido, status,
      produtoProvedor: texto(produto.product_id), produtoNome: texto(produto.product_name),
      email: texto(cliente.email)?.toLowerCase() ?? null,
      nome: texto(cliente.first_name) ?? texto(cliente.full_name),
      metodo: texto(p.payment_method), parcelas: typeof p.installments === "number" ? p.installments : null,
      bruto, taxa, liquido,
      previsaoRecebimento: texto(comissoes.estimated_deposit_date),
      aprovadoEm: texto(p.approved_date), reembolsadoEm: texto(p.refunded_at),
      rastreio: {
        src: texto(tracking.src), sck: texto(tracking.sck),
        utm_source: texto(tracking.utm_source), utm_medium: texto(tracking.utm_medium),
        utm_campaign: texto(tracking.utm_campaign), utm_content: texto(tracking.utm_content),
      },
      linkCheckout: null,
    };
  },
};

function hash(s: string) {
  return createHash("sha256").update(s).digest("hex").slice(0, 32);
}

/** event_id determinístico por transação: reprocessar não duplica evento. */
export function eventIdDeTransacao(provider: string, transacao: string, tipo: string): string {
  const h = createHash("sha256").update(`${provider}:${transacao}:${tipo}`).digest("hex");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-4${h.slice(13, 16)}-8${h.slice(17, 20)}-${h.slice(20, 32)}`;
}

export const PROVEDOR = kiwify;
