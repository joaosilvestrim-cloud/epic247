import "server-only";
import { isDimensionId } from "../dimensions";
import { agendarAutomacao, cancelarAutomacoes, ENCERRA_NA_COMPRA } from "./automations";
import { proximoStatus, recebivelDaVenda, type StatusTransacao } from "../pagamentos/kiwify";
import { eventIdDeTransacao, type EventoCheckout } from "./checkout";
import { registrarConsentimento } from "./consent";
import type { Q } from "./db";
import { registrarEvento, type EventoNome } from "./events";
import { leadPorEmail, seguirLead } from "./identity";
import { prepararPlano } from "./planos";

// Processamento de compras (RF-043 a RF-047, Modelo de Dados §65). Tudo
// idempotente: o mesmo webhook processado duas vezes não duplica transação,
// evento, recebível, e-mail nem acesso. Efeitos colaterais só acontecem na
// TRANSIÇÃO de status, e webhook fora de ordem nunca rebaixa uma venda.
// Pendente e recusada não liberam produto, não mexem no lifecycle e não
// entram no histórico de compras.

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
  mentoring: "PurchaseMentoring",
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

/** Pagamento ainda não aprovado: acha o lead, mas não cria nem identifica ninguém. */
async function leadExistente(q: Q, ev: EventoCheckout): Promise<string | null> {
  if (ev.rastreio.sck) {
    const lead = await seguirLead(q, ev.rastreio.sck);
    if (lead) return lead;
  }
  if (!ev.email) return null;
  const [l] = await q<{ lead_id: string }>(
    "select lead_id from leads where lower(email) = $1 and merged_into is null", [ev.email]
  );
  return l?.lead_id ?? null;
}

export interface ResultadoCompra {
  acao: "nova_compra" | "reembolso" | "chargeback" | "pendente" | "recusada" | "atualizada" | "abandono" | "ignorada";
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
    // Mentoria: só existe checkout depois que a equipe liberou o link (Matriz §26).
    let linkMentoria: string | null = null;
    if (produto.product_type === "mentoring") {
      const [c] = await q<{ payment_link_url: string | null }>(
        `select payment_link_url from mentoring_applications
         where lead_id = $1 and status = 'link_enviado' and payment_link_sent_at is not null
         order by payment_link_sent_at desc limit 1`,
        [lead]
      );
      if (!c) return { acao: "ignorada" };
      linkMentoria = c.payment_link_url;
    }
    await registrarEvento(q, "StartCheckout", {
      event_id: eventIdDeTransacao(ev.provider, ev.chave, "abandono"),
      lead_id: lead, product_id: produto.product_id, product_type: produto.product_type,
      product_price: Number(produto.price_list), props: { origem: "abandono_checkout" },
    });
    // Uma recuperação por lead+produto por dia (dedupe da fila).
    const dia = new Date().toISOString().slice(0, 10);
    await agendarAutomacao(q, lead, "AUT_CHECKOUT_ABANDON", {
      transaction_id: `chk:${produto.product_id}:${dia}`, product_id: produto.product_id,
      dimension: produto.product_dimension ?? undefined, checkout_link: linkMentoria ?? ev.linkCheckout,
    });
    return { acao: "abandono", leadId: lead, productId: produto.product_id };
  }

  if (!ev.transacaoId || !ev.status) return { acao: "ignorada" };
  const produto = await produtoDoProvedor(q, ev);

  const [anterior] = await q<{ transaction_status: StatusTransacao; lead_id: string | null }>(
    "select transaction_status, lead_id from transactions where provider = $1 and transaction_id = $2 for update",
    [ev.provider, ev.transacaoId]
  );
  const status = proximoStatus(anterior?.transaction_status, ev.status);
  // Webhook atrasado (ex.: "aguardando" depois de aprovada): nada muda.
  if (anterior && status !== ev.status) return { acao: "ignorada" };

  const pago = status === "approved" || status === "refunded" || status === "chargeback";
  const lead = pago ? await leadDaCompra(q, ev) : (anterior?.lead_id ?? (await leadExistente(q, ev)));

  await q(
    `insert into transactions (provider, transaction_id, lead_id, product_id, transaction_status, payment_method,
       installments, amount_gross, amount_fee, amount_net, amount_received, buyer_email, purchased_at, approved_at,
       received_at, refunded_at, utm_source, utm_medium, utm_campaign, utm_content,
       provider_transaction_id, provider_status_raw, provider_event_id)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12, now(), $13, $14, $15, $16,$17,$18,$19, $2, $20, $21)
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
       provider_transaction_id = coalesce(transactions.provider_transaction_id, excluded.provider_transaction_id),
       provider_status_raw = coalesce(excluded.provider_status_raw, transactions.provider_status_raw),
       provider_event_id = coalesce(excluded.provider_event_id, transactions.provider_event_id),
       updated_at = now()`,
    [
      ev.provider, ev.transacaoId, lead, produto.product_id, status, ev.metodo, ev.parcelas,
      ev.bruto, ev.taxa, ev.liquido,
      // Caixa: o valor líquido entra como recebido na data prevista de depósito.
      status === "approved" ? ev.liquido : 0,
      ev.email,
      status === "approved" ? (ev.aprovadoEm ?? new Date().toISOString()) : null,
      status === "approved" ? ev.previsaoRecebimento : null,
      status === "refunded" || status === "chargeback" ? (ev.reembolsadoEm ?? new Date().toISOString()) : null,
      ev.rastreio.utm_source, ev.rastreio.utm_medium, ev.rastreio.utm_campaign, ev.rastreio.utm_content,
      ev.statusBruto, ev.eventoProvedorId,
    ]
  );
  const mudou = anterior?.transaction_status !== status;

  const tipo = produto.product_type;
  const valor = ev.bruto ?? Number(produto.price_list);

  // ── Nova aprovação: efeitos colaterais uma única vez ──
  if (status === "approved" && mudou && lead) {
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
    // Eventos de sucesso (Matriz): compra depois de e-mail da nutrição ou da recuperação de checkout.
    const [origem] = await q<{ nutricao: boolean; recuperacao: boolean }>(
      `select
         exists (select 1 from messages where lead_id = $1 and automation_id = 'AUT_MAP_NURTURE'
                 and status = 'sent' and sent_at > now() - interval '21 days') as nutricao,
         exists (select 1 from messages where lead_id = $1 and automation_id = 'AUT_CHECKOUT_ABANDON'
                 and status = 'sent' and context->>'product_id' = $2 and sent_at > now() - interval '14 days') as recuperacao`,
      [lead, produto.product_id]
    );
    if (origem?.nutricao) {
      await registrarEvento(q, "MapNurtureConversion", {
        ...comum, event_id: eventIdDeTransacao(ev.provider, ev.transacaoId, "nurture_conversion"),
      });
    }
    if (origem?.recuperacao) {
      await registrarEvento(q, "RecoveredCheckout", {
        ...comum, event_id: eventIdDeTransacao(ev.provider, ev.transacaoId, "recovered_checkout"),
      });
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
      // Pagamento confirmado: a candidatura aberta vira cliente ativo. Pagou
      // sem candidatura (link repassado)? Abre uma já ativa, para a equipe ver.
      const ativadas = await q(
        `update mentoring_applications set status = 'ativo', status_changed_at = now(), updated_at = now()
         where lead_id = $1 and status in ('novo','em_contato','vaga_confirmada','link_enviado','lista_espera')
         returning id`,
        [lead]
      );
      if (!ativadas.length) {
        await q(
          `insert into mentoring_applications (lead_id, name, email, status, status_changed_at)
           select l.lead_id, coalesce(l.first_name, $3, l.email, 'Sem nome'), coalesce(l.email, $2, ''), 'ativo', now()
           from leads l where l.lead_id = $1
             and not exists (select 1 from mentoring_applications a where a.lead_id = $1 and a.status = 'ativo')`,
          [lead, ev.email, ev.nome]
        );
      }
      await q("update leads set mentoring_waitlist = false where lead_id = $1", [lead]);
    }
    await agendarAutomacao(q, lead, AUTOMACAO_COMPRA[tipo], ctx);
    // Recebível só com data e valor informados pelo provedor (§58, §65).
    const rec = recebivelDaVenda({ ...ev, status });
    if (rec) {
      await q(
        `insert into receivables (provider, transaction_id, installment_number, installment_total, expected_amount,
           expected_date, receivable_status, fee_amount, source_system, source_record_id, source_updated_at)
         values ($1, $2, $3, $4, $5, $6, 'scheduled', $7, 'kiwify_webhook', $8, now())
         on conflict do nothing`,
        [ev.provider, ev.transacaoId, rec.parcela, rec.totalParcelas, rec.valorEsperado, rec.dataPrevista, rec.taxa,
          `${ev.provider}:${ev.transacaoId}:${rec.parcela}`]
      );
    }
    return { acao: "nova_compra", leadId: lead, productId: produto.product_id, valor, eventId, email: ev.email };
  }

  // ── Reembolso / chargeback (RF-045/046): histórico preservado ──
  if ((status === "refunded" || status === "chargeback") && mudou) {
    await registrarEvento(q, "Refund", {
      event_id: eventIdDeTransacao(ev.provider, ev.transacaoId, status),
      lead_id: lead, product_id: produto.product_id, product_type: tipo,
      product_price: valor, transaction_id: ev.transacaoId, props: { tipo: status },
    });
    if (status === "chargeback") {
      await registrarEvento(q, "Chargeback", {
        event_id: eventIdDeTransacao(ev.provider, ev.transacaoId, "chargeback_evento"),
        lead_id: lead, product_id: produto.product_id, product_type: tipo,
        product_price: valor, transaction_id: ev.transacaoId,
      });
    }
    // O caixa daquela venda volta (ou deixa de entrar): recebíveis acompanham.
    await q(
      `update receivables set receivable_status = $3, updated_at = now(), source_updated_at = now()
       where provider = $1 and transaction_id = $2 and receivable_status not in ('cancelled', 'refunded', 'chargeback')`,
      [ev.provider, ev.transacaoId, status]
    );
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
    return { acao: status === "refunded" ? "reembolso" : "chargeback", leadId: lead ?? undefined, productId: produto.product_id };
  }

  // ── Aguardando pagamento / recusado: só registro, nada é liberado ──
  if ((status === "pending" || status === "refused" || status === "cancelled") && mudou) {
    const nome = status === "pending" ? "PaymentWaiting" : "PaymentRefused";
    await registrarEvento(q, nome, {
      event_id: eventIdDeTransacao(ev.provider, ev.transacaoId, `${nome}:${status}`),
      lead_id: lead, product_id: produto.product_id, product_type: tipo, product_price: valor,
      transaction_id: ev.transacaoId, dimension: produto.product_dimension,
      utm_source: ev.rastreio.utm_source, utm_medium: ev.rastreio.utm_medium,
      utm_campaign: ev.rastreio.utm_campaign, utm_content: ev.rastreio.utm_content,
      props: { status, metodo: ev.metodo },
    });
    return { acao: status === "pending" ? "pendente" : "recusada", leadId: lead ?? undefined, productId: produto.product_id };
  }

  return { acao: "atualizada", leadId: lead ?? undefined, productId: produto.product_id };
}
