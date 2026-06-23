// Importa os conteúdos da planilha (xlsx descompactado) para o Supabase via API.
const fs = require("fs");

const dir = "C:/Users/joaol/Downloads/_epic_xlsx";
const BASE = "https://msnibsxsodwzpujdtlux.supabase.co";
const SR = process.env.SR_KEY;
if (!SR) {
  console.error("Defina SR_KEY no ambiente.");
  process.exit(1);
}

function unesc(s) {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#10;/g, "\n")
    .replace(/&#13;/g, "\r")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

const ss = fs.readFileSync(dir + "/xl/sharedStrings.xml", "utf8");
const strings = [];
const reSi = /<si>([\s\S]*?)<\/si>/g;
let m;
while ((m = reSi.exec(ss))) {
  const ts = [...m[1].matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)].map((x) => x[1]);
  strings.push(unesc(ts.join("")));
}

const sheet = fs.readFileSync(dir + "/xl/worksheets/sheet1.xml", "utf8");
const rows = {};
const reRow = /<row r="(\d+)"[^>]*>([\s\S]*?)<\/row>/g;
let r;
const colOf = (ref) => ref.replace(/[0-9]/g, "");
const colIdx = (c) => {
  let n = 0;
  for (const ch of c) n = n * 26 + (ch.charCodeAt(0) - 64);
  return n - 1;
};
while ((r = reRow.exec(sheet))) {
  const cells = r[2];
  const arr = [];
  const reC =
    /<c r="([A-Z]+\d+)"(?:[^>]*t="([^"]*)")?[^>]*>(?:<v>([\s\S]*?)<\/v>|<is><t[^>]*>([\s\S]*?)<\/t><\/is>)?<\/c>/g;
  let c;
  while ((c = reC.exec(cells))) {
    const ci = colIdx(colOf(c[1]));
    const t = c[2];
    let v = "";
    if (c[4] !== undefined) v = unesc(c[4]);
    else if (c[3] !== undefined) v = t === "s" ? strings[+c[3]] ?? "" : c[3];
    arr[ci] = v;
  }
  rows[+r[1]] = arr;
}

const keys = Object.keys(rows).map(Number).sort((a, b) => a - b).slice(1);
const data = keys.map((k) => rows[k]);

function statusMap(s) {
  s = (s || "").trim().toLowerCase();
  if (s.startsWith("entreg")) return "entregue";
  if (s.startsWith("repost")) return "repost";
  if (s.startsWith("valid")) return "validar";
  return "a_produzir";
}
function dateISO(d) {
  d = (d || "").trim();
  const mt = d.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!mt) return null;
  return `${mt[3]}-${mt[2].padStart(2, "0")}-${mt[1].padStart(2, "0")}`;
}
const clean = (v) => {
  const s = (v ?? "").toString().trim();
  return s === "" ? null : s;
};

const registros = [];
data.forEach((rw, i) => {
  const nome = (rw[7] || "").trim();
  if (!nome) return;
  registros.push({
    ordem: i + 1,
    data: dateISO(rw[1]),
    dia: clean(rw[2]),
    horario: clean(rw[3]),
    tipo: clean(rw[4]),
    formato: clean(rw[5]),
    nomenclatura: clean(rw[6]),
    nome,
    story_num: clean(rw[8]),
    status: statusMap(rw[9]),
    link: clean(rw[10]),
    legenda: clean(rw[11]),
    hashtags: clean(rw[12]),
    notas: clean(rw[13]),
  });
});

async function tryFetch(url, opts, n = 5) {
  for (let i = 0; i < n; i++) {
    try {
      return await fetch(url, opts);
    } catch (e) {
      if (i === n - 1) throw e;
      await new Promise((s) => setTimeout(s, 800));
    }
  }
}

(async () => {
  const H = {
    apikey: SR,
    Authorization: "Bearer " + SR,
    "Content-Type": "application/json",
  };
  // limpa existentes (idempotente)
  const del = await tryFetch(
    BASE + "/rest/v1/conteudos?id=not.is.null",
    { method: "DELETE", headers: H }
  );
  console.log("DELETE existentes ->", del.status);

  let inseridos = 0;
  const lote = 100;
  for (let i = 0; i < registros.length; i += lote) {
    const chunk = registros.slice(i, i + lote);
    const res = await tryFetch(BASE + "/rest/v1/conteudos", {
      method: "POST",
      headers: { ...H, Prefer: "return=minimal" },
      body: JSON.stringify(chunk),
    });
    if (!res.ok) {
      console.error("Falha no lote", i, res.status, await res.text());
      process.exit(1);
    }
    inseridos += chunk.length;
    console.log(`lote ${i / lote + 1}: +${chunk.length} (total ${inseridos})`);
  }

  const cnt = await tryFetch(
    BASE + "/rest/v1/conteudos?select=id",
    { headers: { ...H, Prefer: "count=exact", Range: "0-0" } }
  );
  console.log("Total na tabela:", cnt.headers.get("content-range"));
  console.log("OK — importados", inseridos);
})();
