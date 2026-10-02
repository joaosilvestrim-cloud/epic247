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

describe("Plano na estrutura de cada dimensão (seção 10 de cada Mapa)", () => {
  it("segue a ordem de blocos do documento e começa pelo foco e termina no Kit", () => {
    for (const [d, cfg] of Object.entries(DIMENSIONAL_MAPS)) {
      const eixo = cfg.axes[0].key;
      const plano = gerarPlano(cfg, scoreDimensional(cfg, respostasDominando(cfg, eixo)), respostasDominando(cfg, eixo));
      const blocos = plano.estrutura!;
      assert.equal(blocos[0].tipo, "foco", d);
      assert.equal(blocos[blocos.length - 1].tipo, "proximo", d);
      assert.ok(blocos.some((b) => b.tipo === "pergunta"), `${d}: pergunta de reflexão`);
      assert.ok(blocos.some((b) => b.tipo === "revisao"), `${d}: revisão no dia 7`);
      assert.equal(plano.versao, "1.1");
    }
  });

  it("Coragem pede o que o documento pede (controle, prevenção, reparo, custo da inércia)", () => {
    const cfg = DIMENSIONAL_MAPS.coragem;
    const plano = gerarPlano(cfg, scoreDimensional(cfg, respostasDominando(cfg, "decisao")), respostasDominando(cfg, "decisao"));
    const campos = plano.estrutura!.filter((b) => b.tipo === "campo").map((b) => b.titulo);
    for (const t of ["O que está sob seu controle", "O que pode ser prevenido", "O que pode ser reparado", "Custo da inércia"]) {
      assert.ok(campos.includes(t), t);
    }
  });

  it("Excelência não tem conteúdo recomendado no documento, e o Plano respeita", () => {
    const cfg = DIMENSIONAL_MAPS.excelencia;
    const eixo = cfg.axes[0].key;
    const plano = gerarPlano(cfg, scoreDimensional(cfg, respostasDominando(cfg, eixo)), respostasDominando(cfg, eixo));
    assert.ok(!plano.estrutura!.some((b) => b.tipo === "conteudo"));
  });
});

describe("Empate: prioridade escolhida pela pessoa (Mapa de Energia §8)", () => {
  it("o Plano parte da área escolhida só quando ela está no empate", async () => {
    const { aplicarPrioridade } = await import("./gerador");
    const cfg = DIMENSIONAL_MAPS.energia;
    const [a, b] = [cfg.axes[0].key, cfg.axes[1].key];
    const r: Record<string, number> = {};
    for (const q of cfg.questions) r[q.id] = q.axis === a || q.axis === b ? (q.reverse ? 0 : 4) : q.reverse ? 4 : 0;
    const res = scoreDimensional(cfg, r);
    assert.equal(res.kind, "tie");
    const outro = res.tiedTop.find((k) => k !== res.primary)!;
    const escolhido = aplicarPrioridade(res, outro);
    assert.equal(escolhido.primary, outro);
    assert.equal(escolhido.secondary, res.primary);
    assert.equal(gerarPlano(cfg, escolhido, r).padrao.chave, outro);
    // Escolha fora do empate é ignorada.
    assert.equal(aplicarPrioridade(res, cfg.axes[4].key).primary, res.primary);
  });
});
