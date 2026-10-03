// Auditoria NC-15: o EPIC247 2.0 não pode importar o legado do Ciclo 1.
// O legado mora em src/legacy/ciclo1 e só o admin antigo (consulta) usa.
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { test } from "node:test";

const RAIZ = path.join(process.cwd(), "src");
// Únicos lugares autorizados a importar o legado: o próprio legado e o admin antigo.
const AUTORIZADOS = [
  path.join(RAIZ, "legacy"),
  path.join(RAIZ, "app", "admin", "antigo"),
  path.join(RAIZ, "app", "api", "admin", "conteudos"),
  path.join(RAIZ, "app", "api", "admin", "origem"),
];

function arquivos(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return arquivos(p);
    return /\.(ts|tsx)$/.test(e.name) ? [p] : [];
  });
}

test("nenhum código do 2.0 importa src/legacy", () => {
  const infratores = arquivos(RAIZ)
    .filter((f) => !AUTORIZADOS.some((a) => f.startsWith(a)))
    .filter((f) => /from\s+["']@\/legacy\//.test(fs.readFileSync(f, "utf8")))
    .map((f) => path.relative(RAIZ, f));
  assert.deepEqual(infratores, []);
});
