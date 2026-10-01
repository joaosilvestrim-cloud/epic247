// Gerador do Plano EPIC 7 Dias (RF-030, Funis §38). Função pura: mesmo
// input, mesmo plano. O input mínimo é o dos documentos: dimensão, padrão
// principal e secundário, faixa do principal e as 3 respostas do eixo
// dominante. A comunicação obrigatória (RF-031) vai no próprio plano.

import type { DimensionId } from "../dimensions";
import { DIMENSIONS } from "../dimensions";
import { BAND_LABEL } from "../maps/engine";
import type { DimensionalMapConfig, DimensionalResult } from "../maps/types";
import { CONTEUDO_PLANO } from "./conteudo";

export const PLAN_TEMPLATE_VERSION = "1.0";

export interface DiaPlano {
  dia: number;
  titulo: string;
  acao: string;
}

export interface Plano {
  versao: string;
  dimensao: DimensionId;
  titulo: string;
  personalizacao: string;
  padrao: { chave: string; nome: string; nomeEditorial: string | null; faixa: string };
  secundario: { chave: string; nome: string };
  sinalMaisForte: string;
  foco: string;
  padraoAObservar: string;
  reduzir: string | null;
  movimentos: string[];
  pratica: string;
  gatilho: string | null;
  retomada: string | null;
  pergunta: string;
  dias: DiaPlano[];
  revisaoDia7: string[];
  proximoPasso: string;
  conteudoCompleto: boolean;
}

/** Afirmação em que a pessoa mais pontuou dentro do eixo dominante. */
function sinalMaisForte(cfg: DimensionalMapConfig, eixo: string, respostas: Record<string, number>) {
  const itens = cfg.questions.filter((q) => q.axis === eixo);
  let melhor = itens[0];
  let melhorPontos = -1;
  for (const q of itens) {
    const v = respostas[q.id];
    const pontos = q.reverse ? 4 - v : v;
    if (pontos > melhorPontos) {
      melhor = q;
      melhorPontos = pontos;
    }
  }
  // Item protetivo com nota alta significa que a pessoa NÃO se reconhece nele.
  return melhor.reverse ? `Você raramente se reconheceu nesta frase: “${melhor.text}”` : `“${melhor.text}”`;
}

export function gerarPlano(
  cfg: DimensionalMapConfig,
  r: DimensionalResult,
  respostas: Record<string, number>
): Plano {
  const d = cfg.mapType;
  const nome = DIMENSIONS[d].name;
  const perfil = cfg.profiles[r.primary];
  const rotulo = (k: string) => cfg.axes.find((a) => a.key === k)?.label ?? k;
  const c = CONTEUDO_PLANO[d][r.primary];
  const completo = Boolean(c.movimentos);

  const movimentos = c.movimentos ?? [
    perfil.firstMove,
    `Ao fim de cada dia, anote um momento em que o padrão “${rotulo(r.primary)}” apareceu.`,
    `Escolha uma situação da semana para testar uma resposta diferente da habitual.`,
  ];

  const dias: DiaPlano[] = [
    { dia: 1, titulo: "Observar", acao: perfil.firstMove },
    { dia: 2, titulo: "Nomear", acao: `Releia esta frase e escreva onde ela apareceu na sua semana: “${perfil.recognition}”` },
    { dia: 3, titulo: "Reduzir", acao: c.reduzir ? `Reduza: ${c.reduzir}` : "Escolha uma única coisa que alimenta o padrão e reduza pela metade, só hoje." },
    { dia: 4, titulo: "Primeiro movimento", acao: movimentos[0] },
    { dia: 5, titulo: "Segundo movimento", acao: movimentos[1] },
    { dia: 6, titulo: "Terceiro movimento", acao: movimentos[2] },
    { dia: 7, titulo: "Revisar", acao: "Responda as perguntas de revisão abaixo antes de decidir o que fica." },
  ];

  return {
    versao: PLAN_TEMPLATE_VERSION,
    dimensao: d,
    titulo: `Plano EPIC ${nome} 7 Dias`,
    personalizacao: "Personalizado a partir das suas respostas.",
    padrao: {
      chave: r.primary,
      nome: rotulo(r.primary),
      nomeEditorial: perfil.editorialName ?? null,
      faixa: BAND_LABEL[r.primaryBand],
    },
    secundario: { chave: r.secondary, nome: rotulo(r.secondary) },
    sinalMaisForte: sinalMaisForte(cfg, r.primary, respostas),
    foco: c.foco,
    padraoAObservar: perfil.recognition,
    reduzir: c.reduzir ?? null,
    movimentos,
    pratica: c.pratica ?? perfil.firstMove,
    gatilho: c.gatilho ?? null,
    retomada: c.retomada ?? (d === "acao" ? "Falhou um dia? Volte no seguinte com a versão mínima, sem compensar." : null),
    pergunta: `O que muda na sua semana se ${rotulo(r.primary).toLowerCase()} deixar de ser o seu principal ponto de fricção?`,
    dias,
    revisaoDia7: [
      "O que você percebeu sobre o padrão que não tinha percebido antes?",
      "Qual dos movimentos foi mais fácil de manter? Qual travou?",
      `O que você quer manter na próxima semana?`,
      `${rotulo(r.secondary)} também apareceu no seu mapa: ele ficou mais leve, igual ou mais pesado?`,
    ],
    proximoPasso: `Aprofundar com o Kit ${nome}: Manual + Workbook + ferramentas práticas.`,
    conteudoCompleto: completo,
  };
}
