// Gera supabase/conteudos.sql a partir da planilha (xlsx descompactado).
const fs = require("fs");

const dir = "C:/Users/joaol/Downloads/_epic_xlsx";

const ss = fs.readFileSync(dir + "/xl/sharedStrings.xml", "utf8");
const strings = [];
const reSi = /<si>([\s\S]*?)<\/si>/g;
let m;
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

const keys = Object.keys(rows)
  .map(Number)
  .sort((a, b) => a - b)
  .slice(1);
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
function q(v) {
  if (v === null || v === undefined || String(v).trim() === "") return "NULL";
  return "'" + String(v).trim().split("'").join("''") + "'";
}

const out = [];
out.push("-- EPIC247 — Calendario de Conteudo (gerado da planilha). Rode no SQL Editor.");
out.push("create table if not exists public.conteudos (");
out.push("  id uuid primary key default gen_random_uuid(),");
out.push("  data date, dia text, horario text, tipo text, formato text,");
out.push("  nomenclatura text, nome text not null, story_num text,");
out.push("  status text not null default 'a_produzir',");
out.push("  link text, legenda text, hashtags text, notas text,");
out.push("  ordem int default 0,");
out.push("  created_at timestamptz not null default now(),");
out.push("  updated_at timestamptz not null default now()");
out.push(");");
out.push("create index if not exists conteudos_data_idx on public.conteudos (data);");
out.push("create index if not exists conteudos_status_idx on public.conteudos (status);");
out.push("alter table public.conteudos enable row level security;");
out.push("");
out.push(
  "insert into public.conteudos (ordem, data, dia, horario, tipo, formato, nomenclatura, nome, story_num, status, link, legenda, hashtags, notas) values"
);
const vals = [];
data.forEach((rw, i) => {
  const nome = (rw[7] || "").trim();
  if (!nome) return;
  const iso = dateISO(rw[1]);
  vals.push(
    "(" +
      [
        i + 1,
        iso ? "'" + iso + "'" : "NULL",
        q(rw[2]),
        q(rw[3]),
        q(rw[4]),
        q(rw[5]),
        q(rw[6]),
        q(nome),
        q(rw[8]),
        "'" + statusMap(rw[9]) + "'",
        q(rw[10]),
        q(rw[11]),
        q(rw[12]),
        q(rw[13]),
      ].join(", ") +
      ")"
  );
});
out.push(vals.join(",\n") + ";");
out.push("");
out.push("notify pgrst, 'reload schema';");

fs.writeFileSync("C:/Users/joaol/epic247/supabase/conteudos.sql", out.join("\n"), "utf8");
console.log("linhas inseridas:", vals.length);
console.log(
  "tamanho:",
  (fs.statSync("C:/Users/joaol/epic247/supabase/conteudos.sql").size / 1024).toFixed(0) + "KB"
);
console.log("--- amostra ---");
console.log(vals[0].slice(0, 260));
