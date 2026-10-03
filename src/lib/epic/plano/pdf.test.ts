import assert from "node:assert/strict";
import { test } from "node:test";
import { PDFDocument } from "pdf-lib";
import { DIMENSIONAL_MAPS } from "../maps";
import { scoreDimensional } from "../maps/engine";
import { gerarPlano } from "./gerador";
import { planoEmPdf } from "./pdf";

test("PDF do Plano sai de qualquer dimensão, com acentos e várias páginas", async () => {
  for (const cfg of Object.values(DIMENSIONAL_MAPS)) {
    const resp = Object.fromEntries(cfg.questions.map((q, i) => [q.id, i % 5]));
    const p = gerarPlano(cfg, scoreDimensional(cfg, resp), resp);
    const bytes = await planoEmPdf(p, { dimensaoNome: "Ação → teste", recomendado: { titulo: "Conteúdo", url: "https://epic247.com.br/ideias" } });
    assert.equal(Buffer.from(bytes.slice(0, 5)).toString(), "%PDF-", cfg.mapType);
    const doc = await PDFDocument.load(bytes);
    assert.ok(doc.getPageCount() >= 2, `${cfg.mapType}: ${doc.getPageCount()} páginas`);
  }
});
