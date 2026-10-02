import assert from "node:assert/strict";
import { test } from "node:test";
import { dataIso, interpretarKiwify, normalizarKiwify, proximoStatus, recebivelDaVenda } from "./kiwify";

const base = (extra: Record<string, unknown> = {}) => ({
  order_id: "ORD-1",
  webhook_event_type: "order_approved",
  order_status: "paid",
  payment_method: "credit_card",
  installments: 3,
  approved_date: "2026-10-01 21:51",
  Product: { product_id: "kw-plano", product_name: "Plano EPIC Energia 7 Dias" },
  Customer: { email: "Pessoa@Exemplo.com", first_name: "Pessoa" },
  Commissions: { charge_amount: 2900, my_commission: 2550, kiwify_fee: 350, estimated_deposit_date: "2026-10-31" },
  TrackingParameters: { sck: "lead-1", src: null, utm_source: "instagram", utm_campaign: "onda1_energia", utm_content: "reel_energia_007" },
  ...extra,
});

test("normaliza os eventos da Kiwify para o domínio interno", () => {
  assert.deepEqual(normalizarKiwify("order_approved", "paid"), { estado: "purchase_approved", status: "approved" });
  assert.deepEqual(normalizarKiwify("billet_created", "waiting_payment"), { estado: "payment_waiting", status: "pending" });
  assert.deepEqual(normalizarKiwify("pix_created", null), { estado: "payment_waiting", status: "pending" });
  assert.deepEqual(normalizarKiwify("order_rejected", "refused"), { estado: "payment_refused", status: "refused" });
  assert.deepEqual(normalizarKiwify("order_refunded", "refunded"), { estado: "refund", status: "refunded" });
  assert.deepEqual(normalizarKiwify("chargeback", "chargedback"), { estado: "chargeback", status: "chargeback" });
});

test("sem tipo de evento conhecido, decide pelo order_status", () => {
  assert.equal(normalizarKiwify(null, "paid")?.status, "approved");
  assert.equal(normalizarKiwify("evento_novo", "waiting_payment")?.status, "pending");
  assert.equal(normalizarKiwify(null, "REFUSED")?.status, "refused");
  assert.equal(normalizarKiwify(null, "canceled")?.status, "cancelled");
  assert.equal(normalizarKiwify("subscription_renewed", null), null);
  assert.equal(normalizarKiwify(null, null), null);
});

test("interpreta compra aprovada com valores em centavos e preserva o status bruto", () => {
  const ev = interpretarKiwify(base());
  assert.equal(ev.tipo, "compra");
  assert.equal(ev.estado, "purchase_approved");
  assert.equal(ev.status, "approved");
  assert.equal(ev.statusBruto, "paid");
  assert.equal(ev.transacaoId, "ORD-1");
  assert.equal(ev.chave, "ORD-1:order_approved");
  assert.equal(ev.bruto, 29);
  assert.equal(ev.liquido, 25.5);
  assert.equal(ev.taxa, 3.5);
  assert.equal(ev.parcelas, 3);
  assert.equal(ev.email, "pessoa@exemplo.com");
  assert.equal(ev.previsaoRecebimento, "2026-10-31");
  assert.equal(ev.rastreio.utm_content, "reel_energia_007");
});

test("pagamento aguardando e recusado viram pending e refused", () => {
  const boleto = interpretarKiwify(base({ webhook_event_type: "billet_created", order_status: "waiting_payment", approved_date: null }));
  assert.equal(boleto.tipo, "pendente");
  assert.equal(boleto.status, "pending");
  assert.equal(boleto.estado, "payment_waiting");
  const recusado = interpretarKiwify(base({ webhook_event_type: "order_rejected", order_status: "refused" }));
  assert.equal(recusado.tipo, "recusada");
  assert.equal(recusado.status, "refused");
  assert.equal(recusado.statusBruto, "refused");
});

test("id de evento do provedor tem prioridade na chave de idempotência", () => {
  assert.equal(interpretarKiwify(base({ webhook_event_id: "abc" })).chave, "evt:abc");
  // mesmo pedido, eventos diferentes: chaves diferentes
  const a = interpretarKiwify(base()).chave;
  const b = interpretarKiwify(base({ webhook_event_type: "order_refunded", order_status: "refunded" })).chave;
  assert.notEqual(a, b);
  // replay idêntico: mesma chave
  assert.equal(interpretarKiwify(base()).chave, a);
});

test("evento desconhecido é ignorado, carrinho abandonado tem formato próprio", () => {
  assert.equal(interpretarKiwify(base({ webhook_event_type: "subscription_late", order_status: "unknown" })).tipo, "ignorado");
  const ab = interpretarKiwify({ id: "cart-9", status: "abandoned", email: "X@Y.com", product_id: "kw-plano", checkout_link: "https://pay.kiwify.com.br/x" });
  assert.equal(ab.tipo, "abandono");
  assert.equal(ab.chave, "abandono:cart-9");
  assert.equal(ab.status, null);
});

test("webhook fora de ordem nunca rebaixa a venda", () => {
  assert.equal(proximoStatus(null, "pending"), "pending");
  assert.equal(proximoStatus("pending", "approved"), "approved");
  assert.equal(proximoStatus("refused", "approved"), "approved"); // nova tentativa aprovada
  assert.equal(proximoStatus("refused", "pending"), "pending");
  assert.equal(proximoStatus("approved", "pending"), "approved");
  assert.equal(proximoStatus("approved", "refused"), "approved");
  assert.equal(proximoStatus("approved", "approved"), "approved");
  assert.equal(proximoStatus("approved", "refunded"), "refunded");
  assert.equal(proximoStatus("approved", "chargeback"), "chargeback");
  assert.equal(proximoStatus("refunded", "approved"), "refunded");
  assert.equal(proximoStatus("refunded", "chargeback"), "chargeback");
  assert.equal(proximoStatus("chargeback", "refunded"), "chargeback");
});

test("recebível só nasce de venda aprovada com data e líquido informados", () => {
  const ok = interpretarKiwify(base());
  assert.deepEqual(recebivelDaVenda(ok), { parcela: 1, totalParcelas: 1, valorEsperado: 25.5, dataPrevista: "2026-10-31", taxa: 3.5 });
  const semData = interpretarKiwify(base({ Commissions: { charge_amount: 2900, my_commission: 2550 } }));
  assert.equal(recebivelDaVenda(semData), null);
  const semLiquido = interpretarKiwify(base({ Commissions: { charge_amount: 2900, estimated_deposit_date: "2026-10-31" } }));
  assert.equal(recebivelDaVenda(semLiquido), null);
  const pendente = interpretarKiwify(base({ webhook_event_type: "pix_created", order_status: "waiting_payment" }));
  assert.equal(recebivelDaVenda(pendente), null);
});

test("datas do provedor viram AAAA-MM-DD ou nada", () => {
  assert.equal(dataIso("2026-10-03"), "2026-10-03");
  assert.equal(dataIso("2026-10-03 12:00:00"), "2026-10-03");
  assert.equal(dataIso("03/10/2026"), "2026-10-03");
  assert.equal(dataIso("em breve"), null);
  assert.equal(dataIso(null), null);
});
