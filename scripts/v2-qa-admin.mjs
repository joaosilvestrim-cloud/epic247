// Teste das ações do admin 2.0 num navegador de verdade (Edge headless via CDP),
// contra um servidor local com senha de teste e o banco de STAGING.
// Uso: 1) npm run build
//      2) ADMIN_PASSWORD=<senha de teste> npx next start -p 3100
//      3) npm run qa:admin -- <arquivo com a mesma senha de teste>
// Nunca usa a senha real: o servidor local sobe com uma senha só de teste.
// Não testa o que dispara e-mail de verdade (newsletter, "disparar agora",
// aviso de Mapa), nem Marketing e site (essas configurações são as mesmas
// da produção).
import { spawn } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import pg from "pg";

for (const l of fs.readFileSync(".env.local", "utf8").split(/\r?\n/)) { const m = l.match(/^([A-Z0-9_]+)=(.*)$/); if (m) process.env[m[1]] ??= m[2]; }
const S = process.env.EPIC_DB_SCHEMA;
if (S !== "v2_staging") throw new Error("só staging");
const BASE = "http://localhost:3100";
// Mesmo formato de src/lib/admin-auth.ts: "<expira em ms>.<hmac>".
const expira = Date.now() + 60 * 60 * 1000;
const token = `${expira}.${crypto.createHmac("sha256", fs.readFileSync(process.argv[2], "utf8").trim()).update(`epic247-admin-v2:${expira}`).digest("hex")}`;
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36 Edg/140.0";
const ts = Date.now().toString(36);
const EMAIL = `qa-admin-${ts}@epic247.invalid`;

const db = new pg.Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
await db.connect();
// Pooler em modo transação: o search_path só vale dentro de cada transação.
const q = async (sql, p = []) => {
  await db.query("begin");
  try {
    await db.query(`set local search_path to ${S}, public`);
    const r = await db.query(sql, p);
    await db.query("commit");
    return r.rows;
  } catch (e) {
    await db.query("rollback");
    throw e;
  }
};

// ── navegador ──
const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const PORTA = 9334;
const edge = spawn(EDGE, ["--headless=new", "--disable-gpu", `--remote-debugging-port=${PORTA}`,
  `--user-data-dir=${path.join(os.tmpdir(), "edge-cdp-admin")}`, "--window-size=1280,900", "about:blank"], { stdio: "ignore" });
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
let alvo;
for (let i = 0; i < 40 && !alvo; i++) { await espera(250); try { alvo = (await (await fetch(`http://127.0.0.1:${PORTA}/json`)).json()).find((t) => t.type === "page"); } catch {} }
const ws = new WebSocket(alvo.webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
let nid = 0; const pend = new Map();
ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.id && pend.has(d.id)) { pend.get(d.id)(d); pend.delete(d.id); } };
const cmd = (method, params = {}) => new Promise((r) => { const n = ++nid; pend.set(n, r); ws.send(JSON.stringify({ id: n, method, params })); });
const js = async (expr) => { const r = await cmd("Runtime.evaluate", { expression: expr, awaitPromise: true, returnByValue: true }); if (r.result?.exceptionDetails) throw new Error(r.result.exceptionDetails.exception?.description ?? "erro js"); return r.result?.result?.value; };
await cmd("Page.enable"); await cmd("Network.enable"); await cmd("DOM.enable");
await cmd("Network.setUserAgentOverride", { userAgent: UA });
await cmd("Network.setCookie", { name: "epic_admin", value: token, domain: "localhost", path: "/" });
const ir = async (url) => { await cmd("Page.navigate", { url: BASE + url }); await espera(2500); };
/** Preenche e envia o formulário que contém o seletor dado. */
const enviar = async (seletor, campos, esperar = 3000) => {
  await js(`(() => {
    const el = document.querySelector(${JSON.stringify(seletor)});
    if (!el) throw new Error("não achei ${seletor.replace(/"/g, "'")}");
    const f = el.closest("form");
    const v = ${JSON.stringify(campos)};
    for (const [k, val] of Object.entries(v)) {
      const c = f.querySelector('[name="' + k + '"]');
      if (!c) throw new Error("campo " + k);
      if (c.type === "checkbox") c.checked = Boolean(val); else c.value = val;
    }
    f.requestSubmit();
    return 1;
  })()`);
  await espera(esperar);
};

let ok = 0, falhas = 0;
const confere = (cond, nome, extra = "") => { if (cond) ok++; else falhas++; console.log(`${cond ? "  ok  " : "  FALHA"} ${nome}${extra && !cond ? " · " + extra : ""}`); };

try {
  // ── 1. Ideias no site: criar, editar, excluir ──
  console.log("1. Ideias no site (CMS)");
  await ir("/admin/epic/ideias/novo");
  await enviar('[name="title"]', { title: `QA admin ${ts}`, content_type: "artigo", status: "draft", excerpt: "teste", featured: true });
  let [c] = await q("select id, featured from content_items where title = $1", [`QA admin ${ts}`]);
  confere(c, "cria conteúdo em rascunho");
  confere(c?.featured === true, "grava o destaque editorial");
  if (c) {
    await ir(`/admin/epic/ideias/${c.id}`);
    await enviar('[name="excerpt"]', { excerpt: "editado pelo teste" });
    const [e] = await q("select excerpt from content_items where id = $1", [c.id]);
    confere(e?.excerpt === "editado pelo teste", "edita o conteúdo");
    confere((await js("document.body.innerText")).includes("Salvo"), "mostra 'Salvo.'");
    await ir(`/admin/epic/ideias/${c.id}`);
    await enviar('form [name="confirmar"]', { confirmar: true });
    confere((await q("select 1 from content_items where id = $1", [c.id])).length === 0, "exclui o conteúdo");
  }

  // ── 2. Banco de ideias: ideia, derivação, métricas, exclusões ──
  console.log("2. Banco de ideias");
  await ir("/admin/epic/editorial/nova");
  await enviar('[name="ideia_mae"]', { ideia_mae: `QA ideia ${ts}`, tensao: "teste" });
  const [ideia] = await q("select id from editorial_ideas where ideia_mae = $1", [`QA ideia ${ts}`]);
  confere(ideia, "cria ideia-mãe");
  if (ideia) {
    await ir(`/admin/epic/editorial/${ideia.id}`);
    await enviar('[name="campanha"]', { campanha: "qa" });
    const der = await q("select id, codigo from editorial_derivations where idea_id = $1", [ideia.id]);
    confere(der.length === 1, "adiciona derivação com código rastreável", JSON.stringify(der));
    if (der[0]) {
      await ir(`/admin/epic/editorial/${ideia.id}`);
      const temViews = await js(`!!document.querySelector('form input[name="views"]')`);
      if (temViews) {
        await enviar('form input[name="views"]', { views: "123" });
        const [m] = await q("select views from editorial_derivations where id = $1", [der[0].id]);
        confere(m?.views === 123, "salva métricas da derivação");
      }
      await ir(`/admin/epic/editorial/${ideia.id}`);
      await js(`(() => { const f = [...document.forms].find(f => f.querySelector('input[name="idea_id"]') && !f.querySelector('[name="campanha"]') && !f.querySelector('input[name="views"]') && f.querySelector('input[name="id"]')); f.requestSubmit(); return 1; })()`);
      await espera(3000);
      confere((await q("select 1 from editorial_derivations where idea_id = $1", [ideia.id])).length === 0, "exclui derivação");
    }
    await ir(`/admin/epic/editorial/${ideia.id}`);
    await enviar('form [name="confirmar"]', { confirmar: true });
    confere((await q("select 1 from editorial_ideas where id = $1", [ideia.id])).length === 0, "exclui ideia-mãe");
  }

  // ── 3. Mídia: lançar e excluir investimento ──
  console.log("3. Mídia");
  await ir("/admin/epic/midia");
  const hoje = new Date().toISOString().slice(0, 10);
  await enviar('[name="period_start"]', { period_start: hoje, period_end: hoje, amount: "12,34", notes: `QA ${ts}` });
  const [inv] = await q("select id, amount from media_spend where notes = $1", [`QA ${ts}`]);
  confere(inv && Number(inv.amount) === 12.34, "lança investimento (12,34)", JSON.stringify(inv));
  if (inv) {
    await ir("/admin/epic/midia");
    await js(`(() => { const i = document.querySelector('input[name="id"][value="${inv.id}"]'); i.closest("form").requestSubmit(); return 1; })()`);
    await espera(3000);
    confere((await q("select 1 from media_spend where id = $1", [inv.id])).length === 0, "exclui investimento");
  }

  // ── 4. Produtos e capacidade (salvar sem mudar nada) ──
  console.log("4. Produtos");
  const [antes] = await q("select price_list, checkout_url, active from products where product_id = 'kit_energia'");
  await ir("/admin/epic/produtos");
  await js(`(() => { const i = document.querySelector('input[name="product_id"][value="kit_energia"]'); i.closest("form").requestSubmit(); return 1; })()`);
  await espera(3000);
  const [depois] = await q("select price_list, checkout_url, active from products where product_id = 'kit_energia'");
  confere(JSON.stringify(antes) === JSON.stringify(depois), "salva produto sem alterar dados", JSON.stringify({ antes, depois }));
  const [capAntes] = await q("select value from app_settings where key = 'mentoring_capacity'").catch(() => [null]);
  await ir("/admin/epic/produtos");
  await js(`(() => { document.querySelector('[name="capacidade"]').closest("form").requestSubmit(); return 1; })()`);
  await espera(3000);
  const [capDepois] = await q("select value from app_settings where key = 'mentoring_capacity'").catch(() => [null]);
  confere(JSON.stringify(capAntes) === JSON.stringify(capDepois), "salva capacidade da Mentoria sem alterar");

  // ── 5. Contato → Caixa de entrada ──
  console.log("5. Caixa de entrada");
  const rc = await fetch(BASE + "/api/v2/contato", { method: "POST", headers: { "content-type": "application/json", "user-agent": UA, "x-forwarded-for": `10.9.${Math.floor(Math.random() * 200)}.7` },
    body: JSON.stringify({ name: "QA Admin", email: EMAIL, topic: "parcerias", message: "teste do admin", marketing: false }) });
  confere(rc.ok, "contato enviado pelo site", String(rc.status));
  const [msg] = await q("select id, status, topic from contact_messages where email = $1", [EMAIL]);
  confere(msg?.topic === "parcerias", "assunto roteado gravado");
  if (msg) {
    await ir("/admin/epic/caixa");
    await js(`(() => { const i = document.querySelector('input[name="id"][value="${msg.id}"]'); const f = i.closest("form"); const s = f.querySelector('[name="status"]'); if (s.tagName === "SELECT") s.value = "answered"; f.requestSubmit(); return 1; })()`);
    await espera(3000);
    const [m2] = await q("select status from contact_messages where id = $1", [msg.id]);
    confere(m2?.status !== "new", "muda status da mensagem", m2?.status);
  }

  // ── 6. Mentoria: interesse, status e nota ──
  console.log("6. Mentoria");
  const rm = await fetch(BASE + "/api/v2/mentoria", { method: "POST", headers: { "content-type": "application/json", "user-agent": UA, "x-forwarded-for": `10.8.${Math.floor(Math.random() * 200)}.9` },
    body: JSON.stringify({ name: "QA Admin", email: EMAIL, context: "teste do admin", marketing: false, privacy: true, consent: true }) });
  confere(rm.ok, "interesse na Mentoria enviado", String(rm.status) + " " + (await rm.text()).slice(0, 120));
  const [app] = await q("select id, status from mentoring_applications where lead_id = (select lead_id from leads where email = $1) order by created_at desc limit 1", [EMAIL]);
  confere(app, "candidatura criada", JSON.stringify(app));
  if (app) {
    await ir("/admin/epic/mentoria");
    await js(`(() => { const fs = [...document.forms].filter(f => f.querySelector('input[name="id"][value="${app.id}"]')); const f = fs.find(f => f.querySelector('[name="nota"]')); f.querySelector('[name="nota"]').value = "nota do teste"; f.requestSubmit(); return 1; })()`);
    await espera(3000);
    const [n] = await q("select * from mentoring_applications where id = $1", [app.id]);
    confere(JSON.stringify(n).includes("nota do teste"), "salva nota interna");
    await ir("/admin/epic/mentoria");
    const mudou = await js(`(() => { const fs = [...document.forms].filter(f => f.querySelector('input[name="id"][value="${app.id}"]')); const f = fs.find(f => f.querySelector('[name="status"]')); if (!f) return "sem form"; const s = f.querySelector('[name="status"]'); if (s.tagName === "SELECT") { const op = [...s.options].map(o => o.value).find(v => v === "em_contato"); if (!op) return "sem opção"; s.value = op; } else s.value = "em_contato"; f.requestSubmit(); return "ok"; })()`);
    await espera(3000);
    const [st] = await q("select status from mentoring_applications where id = $1", [app.id]);
    confere(st?.status === "em_contato", "muda status para em contato", `${mudou} ${st?.status}`);
  }

  // ── 7. E-mails: cancelar um agendado ──
  console.log("7. E-mails");
  const [ag] = await q("select message_id from messages where lead_id = (select lead_id from leads where email = $1) and status = 'scheduled' limit 1", [EMAIL]);
  if (ag) {
    await ir("/admin/epic/emails");
    const achou = await js(`(() => { const i = document.querySelector('input[name="id"][value="${ag.message_id}"]'); if (!i) return false; i.closest("form").requestSubmit(); return true; })()`);
    await espera(3000);
    const [m3] = await q("select status from messages where message_id = $1", [ag.message_id]);
    confere(achou && m3?.status !== "scheduled", "cancela e-mail agendado", `${achou} ${m3?.status}`);
  } else console.log("  (nenhum e-mail agendado para testar o cancelamento)");

  // ── 8. Recebível manual numa venda de teste ──
  console.log("8. Vendas e recebíveis");
  const [lead] = await q("select lead_id from leads where email = $1", [EMAIL]);
  const tid = `QA-${ts}`;
  await q(`insert into transactions (transaction_id, lead_id, product_id, provider, transaction_status, amount_gross, amount_net, approved_at, created_at)
           values ($1, $2, 'kit_energia', 'kiwify', 'approved', 97, 90, now(), now())`, [tid, lead.lead_id]);
  await ir("/admin/epic/vendas");
  await enviar('[name="expected_amount"]', { transaction_id: tid, installment_number: "1", installment_total: "1", expected_amount: "90", expected_date: hoje, receivable_status: "scheduled" });
  const rec = await q("select expected_amount, receivable_status from receivables where transaction_id = $1", [tid]);
  confere(rec.length === 1 && Number(rec[0].expected_amount) === 90, "lança recebível manual", JSON.stringify(rec));

  // ── 9. Importação CSV de conteúdo ──
  console.log("9. Importação CSV");
  const csv = path.join(os.tmpdir(), `qa-conteudo-${ts}.csv`);
  fs.writeFileSync(csv, `content_id,platform,published_at,content_type,views,saves,shares\nqa_${ts},instagram,${hoje},reel,1000,40,12\n`);
  await ir("/admin/epic/conteudo");
  const { result: doc } = await cmd("DOM.getDocument", { depth: -1 });
  const { result: nodo } = await cmd("DOM.querySelector", { nodeId: doc.root.nodeId, selector: 'input[type="file"][name="arquivo"]' });
  await cmd("DOM.setFileInputFiles", { nodeId: nodo.nodeId, files: [csv] });
  await js(`(() => { document.querySelector('input[type="file"][name="arquivo"]').closest("form").requestSubmit(); return 1; })()`);
  await espera(4000);
  const imp = await q("select views, saves from content_performance where content_id = $1", [`qa_${ts}`]);
  confere(imp.length === 1 && Number(imp[0].views) === 1000, "importa CSV de conteúdo", JSON.stringify(imp));
  await cmd("DOM.setFileInputFiles", { nodeId: (await cmd("DOM.querySelector", { nodeId: (await cmd("DOM.getDocument", { depth: -1 })).result.root.nodeId, selector: 'input[type="file"][name="arquivo"]' })).result.nodeId, files: [csv] }).catch(() => {});
  await ir("/admin/epic/conteudo");
  const { result: doc2 } = await cmd("DOM.getDocument", { depth: -1 });
  const { result: nodo2 } = await cmd("DOM.querySelector", { nodeId: doc2.root.nodeId, selector: 'input[type="file"][name="arquivo"]' });
  await cmd("DOM.setFileInputFiles", { nodeId: nodo2.nodeId, files: [csv] });
  await js(`(() => { document.querySelector('input[type="file"][name="arquivo"]').closest("form").requestSubmit(); return 1; })()`);
  await espera(4000);
  confere((await q("select 1 from content_performance where content_id = $1", [`qa_${ts}`])).length === 1, "reimportar não duplica");
  fs.rmSync(csv, { force: true });

  // ── 10. Leads: exportar e anonimizar ──
  console.log("10. Leads");
  const ex = await fetch(`${BASE}/admin/epic/leads/${lead.lead_id}/exportar`, { headers: { cookie: `epic_admin=${token}` } });
  confere(ex.ok && (await ex.text()).includes(EMAIL), "exporta dados do lead");
  await ir(`/admin/epic/leads/${lead.lead_id}`);
  await enviar('form input[name="lead_id"]', { confirmar: "ANONIMIZAR" });
  const [an] = await q("select email from leads where lead_id = $1", [lead.lead_id]);
  confere(!an || an.email !== EMAIL, "anonimiza o lead", JSON.stringify(an));
} catch (e) {
  falhas++;
  console.log("  FALHA inesperada:", e.message);
} finally {
  // limpeza
  const base = (await q("select lead_id from leads where email = $1 or lead_id in (select lead_id from contact_messages where email = $1) or lead_id in (select lead_id from transactions where transaction_id like 'QA-%')", [EMAIL])).map((r) => r.lead_id);
  const leads = (await q("select lead_id from leads where lead_id = any($1) or merged_into = any($1)", [base])).map((r) => r.lead_id);
  if (leads.length) await q("update leads set merged_into = null where lead_id = any($1)", [leads]);
  await q("delete from receivables where transaction_id like 'QA-%'");
  await q("delete from transactions where transaction_id like 'QA-%'");
  await q("delete from content_performance where content_id like 'qa_%'");
  await q("delete from content_items where title like 'QA admin %'");
  await q("delete from editorial_ideas where ideia_mae like 'QA ideia %'");
  await q("delete from media_spend where notes like 'QA %'");
  if (leads.length) {
    for (const t of ["events", "messages", "mentoring_applications", "contact_messages", "map_results"]) await q(`delete from ${t} where lead_id = any($1)`, [leads]);
    await q("delete from contact_messages where email = $1", [EMAIL]);
    await q("delete from sessions where lead_id = any($1)", [leads]);
    await q("delete from leads where lead_id = any($1)", [leads]);
  }
  console.log(`\n${ok} ok, ${falhas} falha(s). Dados de teste apagados.`);
  ws.close(); edge.kill(); await db.end();
}
