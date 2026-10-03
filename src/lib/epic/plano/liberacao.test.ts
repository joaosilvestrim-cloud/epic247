import assert from "node:assert/strict";
import { test } from "node:test";
import { DIMENSION_IDS, type DimensionId } from "../dimensions";
import { conteudoPlanoCompleto, pendenciasPlano, planoLiberavel } from "./liberacao";

const todos = (v: boolean) => Object.fromEntries(DIMENSION_IDS.map((d) => [d, v])) as Record<DimensionId, boolean>;

test("nenhum Plano é liberável sem aprovação editorial", () => {
  for (const d of DIMENSION_IDS) assert.equal(planoLiberavel(d), false, d);
});

test("aprovação sozinha não libera conteúdo incompleto", () => {
  for (const d of DIMENSION_IDS) {
    if (!conteudoPlanoCompleto(d)) assert.equal(planoLiberavel(d, todos(true)), false, d);
  }
});

test("dimensão incompleta lista o que falta", () => {
  const incompleta = DIMENSION_IDS.find((d) => !conteudoPlanoCompleto(d));
  if (incompleta) assert.ok(pendenciasPlano(incompleta).length > 1);
});
