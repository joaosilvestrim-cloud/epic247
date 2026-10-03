// Guarda contra drift da Copy Final (auditoria Entrega 01, NC-01).
// 1. dimensoes.json foi gerado exatamente do texto congelado do repositório.
// 2. Todo texto público dos módulos de conteúdo existe, literal, na Copy Final.
import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { test } from "node:test";
import dados from "./copy-final/dimensoes.json";
import * as contato from "./contato";
import * as home from "./home";
import * as ideias from "./ideias";
import * as ju from "./ju";
import * as mentoria from "./mentoria";
import * as microcopy from "./microcopy";
import * as navegacao from "./navegacao";
import * as produto from "./paginas-produto";
import * as protocolo from "./protocolo";

const FONTE = path.join(process.cwd(), "docs", "v2", "fontes", "copy-final.txt");
const bruto = fs.readFileSync(FONTE, "utf8").replace(/\r/g, "");

const norm = (s: string) =>
  s
    .normalize("NFC")
    .replace(/[“”"]/g, "")
    .replace(/[‘’]/g, "'")
    .replace(/\s+/g, " ")
    .replace(/[;.:,]\s*$/, "")
    .trim()
    .toLowerCase();
const copy = norm(bruto.split("\n").map((l) => l.replace(/^•\s*/, "").replace(/;\s*$/, "")).join(" "));

/** Percorre os valores exportados; funções recebem "§" em cada parâmetro. */
function textos(v: unknown, rota: string, out: [string, string][]): [string, string][] {
  if (typeof v === "string") out.push([rota, v]);
  else if (typeof v === "function") {
    const args = Array.from({ length: Math.max(1, v.length) }, () => "§");
    textos((v as (...a: string[]) => unknown)(...args), `${rota}()`, out);
  } else if (Array.isArray(v)) v.forEach((x, i) => textos(x, `${rota}[${i}]`, out));
  else if (v && typeof v === "object") for (const [k, x] of Object.entries(v)) textos(x, `${rota}.${k}`, out);
  return out;
}

test("dimensoes.json corresponde à Copy Final congelada do repositório", () => {
  const hash = crypto.createHash("sha256").update(bruto).digest("hex");
  assert.equal((dados as { _meta: { sha256: string } })._meta.sha256, hash, "rode: node scripts/v2-copy-final.mjs");
});

test("todo texto público dos módulos de conteúdo existe na Copy Final", () => {
  const modulos = { home, navegacao, protocolo, contato, ideias, ju, produto, microcopy, mentoria };
  const fora = Object.entries(modulos)
    .flatMap(([nome, m]) => textos(m, nome, []))
    .filter(([, s]) => s.length >= 18 && !/^[a-z_/#?.=:-]+$/.test(s))
    .filter(([, s]) => !s.split("§").every((parte) => parte.trim().length < 5 || copy.includes(norm(parte))))
    .map(([r, s]) => `${r}: ${s.slice(0, 90)}`);
  assert.deepEqual(fora, []);
});
