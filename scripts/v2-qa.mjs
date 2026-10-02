// QA de ponta a ponta do 2.0 contra o staging (RF-091 a RF-094).
// Percorre o caminho de um visitante real pelas APIs e confere o banco:
// identidade e atribuição, Mapa, captura, checkout, compra pelo webhook,
// webhook repetido, supressão de oferta, acesso ao Plano, reembolso,
// chargeback, união de visitantes pelo e-mail e eventos.
//
// Uso (com o site rodando contra o staging):
//   node scripts/v2-qa.mjs                    (site em http://localhost:3100)
//   QA_URL=https://<preview>.vercel.app node scripts/v2-qa.mjs
//   MANTER=1 node scripts/v2-qa.mjs           (não apaga os dados de teste no fim)
//
// Recusa rodar no schema de produção. Mexe por alguns segundos no produto
// plan_energia (ativa com um link de teste) e devolve como estava no fim.
import { execSync } from "node:child_process";
import { createHmac, randomUUID } from "node:crypto";
import fs from "node:fs";
import { createRequire } from "node:module";
import pg from "pg";

for (const linha of fs.existsSync(".env.local") ? fs.readFileSync(".env.local", "utf8").split(/\r?\n/) : []) {
  const m = linha.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2];
}
const S = process.env.EPIC_DB_SCHEMA;
if (!S || !/^[a-z_][a-z0-9_]*$/.test(S)) throw new Error("EPIC_DB_SCHEMA ausente ou inválido");
if (S === "v2") throw new Error("Este QA cria e apaga dados: não roda no schema de produção (v2).");
const BASE = (process.env.QA_URL || "http://localhost:3100").replace(/\/$/, "");
const TOKEN_KIWIFY = process.env.KIWIFY_WEBHOOK_TOKEN || "";

// Configuração dos Mapas: a mesma que o site usa, compilada pelo npm test.
if (!fs.existsSync(".test-build/maps/energia.js")) execSync("npx tsc -p tsconfig.test.json", { stdio: "inherit" });
const require = createRequire(import.meta.url);
const { ENERGIA } = require(process.cwd() + "/.test-build/maps/energia.js");
const { FRICCAO } = require(process.cwd() + "/.test-build/maps/friccao.js");

const db = new pg.Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
await db.connect();
const sql = async (texto, params = []) => (await db.query(texto.replaceAll("§", `${S}.`), params)).rows;

// ── Relatório ──
let falhas = 0;
let total = 0;
function confere(cond, descricao, detalhe = "") {
  total++;
  if (cond) console.log(`  ok   ${descricao}`);
  else {
    falhas++;
    console.log(`  FALHA ${descricao}${detalhe ? `  (${detalhe})` : ""}`);
  }
}
const secao = (t) => console.log(`\n${t}`);

// ── Navegador simulado (um pote de cookies por visitante) ──
function visitante() {
  const pote = new Map();
  const cookie = () => [...pote].map(([k, v]) => `${k}=${v}`).join("; ");
  const guardar = (r) => {
    for (const c of r.headers.getSetCookie?.() ?? []) {
      const [par] = c.split(";");
      const i = par.indexOf("=");
      pote.set(par.slice(0, i), par.slice(i + 1));
    }
  };
  // IP fictício por execução: rodar o QA várias vezes não esbarra no limite de requisições.
  const ip = `198.51.100.${Math.floor(Math.random() * 250) + 1}`;
  const cab = () => ({
    cookie: cookie(), "user-agent": "Mozilla/5.0 (QA EPIC247) Chrome/130", "content-type": "application/json", "x-forwarded-for": ip,
  });
  return {
    pote,
    async post(caminho, corpo) {
      const r = await fetch(BASE + caminho, { method: "POST", headers: cab(), body: JSON.stringify(corpo) });
      guardar(r);
      return { status: r.status, json: await r.json().catch(() => null) };
    },
    async get(caminho) {
      const r = await fetch(BASE + caminho, { headers: cab(), redirect: "manual" });
      guardar(r);
      return { status: r.status, html: await r.text() };
    },
  };
}

async function webhook(payload) {
  const corpo = JSON.stringify(payload);
  const assinatura = TOKEN_KIWIFY ? `?signature=${createHmac("sha1", TOKEN_KIWIFY).update(corpo).digest("hex")}` : "";
  const r = await fetch(`${BASE}/api/v2/webhooks/kiwify${assinatura}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: corpo,
  });
  return { status: r.status, json: await r.json().catch(() => null) };
}

const ts = Date.now().toString(36);
const email = `qa-${ts}@epic247.invalid`;
const produtoKiwify = `qa-plano-energia-${ts}`;
const pedido1 = `QA-${ts}-1`;
const pedido2 = `QA-${ts}-2`;
const leadsCriados = new Set();

function pedido(id, evento, status, lead, mapa) {
  return {
    order_id: id, order_status: status, webhook_event_type: evento, payment_method: "pix", installments: 1,
    approved_date: new Date().toISOString().slice(0, 16).replace("T", " "),
    refunded_at: evento === "order_refunded" ? new Date().toISOString() : null,
    Product: { product_id: produtoKiwify, product_name: "Plano EPIC Energia 7 Dias (QA)" },
    Customer: { first_name: "QA", full_name: "QA Teste", email },
    Commissions: { charge_amount: 2900, product_base_price: 2900, kiwify_fee: 350, my_commission: 2550, estimated_deposit_date: "2026-10-03" },
    TrackingParameters: { sck: lead, src: mapa, utm_source: "qa", utm_medium: "teste" },
  };
}

const [produtoOriginal] = await sql("select checkout_url, provider_product_id, active from §products where product_id = 'plan_energia'");
if (!produtoOriginal) throw new Error("Produto plan_energia não existe neste schema. Rode a migração antes.");

try {
  await sql(
    "update §products set active = true, checkout_url = 'https://pay.kiwify.com.br/qa-teste', provider_product_id = $1 where product_id = 'plan_energia'",
    [produtoKiwify]
  );

  console.log(`QA do EPIC247 2.0 · ${BASE} · schema ${S}`);
  const a = visitante();

  // ── 1. Chegada, Mapa e retomada ──
  secao("1. Chegada com utm, Mapa de Energia e retomada (RF-012, RF-023, RF-025)");
  const s1 = await a.post("/api/v2/sessao", { utm_source: "qa", utm_medium: "teste", utm_campaign: "c1", landing_page: "/mapas/energia" });
  confere(s1.status === 200, "sessão aberta", `status ${s1.status}`);
  const lead = a.pote.get("epic_lid");
  confere(Boolean(lead), "cookie de identidade criado");
  leadsCriados.add(lead);

  const ini = await a.post("/api/v2/mapas/iniciar", { map_type: "energia", utm_source: "qa", utm_medium: "teste" });
  const mapaId = ini.json?.map_result_id;
  confere(Boolean(mapaId), "Mapa iniciado", JSON.stringify(ini.json));

  const respostas = Object.fromEntries(ENERGIA.questions.map((q, i) => [q.id, i % 5 === 0 ? 4 : 2]));
  const metade = Object.fromEntries(Object.entries(respostas).slice(0, 7));
  await a.post("/api/v2/mapas/progresso", { map_result_id: mapaId, answers: metade, step: 7 });
  const retomada = await a.post("/api/v2/mapas/iniciar", { map_type: "energia" });
  confere(retomada.json?.map_result_id === mapaId && retomada.json?.retomado === true, "volta para o mesmo Mapa, marcado como retomado");
  confere(Object.keys(retomada.json?.answers ?? {}).length === 7 && retomada.json?.step === 7, "respostas parciais e passo preservados");

  const fim = await a.post("/api/v2/mapas/concluir", { map_result_id: mapaId, answers: respostas });
  const tokenResultado = fim.json?.token;
  confere(Boolean(tokenResultado), "Mapa concluído com token de resultado");
  const [mr] = await sql("select status, map_version, scoring_version, result_copy_version, primary_pattern, lead_id from §map_results where map_result_id = $1", [mapaId]);
  confere(mr?.status === "completed" && mr.lead_id === lead, "resultado gravado no lead do visitante");
  confere(Boolean(mr?.map_version && mr.scoring_version && mr.result_copy_version), "versões do Mapa, da pontuação e do texto registradas (RF-076/077)");
  const res = await a.get(`/mapas/energia/resultado/${tokenResultado}`);
  confere(res.status === 200, "página de resultado abre antes de qualquer e-mail (RF-014)");
  confere(/noindex/.test(res.html), "resultado pessoal com noindex (RF-058)");
  confere(!res.html.includes(email), "token não expõe dados pessoais (RF-021)");

  // ── 2. Captura e identidade ──
  secao("2. Captura do e-mail e consentimento (RF-016, RF-017, RF-061, RF-063)");
  const cap = await a.post("/api/v2/mapas/capturar", { token: tokenResultado, email, first_name: "QA", marketing: true });
  confere(cap.status === 200, "captura aceita", `status ${cap.status}`);
  const [l1] = await sql("select * from §leads where lead_id = $1", [lead]);
  confere(l1?.email === email, "e-mail ligado ao mesmo lead do Mapa");
  confere(l1?.email_consent && l1?.marketing_email_allowed && Boolean(l1?.privacy_policy_version), "consentimentos separados e versão da política gravados");
  confere(l1?.first_touch_source === "qa" && l1?.first_touch_campaign === "c1", "primeiro toque com as utm da chegada");
  const msgs1 = await sql("select automation_id, status from §messages where lead_id = $1", [lead]);
  confere(msgs1.some((m) => m.automation_id === "AUT_MAP_RESULT_DELIVERY"), "entrega do resultado agendada");
  confere(msgs1.some((m) => m.automation_id === "AUT_MAP_NURTURE"), "nutrição agendada (aceitou marketing)");

  confere(msgs1.some((m) => m.automation_id === "AUT_CROSS_DIMENSION"), "convite de cross-dimension agendado (Matriz §13)");
  const [ns] = await sql("select count(*)::int n from §events where lead_id = $1 and event_name = 'MapNurtureStarted'", [lead]);
  confere(ns.n === 1, "evento MapNurtureStarted");

  secao("2b. Mapa repetido com o mesmo resultado e Mapa relacionado (Matriz)");
  const ini2 = await a.post("/api/v2/mapas/iniciar", { map_type: "energia" });
  const fim2 = await a.post("/api/v2/mapas/concluir", { map_result_id: ini2.json?.map_result_id, answers: respostas });
  await a.post("/api/v2/mapas/capturar", { token: fim2.json?.token, email, first_name: "QA", marketing: true });
  const [nut] = await sql("select count(distinct context->>'map_result_id')::int n from §messages where lead_id = $1 and automation_id = 'AUT_MAP_NURTURE'", [lead]);
  confere(nut.n === 1, "Mapa repetido sem mudança não reinicia a nutrição", `${nut.n} sequências`);
  const [entregas] = await sql("select count(*)::int n from §messages where lead_id = $1 and automation_id = 'AUT_MAP_RESULT_DELIVERY'", [lead]);
  confere(entregas.n === 2, "mas o resultado pedido é entregue de novo", `${entregas.n}`);
  await a.post("/api/v2/mapas/iniciar", { map_type: "acao" });
  const [cx] = await sql("select count(*)::int n from §events where lead_id = $1 and event_name = 'CrossDimensionMapStarted'", [lead]);
  confere(cx.n === 1, "começar o Mapa de Ação depois do de Energia registra CrossDimensionMapStarted");

  secao("2c. Empate: a pessoa escolhe por onde o Plano começa (Mapa de Energia §8)");
  const [eA, eB] = [ENERGIA.axes[0].key, ENERGIA.axes[1].key];
  const empate = Object.fromEntries(ENERGIA.questions.map((q) => [q.id, q.axis === eA || q.axis === eB ? (q.reverse ? 0 : 4) : q.reverse ? 4 : 0]));
  const iniE = await a.post("/api/v2/mapas/iniciar", { map_type: "energia" });
  const fimE = await a.post("/api/v2/mapas/concluir", { map_result_id: iniE.json?.map_result_id, answers: empate });
  const fora = await a.post("/api/v2/mapas/prioridade", { token: fimE.json?.token, eixo: ENERGIA.axes[4].key });
  confere(fora.status === 400, "recusa área que não está no empate", `status ${fora.status}`);
  const dentro = await a.post("/api/v2/mapas/prioridade", { token: fimE.json?.token, eixo: eB });
  const [esc] = await sql("select chosen_pattern from §map_results where result_token = $1", [fimE.json?.token]);
  confere(dentro.status === 200 && esc?.chosen_pattern === eB, "grava a área escolhida no empate");
  const fb = await a.post("/api/v2/mapas/feedback", { token: fimE.json?.token, resposta: "em_parte", comentario: "teste QA" });
  const [fbr] = await sql("select feedback, feedback_comment from §map_results where result_token = $1", [fimE.json?.token]);
  confere(fb.status === 200 && fbr?.feedback === "em_parte", "feedback do resultado gravado (seção 17)");

  // ── 3. Novo toque ──
  secao("3. Nova visita com outra campanha (RF-023, RF-024)");
  await a.post("/api/v2/sessao", { utm_source: "qa2", utm_medium: "email", utm_campaign: "c2", landing_page: "/plano/energia" });
  const [l2] = await sql("select first_touch_source, last_touch_source, last_touch_campaign from §leads where lead_id = $1", [lead]);
  confere(l2.first_touch_source === "qa", "primeiro toque não muda");
  confere(l2.last_touch_source === "qa2" && l2.last_touch_campaign === "c2", "último toque atualizado");

  // ── 4. Checkout ──
  secao("4. Início de checkout (RF-042, RF-043)");
  const ck = await a.post("/api/v2/checkout/iniciar", { product_id: "plan_energia", r: tokenResultado });
  const url = ck.json?.url ?? ck.json?.checkout_url ?? "";
  confere(ck.status === 200 && url.startsWith("https://pay.kiwify.com.br/qa-teste"), "link do checkout devolvido", `status ${ck.status} ${JSON.stringify(ck.json)}`);
  confere(url.includes(`sck=${lead}`) && url.includes(`src=${mapaId}`), "link leva o lead (sck) e o Mapa (src)");

  // ── 5. Compra ──
  secao("5. Compra aprovada pelo webhook (RF-044, RF-047, RF-091)");
  const w1 = await webhook(pedido(pedido1, "order_approved", "paid", lead, mapaId));
  confere(w1.status === 200, "webhook aceito", `status ${w1.status} ${JSON.stringify(w1.json)}`);
  const [t1] = await sql("select * from §transactions where transaction_id = $1", [pedido1]);
  confere(t1?.transaction_status === "approved" && t1.lead_id === lead && t1.product_id === "plan_energia", "transação aprovada no lead e produto certos");
  confere(Number(t1?.amount_gross) === 29 && Number(t1?.amount_net) === 25.5, "bruto e líquido corretos");
  const [l3] = await sql("select lifecycle_stage from §leads where lead_id = $1", [lead]);
  confere(l3.lifecycle_stage === "plan_buyer", "etapa do lead promovida para comprador de Plano", l3.lifecycle_stage);
  const [plano] = await sql("select processing_status, access_token from §plan_generations where lead_id = $1 and transaction_id = $2", [lead, pedido1]);
  confere(plano?.processing_status === "generated" && Boolean(plano.access_token), "Plano gerado com link de acesso (RF-030)");
  const nurture = await sql("select status from §messages where lead_id = $1 and automation_id = 'AUT_MAP_NURTURE'", [lead]);
  confere(nurture.every((m) => m.status !== "scheduled"), "nutrição de venda encerrada após a compra");

  const w1b = await webhook(pedido(pedido1, "order_approved", "paid", lead, mapaId));
  confere(w1b.status === 200, "webhook repetido aceito sem erro");
  const [cont] = await sql(
    `select (select count(*) from §transactions where transaction_id = $1)::int t,
            (select count(*) from §events where transaction_id = $1 and event_name = 'Purchase')::int p,
            (select count(*) from §events where transaction_id = $1 and event_name = 'PurchasePlan')::int pp,
            (select count(*) from §plan_generations where transaction_id = $1)::int g`,
    [pedido1]
  );
  confere(cont.t === 1 && cont.p === 1 && cont.pp === 1 && cont.g === 1, "nada duplicado: 1 transação, 1 Purchase, 1 PurchasePlan, 1 Plano", JSON.stringify(cont));

  // ── 6. Supressão ──
  secao("6. Quem comprou não vê a mesma oferta (RF-038, RF-039, RF-093)");
  const pagPlano = await a.get("/plano/energia");
  confere(pagPlano.html.includes("Você já tem este Plano"), "página do Plano reconhece a compra");
  const res2 = await a.get(`/mapas/energia/resultado/${tokenResultado}`);
  confere(!res2.html.includes(`/plano/energia?r=${tokenResultado}`), "resultado não oferece mais o Plano");
  confere(res2.html.includes("/kit/energia"), "Kit da dimensão continua oferecido");
  const ck2 = await a.post("/api/v2/checkout/iniciar", { product_id: "plan_energia", r: tokenResultado });
  confere(ck2.status === 409, "novo checkout do mesmo Plano é recusado", `status ${ck2.status}`);
  const acesso = await a.get(`/plano/acesso/${plano?.access_token}`);
  confere(acesso.status === 200, "link de acesso ao Plano abre");

  // ── 7. Reembolso ──
  secao("7. Reembolso (RF-045)");
  const w2 = await webhook(pedido(pedido1, "order_refunded", "refunded", lead, mapaId));
  confere(w2.status === 200, "webhook de reembolso aceito");
  await webhook(pedido(pedido1, "order_refunded", "refunded", lead, mapaId));
  const [t2] = await sql("select transaction_status, refunded_at from §transactions where transaction_id = $1", [pedido1]);
  confere(t2.transaction_status === "refunded" && Boolean(t2.refunded_at), "transação marcada como reembolsada");
  const [r2] = await sql("select count(*)::int n from §events where transaction_id = $1 and event_name = 'Refund'", [pedido1]);
  confere(r2.n === 1, "1 evento Refund mesmo com webhook repetido", `${r2.n}`);
  const [rec] = await sql("select lifetime_revenue_gross from §lead_profile where lead_id = $1", [lead]);
  confere(Number(rec.lifetime_revenue_gross) === 0, "receita do lead volta a zero");
  const acesso2 = await a.get(`/plano/acesso/${plano?.access_token}`);
  confere(acesso2.status === 404, "acesso ao Plano revogado", `status ${acesso2.status}`);
  const pagPlano2 = await a.get("/plano/energia");
  confere(!pagPlano2.html.includes("Você já tem este Plano"), "Plano volta a ser oferecido");

  // ── 8. Chargeback ──
  secao("8. Chargeback (RF-046)");
  await webhook(pedido(pedido2, "order_approved", "paid", lead, mapaId));
  const w3 = await webhook(pedido(pedido2, "chargeback", "chargedback", lead, mapaId));
  await webhook(pedido(pedido2, "chargeback", "chargedback", lead, mapaId));
  confere(w3.status === 200, "webhook de chargeback aceito");
  const [t3] = await sql("select transaction_status from §transactions where transaction_id = $1", [pedido2]);
  confere(t3?.transaction_status === "chargeback", "transação marcada como chargeback", t3?.transaction_status);
  const [rec2] = await sql("select lifetime_revenue_gross from §lead_profile where lead_id = $1", [lead]);
  confere(Number(rec2.lifetime_revenue_gross) === 0, "chargeback não conta como receita");

  // ── 9. Outro aparelho, mesmo e-mail ──
  secao("9. Mesmo e-mail em outro aparelho une o histórico (RF-017, RF-022, RF-092)");
  const b = visitante();
  await b.post("/api/v2/sessao", { utm_source: "qa-celular", landing_page: "/mapa" });
  const leadB = b.pote.get("epic_lid");
  leadsCriados.add(leadB);
  const iniB = await b.post("/api/v2/mapas/iniciar", { map_type: "friccao" });
  const respF = Object.fromEntries(FRICCAO.questions.map((q) => [q.id, "A"]));
  const fimB = await b.post("/api/v2/mapas/concluir", { map_result_id: iniB.json?.map_result_id, answers: respF });
  confere(Boolean(fimB.json?.token), "Mapa de Fricção concluído no segundo aparelho");
  const capB = await b.post("/api/v2/mapas/capturar", { token: fimB.json?.token, email, first_name: "QA", marketing: false });
  confere(capB.status === 200, "captura com o mesmo e-mail aceita");
  const [mB] = await sql("select lead_id from §map_results where map_result_id = $1", [iniB.json?.map_result_id]);
  const [lB] = await sql("select merged_into from §leads where lead_id = $1", [leadB]);
  const unido = mB?.lead_id === lead || lB?.merged_into === lead;
  confere(unido, "Mapa do segundo aparelho ficou no mesmo histórico");
  const [hist] = await sql(
    "select count(*)::int n from §map_results where status = 'completed' and lead_id in (select lead_id from §leads where lead_id = $1 or merged_into = $1)",
    [lead]
  );
  confere(hist.n === 4, "histórico com os quatro Mapas preservados (Energia três vezes e Fricção)", `${hist.n}`);
  const [l4] = await sql("select maps_completed_count, first_primary_dimension from §leads where lead_id = $1", [lead]);
  confere(l4.maps_completed_count >= 2 && l4.first_primary_dimension === "energia", "contagem de Mapas sobe e a primeira dimensão é preservada (RF-082)", JSON.stringify(l4));
  confere(b.pote.get("epic_lid") === lead, "o segundo aparelho passa a usar o lead principal");

  // ── 10. Eventos ──
  secao("10. Eventos críticos registrados (RF-026, RF-027, RF-094)");
  const evs = await sql(
    "select event_name, count(*)::int n, bool_and(session_id is not null) com_sessao from §events where lead_id in (select lead_id from §leads where lead_id = $1 or merged_into = $1) group by 1",
    [lead]
  );
  const tem = (n) => evs.find((e) => e.event_name === n);
  for (const n of ["StartMap", "CompleteMap", "SubmitMapEmail", "StartCheckout", "Purchase", "PurchasePlan", "Refund", "LifecycleChanged", "MapNurtureStarted", "ResultFeedback"]) {
    confere(Boolean(tem(n)), `evento ${n}`);
  }
  confere(tem("StartMap")?.com_sessao && tem("CompleteMap")?.com_sessao, "eventos de Mapa levam session_id");
  const ev = await a.post("/api/v2/evento", { event_name: "ViewMapResult", event_id: randomUUID(), map_type: "energia", page_url: `${BASE}/mapas/energia/resultado/x` });
  confere(ev.status === 200, "navegador registra ViewMapResult");
  const falsa = await a.post("/api/v2/evento", { event_name: "Purchase", event_id: randomUUID() });
  const [compraFalsa] = await sql("select count(*)::int n from §events where lead_id = $1 and event_name = 'Purchase' and transaction_id is null", [lead]);
  confere(compraFalsa.n === 0, "navegador não consegue registrar compra", `status ${falsa.status}`);
} catch (e) {
  falhas++;
  console.log(`\nERRO: ${e instanceof Error ? e.stack : e}`);
} finally {
  await sql("update §products set active = $1, checkout_url = $2, provider_product_id = $3 where product_id = 'plan_energia'", [
    produtoOriginal.active, produtoOriginal.checkout_url, produtoOriginal.provider_product_id,
  ]);
  if (process.env.MANTER !== "1") {
    const ids = [...leadsCriados].filter(Boolean);
    const [{ todos }] = await sql("select coalesce(array_agg(lead_id), '{}') todos from §leads where lead_id = any($1) or merged_into = any($1)", [ids]);
    await db.query("begin");
    try {
      for (const t of ["events", "messages", "plan_generations", "transactions", "mentoring_applications", "contact_messages"]) {
        await sql(`delete from §${t} where lead_id = any($1)`, [todos]);
      }
      await sql("delete from §webhook_events where event_key like $1", [`QA-${ts}-%`]);
      await sql("delete from §map_results where lead_id = any($1)", [todos]);
      await sql("delete from §sessions where lead_id = any($1)", [todos]);
      await sql("update §leads set merged_into = null where lead_id = any($1)", [todos]);
      await sql("delete from §leads where lead_id = any($1)", [todos]);
      await db.query("commit");
      console.log("\nDados de teste apagados.");
    } catch (e) {
      await db.query("rollback");
      console.log(`\nNão consegui apagar os dados de teste (${e instanceof Error ? e.message : e}). E-mail usado: ${email}`);
    }
  } else console.log(`\nDados mantidos. E-mail usado: ${email}`);
  await db.end();
  console.log(`\n${total - falhas} de ${total} verificações passaram.`);
  process.exitCode = falhas ? 1 : 0;
}
