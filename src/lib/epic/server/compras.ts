import "server-only";
import { isDimensionId } from "../dimensions";
import { agendarAutomacao, cancelarAutomacoes, ENCERRA_NA_COMPRA } from "./automations";
import { eventIdDeTransacao, type EventoCheckout } from "./checkout";
import { registrarConsentimento } from "./consent";
import type { Q } from "./db";
import { registrarEvento, type EventoNome } from "./events";
import { leadPorEmail, seguirLead } from "./identity";
import { prepararPlano } from "./planos";

// Processamento de compras (RF-043 a RF-047). Tudo idempotente: o mesmo
// webhook processado duas vezes não duplica transação, evento, e-mail nem
// acesso. Efeitos colaterais só acontecem na TRANSIÇÃO de status.

export class ProdutoNaoMapeado extends Error {}

const ESTAGIO: Record<string, string> = {
  plan: "plan_buyer",
  kit: "kit_buyer",
  protocol: "protocol_buyer",
  mentoring: "mentoring_client",
};
const EVENTO_COMPRA: Record<string, EventoNome> = {
  plan: "PurchasePlan",
  kit: "PurchaseKit",
  protocol: "PurchaseProtocol",
  mentoring: "Purchase",
};
const AUTOMACAO_COMPRA: Record<string, string> = {
  plan: "AUT_PLAN_PURCHASE",
  kit: "AUT_KIT_PURCHASE",
  protocol: "AUT_PROTOCOL_PURCHASE",
  mentoring: "AUT_MENTORING_PURCHASE",
};

interface Produto {
  product_id: string;
  product_type: string;
  product_dimension: string | null;
  price_list: string;
}

async function produtoDoProvedor(q: Q, ev: EventoCheckout): Promise<Produto> {
  const [p] = await q<Produto>(
    "select product_id, product_type, product_dimension, price_list from products where provider_product_id = $1",
    [ev.produtoProvedor]
  );
  if (!p) throw new ProdutoNaoMapeado(`Produto do ${ev.provider} sem mapeamento: ${ev.produtoProvedor} (${ev.produtoNome ?? "sem nome"})`);
  return p;
}

async function leadDaCompra(q: Q, ev: EventoCheckout): Promise<string> {
  // 1) sck = lead_id que mandamos no link de checkout; 2) e-mail do checkout.
  if (ev.rastreio.sck) {
    const lead = await seguirLead(q, ev.rastreio.sck);
    if (lead) {
      if (ev.email) {
        const [l] = await q<{ email: string | null }>("select email from leads where lead_id = $1", [lead]);
        if (!l.email) {
          const [dono] = await q<{ lead_id: string }>(
            "select lead_id from leads where lower(email) = $1 and merged_into is null", [ev.email]
          );
          if (!dono) await q("update leads set email = $2, first_name = coalesce(first_name, $3) where lead_id = $1", [lead, ev.email, ev.nome]);
        }
      }
      return lead;
    }
  }
  if (!ev.email) throw new Error("Compra sem sck válido e sem e-mail");
  return leadPorEmail(q, ev.email, ev.nome, {
    source: ev.rastreio.utm_source, medium: ev.rastreio.utm_medium, campaign: ev.rastreio.utm_campaign,
    content: ev.rastreio.utm_content, term: null, landing_page: null, referrer: null,
  });
}

export interface ResultadoCompra {
  acao: "nova_compra" | "reembolso" | "chargeback" | "atualizada" | "abandono" | "ignorada";
  leadId?: string;
  productId?: string;
  valor?: number;
  eventId?: string;
  email?: string | null;
}

export async function processarEventoCheckout(q: Q, ev: EventoCheckout): Promise<ResultadoCompra> {
  if (ev.tipo === "ignorado") return { acao: "ignorada" };

  // ── Carrinho abandonado ──
  if (ev.tipo === "abandono") {
    if (!ev.email) return { acao: "ignorada" };
    const produto = await produtoDoProvedor(q, ev);
    const lead = await leadPorEmail(q, ev.email, ev.nome, null);
    const [jaComprou] = await q(
      `select 1 from transactions where lead_id = $1 and product_id = $2 and transaction_status = 'approved'`,
      [lead, produto.product_id]
    );
    if (jaComprou) return { acao: "ignorada" };
    await registrarEvento(q, "StartCheckout", {
      event_id: eventIdDeTransacao(ev.provider, ev.chave, "abandono"),
      lead_id: lead, product_id: produto.product_id, product_type: produto.product_type,
      product_price: Number(produto.price_list), props: { origem: "abandono_checkout" },
    });
    // Uma recuperação por lead+produto por dia (dedupe da fila).
    const dia = new Date().toISOString().slice(0, 10);
    await agendarAutomacao(q, lead, "AUT_CHECKOUT_ABANDON", {
      transaction_id: `chk:${produto.product_id}:${dia}`, product_id: produto.product_id,
      dimension: produto.product_dimension ?? undefined, checkout_link: ev.linkCheckout,
    });
    return { acao: "abandono", leadId: lead, productId: produto.product_id };
  }

  if (!ev.transacaoId || !ev.status) return { acao: "ignorada" };
  const produto = await produtoDoProvedor(q, ev);
  const lead = await leadDaCompra(q, ev);

  const [anterior] = await q<{ transaction_status: string }>(
    "select transaction_status from transactions where provider = $1 and transaction_id = $2 for update",
    [ev.provider, ev.transacaoId]
  );

  await q(
    `insert into transactions (provider, transaction_id, lead_id, product_id, transaction_status, payment_method,
       installments, amount_gross, amount_fee, amount_net, amount_received, buyer_email, purchased_at, approved_at,
       received_at, refunded_at, utm_source, utm_medium, utm_campaign, utm_content)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12, now(), $13, $14, $15, $16,$17,$18,$19)
     on conflict (provider, transaction_id) do update set
       transaction_status = excluded.transaction_status,
       lead_id = coalesce(transactions.lead_id, excluded.lead_id),
       payment_method = coalesce(excluded.payment_method, transactions.payment_method),
       installments = coalesce(excluded.installments, transactions.installments),
       amount_gross = coalesce(excluded.amount_gross, transactions.amount_gross),
       amount_fee = coalesce(excluded.amount_fee, transactions.amount_fee),
       amount_net = coalesce(excluded.amount_net, transactions.amount_net),
       amount_received = case when excluded.transaction_status = 'approved'
                              then coalesce(excluded.amount_received, transactions.amount_received)
                              else 0 end,
       approved_at = coalesce(transactions.approved_at, excluded.approved_at),
       received_at = coalesce(excluded.received_at, transactions.received_at),
       refunded_at = coalesce(excluded.refunded_at, transactions.refunded_at),
       updated_at = now()`,
    [
      ev.provider, ev.transacaoId, lead, produto.product_id, ev.status, ev.metodo, ev.parcelas,
      ev.bruto, ev.taxa, ev.liquido,
      // Caixa: o valor líquido entra como recebido na data prevista de depósito.
      ev.status === "approved" ? ev.liquido : 0,
      ev.email,
      ev.status === "approved" ? (ev.aprovadoEm ?? new Date().toISOString()) : null,
      ev.status === "approved" ? ev.previsaoRecebimento : null,
      ev.status === "refunded" || ev.status === "chargeback" ? (ev.reembolsadoEm ?? new Date().toISOString()) : null,
      ev.rastreio.utm_source, ev.rastreio.utm_medium, ev.rastreio.utm_campaign, ev.rastreio.utm_content,
    ]
  );

  const tipo = produto.product_type;
  const valor = ev.bruto ?? Number(produto.price_list);

  // ── Nova aprovação: efeitos colaterais uma única vez ──
  if (ev.status === "approved" && anterior?.transaction_status !== "approved") {
    await registrarConsentimento(q, lead, "checkout", false); // compra não é aceite de marketing
    await q("select promote_lifecycle($1, $2)", [lead, ESTAGIO[tipo]]);
    const eventId = eventIdDeTransacao(ev.provider, ev.transacaoId, "purchase");
    const comum = {
      lead_id: lead, product_id: produto.product_id, product_type: tipo, product_price: valor,
      transaction_id: ev.transacaoId, dimension: produto.product_dimension,
      utm_source: ev.rastreio.utm_source, utm_medium: ev.rastreio.utm_medium,
      utm_campaign: ev.rastreio.utm_campaign, utm_content: ev.rastreio.utm_content,
    };
    await registrarEvento(q, "Purchase", { ...comum, event_id: eventId });
    if (EVENTO_COMPRA[tipo] !== "Purchase") {
      await registrarEvento(q, EVENTO_COMPRA[tipo], { ...comum, event_id: eventIdDeTransacao(ev.provider, ev.transacaoId, tipo) });
    }
    await cancelarAutomacoes(q, lead, ENCERRA_NA_COMPRA[tipo] ?? [], `comprou_${tipo}`);

    const ctx: Record<string, unknown> = {
      transaction_id: ev.transacaoId, product_id: produto.product_id,
      dimension: produto.product_dimension ?? undefined,
    };
    if (tipo === "plan" && produto.product_dimension && isDimensionId(produto.product_dimension)) {
      const plano = await prepararPlano(q, {
        lead, dim: produto.product_dimension, productId: produto.product_id,
        provider: ev.provider, transacao: ev.transacaoId, mapResultId: ev.rastreio.src,
      });
      ctx.plan_token = plano.token;
      ctx.plan_ready = plano.gerado;
    }
    if (tipo === "mentoring") {
      await q(
        `update mentoring_applications set status = 'client' where lead_id = $1 and status <> 'client'`, [lead]
      );
    }
    await agendarAutomacao(q, lead, AUTOMACAO_COMPRA[tipo], ctx);
    return { acao: "nova_compra", leadId: lead, productId: produto.product_id, valor, eventId, email: ev.email };
  }

  // ── Reembolso / chargeback (RF-045/046): histórico preservado ──
  if ((ev.status === "refunded" || ev.status === "chargeback") && anterior?.transaction_status !== ev.status) {
    await registrarEvento(q, "Refund", {
      event_id: eventIdDeTransacao(ev.provider, ev.transacaoId, ev.status),
      lead_id: lead, product_id: produto.product_id, product_type: tipo,
      product_price: valor, transaction_id: ev.transacaoId, props: { tipo: ev.status },
    });
    // Encerra o onboarding daquele produto e revoga o acesso ao Plano.
    await q(
      `update messages set status = 'cancelled', skip_reason = $3
       where lead_id = $1 and status = 'scheduled' and context->>'transaction_id' = $2`,
      [lead, ev.transacaoId, ev.status]
    );
    await q(
      `update plan_generations set access_token = null where provider = $1 and transaction_id = $2`,
      [ev.provider, ev.transacaoId]
    );
    return { acao: ev.status === "refunded" ? "reembolso" : "chargeback", leadId: lead, productId: produto.product_id };
  }

  return { acao: "atualizada", leadId: lead, productId: produto.product_id };
}
