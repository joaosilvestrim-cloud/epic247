import assert from "node:assert/strict";
import { test } from "node:test";

// A navegação depende do ambiente na hora em que o módulo carrega: o teste
// liga "produção" antes de carregar site.ts.
process.env.NEXT_PUBLIC_EPIC_ENV = "production";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const site = require("./site") as typeof import("./site");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { DIMENSION_IDS, DIMENSIONS } = require("./dimensions") as typeof import("./dimensions");

test("em produção, dimensão com página em rascunho e Mapa no ar leva ao Mapa", () => {
  for (const d of DIMENSION_IDS) {
    const { page, map } = DIMENSIONS[d];
    const href = site.dimensaoHref(d);
    if (page === "published") assert.equal(href, `/dimensoes/${d}`);
    else if (map === "published") assert.equal(href, `/mapas/${d}`);
    else assert.equal(href, null);
  }
});

test("Onda 1 aparece na navegação de produção (Energia e Ação)", () => {
  const nav = site.dimensoesNavegaveis().map((d) => d.id);
  assert.ok(nav.includes("energia") && nav.includes("acao"), nav.join(","));
  assert.ok(nav.every((d) => site.dimensaoHref(d) !== null));
});

test("em produção, Mapa em rascunho não aparece", () => {
  const rascunho = DIMENSION_IDS.filter((d) => DIMENSIONS[d].map === "draft" && DIMENSIONS[d].page === "draft");
  for (const d of rascunho) assert.equal(site.mapaVisivel(d), false);
});
