import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { DIMENSIONAL_MAPS } from "../maps";
import { scoreDimensional } from "../maps/engine";
import { gerarPlano } from "./gerador";
import { CONTEUDO_PLANO } from "./conteudo";

/** Respostas que fazem `eixo` dominar com 12 e o resto ficar em 2. */
function respostasDominando(cfg: (typeof DIMENSIONAL_MAPS)["energia"], eixo: string) {
  const r: Record<string, number> = {};
  for (const q of cfg.questions) {
    const pontos = q.axis === eixo ? 4 : q.axis === cfg.axes.find((a) => a.key !== eixo)!.key ? 1 : 0;
    r[q.id] = q.reverse ? 4 - pontos : pontos;
  }
  return r;
}

describe("Plano EPIC 7 Dias", () => {
  for (const cfg of Object.values(DIMENSIONAL_MAPS)) {
    it(`${cfg.mapType}: os 5 perfis geram plano válido`, () => {
      for (const a of cfg.axes) {
        assert.ok(CONTEUDO_PLANO[cfg.mapType][a.key], `conteúdo de ${cfg.mapType}/${a.key}`);
        const resp = respostasDominando(cfg, a.key);
        const r = scoreDimensional(cfg, resp);
        assert.equal(r.primary, a.key);
        const p = gerarPlano(cfg, r, resp);
        assert.equal(p.dias.length, 7);
        assert.equal(p.personalizacao, "Personalizado a partir das suas respostas.");
        assert.equal(p.movimentos.length, 3);
        assert.ok(p.foco.length > 10);
        assert.doesNotMatch(JSON.stringify(p), /Ju (analis|revis)/i, "nunca sugerir análise individual da Ju");
      }
    });
  }

  it("sinal mais forte vem da afirmação com mais pontos do eixo dominante", () => {
    const cfg = DIMENSIONAL_MAPS.energia;
    const resp = respostasDominando(cfg, "atencao");
    resp.E10 = 4; resp.E11 = 2; resp.E12 = 2; // E10 é a mais forte
    const r = scoreDimensional(cfg, resp);
    const p = gerarPlano(cfg, r, resp);
    assert.match(p.sinalMaisForte, /Notificações, mensagens e interrupções/);
  });

  it("Onda 1 (Energia e Ação) tem conteúdo completo; as demais ainda não", () => {
    for (const d of ["energia", "acao"] as const)
      for (const k of Object.keys(CONTEUDO_PLANO[d])) assert.ok(CONTEUDO_PLANO[d][k].movimentos, `${d}/${k}`);
    assert.equal(CONTEUDO_PLANO.coragem.decisao.movimentos, undefined);
  });
});
