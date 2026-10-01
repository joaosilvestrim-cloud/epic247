// RF-090: testes de scoring por Mapa. Rodar com `npm test`.
// Usa o test runner nativo do Node (sem binário nativo, por causa da
// política de controle de aplicativos desta máquina).

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { DIMENSION_IDS } from "../dimensions";
import { bandFor, MapAnswerError, scoreDimensional, scoreFriction } from "./engine";
import { DIMENSIONAL_MAPS, FRICCAO } from "./index";
import type { DimensionalMapConfig } from "./types";

/** Monta respostas para que cada eixo some exatamente os pontos pedidos. */
function respostasComPontos(cfg: DimensionalMapConfig, alvo: Record<string, number>) {
  const r: Record<string, number> = {};
  for (const a of cfg.axes) {
    let restante = alvo[a.key] ?? 0;
    for (const q of cfg.questions.filter((q) => q.axis === a.key)) {
      const pontos = Math.min(4, restante);
      restante -= pontos;
      r[q.id] = q.reverse ? 4 - pontos : pontos;
    }
  }
  return r;
}

describe("faixas", () => {
  it("cortes 0–3, 4–6, 7–9, 10–12", () => {
    assert.deepEqual([0, 3, 4, 6, 7, 9, 10, 12].map(bandFor), [
      "stable", "stable", "observe", "observe", "attention", "attention", "priority", "priority",
    ]);
  });
});

for (const cfg of Object.values(DIMENSIONAL_MAPS)) {
  describe(`Mapa de ${cfg.mapType}`, () => {
    it("configuração íntegra: 15 itens, 3 por eixo, 1 invertido por eixo, perfil para cada eixo", () => {
      assert.equal(cfg.questions.length, 15);
      assert.equal(cfg.axes.length, 5);
      assert.equal(new Set(cfg.questions.map((q) => q.id)).size, 15);
      for (const a of cfg.axes) {
        const itens = cfg.questions.filter((q) => q.axis === a.key);
        assert.equal(itens.length, 3, `eixo ${a.key}`);
        assert.equal(itens.filter((q) => q.reverse).length, 1, `invertidos em ${a.key}`);
        assert.ok(cfg.profiles[a.key], `perfil de ${a.key}`);
      }
    });

    it("pontuação mínima: tudo 0, resultado 'low'", () => {
      const r = scoreDimensional(cfg, respostasComPontos(cfg, {}));
      assert.ok(r.axes.every((a) => a.score === 0 && a.band === "stable"));
      assert.equal(r.kind, "low");
    });

    it("pontuação máxima: tudo 12, empate entre os cinco", () => {
      const tudo12 = Object.fromEntries(cfg.axes.map((a) => [a.key, 12]));
      const r = scoreDimensional(cfg, respostasComPontos(cfg, tudo12));
      assert.ok(r.axes.every((a) => a.score === 12 && a.band === "priority"));
      assert.equal(r.kind, "tie");
      assert.equal(r.tiedTop.length, 5);
    });

    it("item invertido: responder 'Nunca' no item protetivo vale 4 pontos", () => {
      const eixo = cfg.axes[0].key;
      const r: Record<string, number> = respostasComPontos(cfg, {});
      const protetivo = cfg.questions.find((q) => q.axis === eixo && q.reverse)!;
      r[protetivo.id] = 0;
      const res = scoreDimensional(cfg, r);
      assert.equal(res.axes.find((a) => a.key === eixo)!.score, 4);
    });

    it("perfil principal e secundário claros", () => {
      const [a, b, c, d, e] = cfg.axes.map((x) => x.key);
      const r = scoreDimensional(cfg, respostasComPontos(cfg, { [c]: 11, [e]: 7, [a]: 2, [b]: 1, [d]: 0 }));
      assert.equal(r.kind, "single");
      assert.equal(r.primary, c);
      assert.equal(r.secondary, e);
      assert.equal(r.primaryBand, "priority");
    });

    it("empate em primeiro vira resultado duplo", () => {
      const [a, , , d] = cfg.axes.map((x) => x.key);
      const r = scoreDimensional(cfg, respostasComPontos(cfg, { [a]: 8, [d]: 8 }));
      assert.equal(r.kind, "tie");
      assert.deepEqual(r.tiedTop, [a, d]);
    });

    it("diferença de 1 ponto é comunicada como 'muito próximos'", () => {
      const [, b, c] = cfg.axes.map((x) => x.key);
      const r = scoreDimensional(cfg, respostasComPontos(cfg, { [b]: 9, [c]: 10 }));
      assert.equal(r.kind, "close");
      assert.equal(r.primary, c);
      assert.equal(r.secondary, b);
    });

    it("resposta faltando ou fora da escala é recusada", () => {
      const r = respostasComPontos(cfg, {});
      delete r[cfg.questions[0].id];
      assert.throws(() => scoreDimensional(cfg, r), MapAnswerError);
      const r2 = { ...respostasComPontos(cfg, {}), [cfg.questions[1].id]: 5 };
      assert.throws(() => scoreDimensional(cfg, r2), MapAnswerError);
    });
  });
}

describe("Mapa de Fricção", () => {
  it("configuração íntegra: 7 perguntas, 5 alternativas, dimensões válidas", () => {
    assert.equal(FRICCAO.questions.length, 7);
    for (const q of FRICCAO.questions) {
      assert.equal(q.options.length, 5);
      for (const o of q.options) {
        assert.ok((DIMENSION_IDS as readonly string[]).includes(o.primary));
        assert.ok((DIMENSION_IDS as readonly string[]).includes(o.secondary));
        assert.notEqual(o.primary, o.secondary);
      }
    }
    for (const d of DIMENSION_IDS) assert.ok(FRICCAO.results[d], `resultado de ${d}`);
  });

  it("soma +3 na principal e +1 na secundária", () => {
    // 1A Energia+3 Felic+1 · 2A Autoc+3 Felic+1 · 3D Felic+3 Autoc+1 · 4A Autoc+3 Amor+1
    // 5D Energia+3 Exc+1 · 6A Energia+3 Felic+1 · 7A Energia+3 Exc+1
    const r = scoreFriction(FRICCAO, { 1: "A", 2: "A", 3: "D", 4: "A", 5: "D", 6: "A", 7: "A" });
    assert.equal(r.scores.energia, 12);
    assert.equal(r.scores.autoconhecimento, 7);
    assert.equal(r.scores.felicidade, 6);
    assert.equal(r.primary, "energia");
    assert.equal(r.secondary, "autoconhecimento");
    assert.equal(r.kind, "single");
  });

  /** "AAAAADE" → { 1: "A", 2: "A", ... }. Casos achados por busca exaustiva. */
  const resp = (letras: string) =>
    Object.fromEntries([...letras].map((l, i) => [i + 1, l])) as Record<number, string>;

  it("desempate 1: empate em pontos, vence quem tem mais pesos principais", () => {
    // Autoconhecimento 6 (2A +3, 4A +3) x Felicidade 6 (3x +1 e 7E +3).
    const r = scoreFriction(FRICCAO, resp("AAAAADE"));
    assert.equal(r.scores.autoconhecimento, 6);
    assert.equal(r.scores.felicidade, 6);
    assert.equal(r.primaryHits.autoconhecimento, 2);
    assert.equal(r.primaryHits.felicidade, 1);
    assert.equal(r.primary, "autoconhecimento");
    assert.equal(r.secondary, "felicidade");
    assert.equal(r.kind, "tie");
  });

  it("desempate 2: mesmos pontos e pesos, vence o +3 mais adiante no teste", () => {
    // Energia 6 (+3 nas perguntas 1 e 6) x Autoconhecimento 6 (+3 nas 2 e 4).
    const r = scoreFriction(FRICCAO, resp("AAAAAAC"));
    assert.equal(r.scores.energia, 6);
    assert.equal(r.scores.autoconhecimento, 6);
    assert.equal(r.primaryHits.energia, r.primaryHits.autoconhecimento);
    assert.equal(r.primary, "energia");
    assert.equal(r.kind, "tie");
    assert.deepEqual(r.tiedTop, ["energia", "autoconhecimento"]);
  });

  it("diferença de 1 ponto vira 'close'", () => {
    // Energia 7 (1A +3, 6C +1, 7A +3) x Autoconhecimento 6.
    const r = scoreFriction(FRICCAO, resp("AAAAACA"));
    assert.equal(r.scores.energia, 7);
    assert.equal(r.scores.autoconhecimento, 6);
    assert.equal(r.kind, "close");
    assert.equal(r.primary, "energia");
    assert.deepEqual(r.tiedTop, []);
  });

  it("resposta inválida é recusada", () => {
    assert.throws(() => scoreFriction(FRICCAO, { 1: "Z" }), MapAnswerError);
  });

  it("documenta o viés: pontuação máxima possível por dimensão (pesos v1.0)", () => {
    const max = Object.fromEntries(
      DIMENSION_IDS.map((d) => [
        d,
        FRICCAO.questions.reduce(
          (soma, q) =>
            soma +
            Math.max(...q.options.map((o) => (o.primary === d ? 3 : o.secondary === d ? 1 : 0))),
          0
        ),
      ])
    );
    // Se estes números mudarem, os pesos mudaram: atualizar scoringVersion.
    assert.deepEqual(max, {
      energia: 12, mentalidade: 9, autoconhecimento: 16, felicidade: 11, planejamento: 10,
      coragem: 13, acao: 13, inteligencia: 9, excelencia: 13, amor: 10,
    });
  });
});
