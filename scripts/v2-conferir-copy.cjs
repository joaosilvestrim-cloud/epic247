// Confere se TODO texto dos Mapas (perguntas, resultados, CTAs) bate com os
// documentos oficiais. Uso, depois de `npm test` (que gera .test-build):
//   node scripts/v2-conferir-copy.cjs <pasta com os .md extraídos dos .docx>
// Ignora só aspas tipográficas, maiúscula inicial e marcadores [X]/{A}.
const fs = require("fs");
const pasta = process.argv[2];
if (!pasta) { console.error("informe a pasta dos documentos .md"); process.exit(2); }
const norm = (s) => s.replace(/[“”]/g, '"').replace(/[‘’]/g, "'").replace(/\[[^\]]*\]/g, "X")
  .replace(/\{[^}]*\}/g, "X").replace(/\s+/g, " ").trim().toLowerCase();
const { DIMENSIONAL_MAPS, FRICCAO } = require("../.test-build/maps/index");
const arq = { energia: "Mapa de Energia", mentalidade: "Mapa de Mentalidade", autoconhecimento: "Mapa de Autoconhecimento",
  felicidade: "Mapa de Felicidade", planejamento: "Mapa de Planejamento", coragem: "Mapa de Coragem", acao: "Mapa de Ação",
  inteligencia: "Mapa de Inteligência", excelencia: "Mapa de Excelência", amor: "Mapa de Amor" };
let total = 0; const ruins = [];
const conf = (k, doc, textos) => { for (const x of textos) { total++; if (!doc.includes(norm(x))) ruins.push(`${k}: ${x.slice(0, 90)}`); } };
for (const [k, c] of Object.entries(DIMENSIONAL_MAPS)) {
  const doc = norm(fs.readFileSync(`${pasta}/${arq[k]}.md`, "utf8")); const t = [];
  for (const q of c.questions) t.push(q.text);
  for (const a of c.axes) t.push(a.label);
  for (const p of Object.values(c.profiles)) { t.push(p.title, p.interpretation, p.recognition, p.firstMove); if (p.editorialName) t.push(p.editorialName); }
  for (const r of c.related) t.push(r.when);
  t.push(c.closingPhrase, c.ctaPlan, c.ctaKit, c.dualMessage);
  conf(k, doc, t);
}
const dF = norm(fs.readFileSync(`${pasta}/Mapa de Fricção EPIC.md`, "utf8")); const tF = [];
for (const q of FRICCAO.questions) { tF.push(q.text); for (const o of q.options) tF.push(o.text); }
for (const r of Object.values(FRICCAO.results)) tF.push(r.title, r.interpretation, r.firstMove, r.cta);
tF.push(FRICCAO.dualMessage);
conf("friccao", dF, tF);
console.log(`textos conferidos: ${total} | divergentes: ${ruins.length}`);
ruins.forEach((r) => console.log("  -", r));
process.exitCode = ruins.length ? 1 : 0;
