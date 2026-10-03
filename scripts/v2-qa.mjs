// QA de ponta a ponta do 2.0 contra o staging (RF-091 a RF-094).
// Percorre o caminho de um visitante real pelas APIs e confere o banco:
// identidade e atribuição, Mapa, captura, checkout, compra pelo webhook,
// webhook repetido, supressão de oferta, acesso ao Plano, reembolso,
// chargeback, união de visitantes pelo e-mail e eventos. Meu EPIC (CR-01):
// acesso concedido e revogado, link de entrada, sessão, Planos, PDF, Kit,
// Protocolo com progresso e bloqueio do que não foi comprado.
//
// Uso (com o site rodando contra o staging):
//   node scripts/v2-qa.mjs                    (site em http://localhost:3100)
//   QA_URL=https://<preview>.vercel.app node scripts/v2-qa.mjs
//   MANTER=1 node scripts/v2-qa.mjs           (não apaga os dados de teste no fim)
//
// Recusa rodar no schema de produção. Mexe por alguns segundos no produto
// plan_energia (ativa com um link de teste) e devolve como estava no fim.
import { execSync } from "node:child_process";
import { createHash, createHmac, randomBytes, randomUUID } from "node:crypto";
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
// O QA compra o Plano de Energia: o servidor testado precisa subir com
// EPIC_PLANO_SEM_APROVACAO=1 (só vale fora de produção; ver server/produtos.ts).
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
      // O React separa textos vizinhos com <!-- -->: some para comparar frases.
      return { status: r.status, html: (await r.text()).replaceAll("<!-- -->", ""), location: r.headers.get("location"), headers: r.headers };
    },
    /** Formulário comum (POST urlencoded), como o navegador sem JavaScript. */
    async form(caminho, dados) {
      const c = cab();
      c["content-type"] = "application/x-www-form-urlencoded";
      const r = await fetch(BASE + caminho, { method: "POST", headers: c, body: new URLSearchParams(dados).toString(), redirect: "manual" });
      guardar(r);
      return { status: r.status, location: r.headers.get("location") ?? "" };
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
const pedidoKit = `QA-${ts}-3`;
const pedidoProt = `QA-${ts}-4`;
const PLANO_QA = { id: produtoKiwify, nome: "Plano EPIC Energia 7 Dias (QA)", centavos: 2900, taxa: 350 };
const KIT_QA = { id: `qa-kit-coragem-${ts}`, nome: "Kit EPIC Coragem (QA)", centavos: 9700, taxa: 1000 };
const PROT_QA = { id: `qa-protocolo-${ts}`, nome: "Protocolo EPIC247 (QA)", centavos: 49700, taxa: 5000 };
const sha256 = (v) => createHash("sha256").update(v).digest("hex");
const leadsCriados = new Set();

function pedido(id, evento, status, lead, mapa, prod = PLANO_QA) {
  return {
    order_id: id, order_status: status, webhook_event_type: evento, payment_method: "pix", installments: 1,
    approved_date: new Date().toISOString().slice(0, 16).replace("T", " "),
    refunded_at: evento === "order_refunded" ? new Date().toISOString() : null,
    Product: { product_id: prod.id, product_name: prod.nome },
    Customer: { first_name: "QA", full_name: "QA Teste", email },
    Commissions: { charge_amount: prod.centavos, product_base_price: prod.centavos, kiwify_fee: prod.taxa, my_commission: prod.centavos - prod.taxa, estimated_deposit_date: "2026-10-03" },
    TrackingParameters: { sck: lead, src: mapa, utm_source: "qa", utm_medium: "teste" },
  };
}

const [produtoOriginal] = await sql("select checkout_url, provider_product_id, active from §products where product_id = 'plan_energia'");
if (!produtoOriginal) throw new Error("Produto plan_energia não existe neste schema. Rode a migração antes.");
// Kit Coragem e Protocolo: só o id da Kiwify muda (para o webhook achar o produto), e volta no fim.
const outrosOriginais = await sql("select product_id, provider_product_id from §products where product_id in ('kit_coragem', 'protocol')");

try {
  await sql(
    "update §products set active = true, checkout_url = 'https://pay.kiwify.com.br/qa-teste', provider_product_id = $1 where product_id = 'plan_energia'",
    [produtoKiwify]
  );
  await sql("update §products set provider_product_id = $1 where product_id = 'kit_coragem'", [KIT_QA.id]);
  await sql("update §products set provider_product_id = $1 where product_id = 'protocol'", [PROT_QA.id]);

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
  const acessos1 = await sql("select access_status, product_type, scope from §access_grants where source_transaction_id = $1", [pedido1]);
  confere(acessos1.length === 1 && acessos1[0].access_status === "active" && acessos1[0].scope === "energia", "CR-01: compra aprovada concede 1 acesso, mesmo com webhook repetido", JSON.stringify(acessos1));

  // ── 6. Supressão ──
  secao("6. Quem comprou não vê a mesma oferta (RF-038, RF-039, RF-093)");
  const pagPlano = await a.get("/plano/energia");
  confere(pagPlano.html.includes("Você já tem acesso a este produto") && !pagPlano.html.includes("Quero meu Plano EPIC 7 Dias<"), "página do Plano reconhece a compra");
  const res2 = await a.get(`/mapas/energia/resultado/${tokenResultado}`);
  confere(!res2.html.includes(`/plano/energia?r=${tokenResultado}`), "resultado não oferece mais o Plano");
  confere(res2.html.includes("/kit/energia"), "Kit da dimensão continua oferecido");
  const ck2 = await a.post("/api/v2/checkout/iniciar", { product_id: "plan_energia", r: tokenResultado });
  confere(ck2.status === 409, "novo checkout do mesmo Plano é recusado", `status ${ck2.status}`);
  const acesso = await a.get(`/plano/acesso/${plano?.access_token}`);
  confere(acesso.status === 307 && (acesso.location ?? "").includes("/meu-epic/planos/"), "link antigo do Plano leva ao Meu EPIC (D3)", `status ${acesso.status}`);

  // ── 6b. Meu EPIC ──
  secao("6b. Meu EPIC: entrada por link, Planos, PDF e limites (CR-01, CR-01A)");
  const [gp] = await sql("select plan_generation_id from §plan_generations where transaction_id = $1", [pedido1]);
  const planoUrl = `/meu-epic/planos/${gp.plan_generation_id}`;
  const semSessao = await visitante().get(planoUrl);
  confere(semSessao.status === 307 && (semSessao.location ?? "").includes("/meu-epic/entrar"), "sem sessão, conhecer o endereço do Plano não abre nada", `status ${semSessao.status}`);

  const pl = await a.form("/api/v2/conta/link", { email, volta: planoUrl });
  confere(pl.status === 303 && pl.location.includes("enviado=1"), "pedido de link de entrada aceito", `${pl.status} ${pl.location}`);
  const [tok] = await sql("select count(*)::int n, bool_and(length(token_hash) = 64) so_hash from §auth_tokens where lead_id = $1 and purpose = 'login'", [lead]);
  confere(tok.n === 1 && tok.so_hash, "link criado e só o hash fica no banco");
  const ninguem = await visitante().form("/api/v2/conta/link", { email: `ninguem-${ts}@epic247.invalid` });
  confere(ninguem.status === 303 && ninguem.location.includes("enviado=1"), "e-mail sem conta recebe a mesma resposta (não revela quem é cliente)");

  // Link de compra com valor conhecido (o e-mail real não é lido no QA).
  const segredo = randomBytes(32).toString("base64url");
  await sql(
    "insert into §auth_tokens (token_hash, lead_id, purpose, email, next_path, expires_at) values ($1, $2, 'compra', $3, $4, now() + interval '1 hour')",
    [sha256(segredo), lead, email, planoUrl]
  );
  const pagLink = await a.get(`/meu-epic/entrar/${segredo}`);
  confere(pagLink.status === 200 && pagLink.html.includes("Entrar no Meu EPIC"), "link do e-mail abre a página de entrada", `status ${pagLink.status}`);
  const [intacto] = await sql("select used_at from §auth_tokens where token_hash = $1", [sha256(segredo)]);
  confere(intacto.used_at === null, "abrir o link não gasta o acesso (filtros de e-mail que abrem links)");
  const ent = await a.form("/api/v2/conta/entrar", { token: segredo });
  confere(ent.status === 303 && ent.location.endsWith(planoUrl) && Boolean(a.pote.get("epic_conta")), "entrar abre a sessão e leva direto ao Plano", `${ent.status} ${ent.location}`);
  const reuso = await visitante().form("/api/v2/conta/entrar", { token: segredo });
  confere(reuso.location.includes("erro=expirado"), "link de uso único");
  const vencido = randomBytes(32).toString("base64url");
  await sql(
    "insert into §auth_tokens (token_hash, lead_id, purpose, email, expires_at) values ($1, $2, 'login', $3, now() - interval '1 minute')",
    [sha256(vencido), lead, email]
  );
  const venc = await visitante().get(`/meu-epic/entrar/${vencido}`);
  confere(venc.status === 307 && (venc.location ?? "").includes("erro=expirado"), "link vencido não entra");

  const inicio = await a.get("/meu-epic");
  confere(inicio.status === 200 && inicio.html.includes("Olá") && inicio.html.includes("Plano mais recente"), "Início do Meu EPIC", `status ${inicio.status}`);
  confere((inicio.headers.get("x-robots-tag") ?? "").includes("noindex") && /<meta name="robots" content="noindex, ?nofollow/.test(inicio.html), "Meu EPIC fora de busca (noindex, nofollow)");
  confere(/no-store/.test(inicio.headers.get("cache-control") ?? ""), "Meu EPIC sem cache público");
  confere(!/<title>[^<]*(qa-|QA Teste)/.test(inicio.html), "nenhum dado pessoal no título da página");
  const mm = await a.get("/meu-epic/mapas");
  confere(mm.status === 200 && mm.html.includes("Ver resultado") && mm.html.includes(`/mapas/energia/resultado/`), "Meus Mapas lista o histórico com link do resultado");
  const mp = await a.get(planoUrl);
  confere(mp.status === 200 && mp.html.includes("Baixar PDF") && mp.html.includes("Os 7 dias"), "Plano completo abre no Meu EPIC", `status ${mp.status}`);
  const pdf = await a.get(`${planoUrl}/pdf`);
  confere(pdf.status === 200 && pdf.headers.get("content-type") === "application/pdf", "PDF do Plano gerado a partir do Plano salvo", `status ${pdf.status}`);
  const kitNao = await a.get("/meu-epic/produtos/kit/energia");
  confere(kitNao.html.includes("não faz parte da sua conta"), "Kit não comprado não abre");
  const protNao = await a.get("/meu-epic/produtos/protocolo");
  confere(protNao.html.includes("não faz parte da sua conta"), "Protocolo não comprado não abre");

  // Outra pessoa, com sessão própria, não abre o Plano de ninguém.
  const [outra] = await sql("insert into §leads (email, first_name) values ($1, 'Outra') returning lead_id", [`outra-${ts}@epic247.invalid`]);
  leadsCriados.add(outra.lead_id);
  const sessaoOutra = randomBytes(32).toString("base64url");
  await sql("insert into §auth_sessions (session_hash, lead_id, expires_at) values ($1, $2, now() + interval '1 day')", [sha256(sessaoOutra), outra.lead_id]);
  const c = visitante();
  c.pote.set("epic_conta", sessaoOutra);
  const alheio = await c.get(planoUrl);
  confere(alheio.status === 404, "Plano de outra conta não abre, mesmo com sessão válida", `status ${alheio.status}`);
  const alheioPdf = await c.get(`${planoUrl}/pdf`);
  confere(alheioPdf.status === 404, "PDF de outra conta não sai");

  // ── 6c. Kit e Protocolo ──
  secao("6c. Kit e Protocolo no Meu EPIC (CR-01, critérios 6 e 7)");
  await webhook(pedido(pedidoKit, "order_approved", "paid", lead, null, KIT_QA));
  const kit = await a.get("/meu-epic/produtos/kit/coragem");
  confere(kit.status === 200 && kit.html.includes("Kit EPIC Coragem") && kit.html.includes("Materiais"), "Kit comprado abre no Meu EPIC", `status ${kit.status}`);
  const kitOutro = await a.get("/meu-epic/produtos/kit/amor");
  confere(kitOutro.html.includes("não faz parte da sua conta"), "Kit libera só a dimensão comprada");
  await webhook(pedido(pedidoProt, "order_approved", "paid", lead, null, PROT_QA));
  const prot = await a.get("/meu-epic/produtos/protocolo");
  confere(prot.status === 200 && prot.html.includes("0 de 10 dimensões concluídas") && prot.html.includes("Não iniciado"), "Protocolo liberado com as 10 dimensões e progresso");
  const dimAcao = await a.get("/meu-epic/produtos/protocolo/acao");
  confere(dimAcao.status === 200 && dimAcao.html.includes("Concluí esta dimensão"), "dimensão do Protocolo abre sem bloqueio de ordem");
  const [pp] = await sql("select status from §protocol_progress where lead_id = $1 and dimension = 'acao'", [lead]);
  confere(pp?.status === "in_progress", "abrir a dimensão marca \"em andamento\"");
  await a.form("/api/v2/conta/protocolo", { dimensao: "acao", concluida: "1" });
  const prot2 = await a.get("/meu-epic/produtos/protocolo");
  confere(prot2.html.includes("1 de 10 dimensões concluídas") && prot2.html.includes("Concluído"), "concluir a dimensão atualiza o progresso");
  const kitPeloProt = await a.get("/meu-epic/produtos/kit/amor");
  confere(!kitPeloProt.html.includes("não faz parte da sua conta") && kitPeloProt.html.includes("Incluído no seu Protocolo"), "Protocolo inclui os materiais de todas as dimensões");
  const prods = await a.get("/meu-epic/produtos");
  confere(prods.html.includes("Kit EPIC Coragem") && prods.html.includes("Protocolo EPIC247"), "Meus Produtos reúne Kit e Protocolo");
  const conta = await a.get("/meu-epic/conta");
  confere(conta.html.includes(email) && conta.html.includes("Sair") && conta.html.includes("Aprovada"), "Minha Conta: e-mail, compras e sair");

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
  // Ficam só o Kit (97) e o Protocolo (497) comprados na seção 6c.
  confere(Number(rec.lifetime_revenue_gross) === 594, "receita do lead perde o Plano reembolsado", rec.lifetime_revenue_gross);
  const acesso2 = await a.get(`/plano/acesso/${plano?.access_token}`);
  confere(acesso2.status === 404, "link antigo do Plano deixa de existir", `status ${acesso2.status}`);
  const [gr] = await sql("select access_status, revoked_at from §access_grants where source_transaction_id = $1", [pedido1]);
  confere(gr?.access_status === "revoked" && Boolean(gr.revoked_at), "CR-01: reembolso revoga o acesso e guarda quando");
  const mp2 = await a.get(planoUrl);
  confere(mp2.html.includes("O acesso a este Plano foi encerrado"), "Plano reembolsado não abre no Meu EPIC");
  confere(!mp2.html.includes("Baixar PDF") && !mp2.html.includes("Os 7 dias"), "conteúdo do Plano não aparece");
  const pdf2 = await a.get(`${planoUrl}/pdf`);
  confere(pdf2.status === 404, "PDF do Plano reembolsado bloqueado", `status ${pdf2.status}`);
  const [hist7] = await sql("select count(*)::int n from §plan_generations where transaction_id = $1", [pedido1]);
  confere(hist7.n === 1, "histórico do Plano preservado");
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
  confere(Number(rec2.lifetime_revenue_gross) === 594, "chargeback não conta como receita", rec2.lifetime_revenue_gross);
  const [gc] = await sql("select access_status from §access_grants where source_transaction_id = $1", [pedido2]);
  confere(gc?.access_status === "revoked", "CR-01: chargeback revoga o acesso");
  const sai = await a.form("/api/v2/conta/sair", {});
  confere(sai.status === 303 && sai.location.includes("saiu=1"), "sair do Meu EPIC");
  const depois = await a.get("/meu-epic");
  confere(depois.status === 307 && (depois.location ?? "").includes("/meu-epic/entrar"), "depois de sair, o Meu EPIC pede entrada", `status ${depois.status}`);
  const [sess] = await sql("select count(*) filter (where ended_at is null)::int abertas from §auth_sessions where lead_id = $1", [lead]);
  confere(sess.abertas === 0, "sessão encerrada no banco");

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
  for (const n of ["StartMap", "CompleteMap", "SubmitMapEmail", "StartCheckout", "Purchase", "PurchasePlan", "Refund", "LifecycleChanged", "MapNurtureStarted", "ResultFeedback",
    "AccessGranted", "AccessRevoked", "LoginMeuEpic", "ViewMeuEpicHome", "ViewMapHistory", "ViewPlan", "DownloadPlanPDF", "ViewProduct", "ViewProtocolDimension", "CompleteProtocolDimension"]) {
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
  for (const o of outrosOriginais) {
    await sql("update §products set provider_product_id = $2 where product_id = $1", [o.product_id, o.provider_product_id]);
  }
  if (process.env.MANTER !== "1") {
    const ids = [...leadsCriados].filter(Boolean);
    const [{ todos }] = await sql("select coalesce(array_agg(lead_id), '{}') todos from §leads where lead_id = any($1) or merged_into = any($1)", [ids]);
    await db.query("begin");
    try {
      // Recebíveis (012) dependem das transações: saem antes.
      await sql("delete from §receivables where transaction_id in (select transaction_id from §transactions where lead_id = any($1))", [todos]);
      for (const t of ["access_grants", "auth_tokens", "auth_sessions", "protocol_progress"]) {
        await sql(`delete from §${t} where lead_id = any($1)`, [todos]);
      }
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
