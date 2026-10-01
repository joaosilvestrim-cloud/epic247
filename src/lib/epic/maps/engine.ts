// MapEngine: pontuação pura, sem React e sem banco, para rodar igual no
// navegador e no servidor e ser coberta por teste (RF-090). O servidor
// SEMPRE recalcula a partir das respostas: o cliente nunca manda o resultado.

import { DIMENSION_IDS, type DimensionId } from "../dimensions";
import type {
  Band,
  DimensionalMapConfig,
  DimensionalResult,
  FrictionMapConfig,
  FrictionResult,
} from "./types";

export class MapAnswerError extends Error {}

/* ───────────────────────── Mapas dimensionais ───────────────────────── */

/** Faixas internas (RF-009). Ponto de corte fixo pelos documentos. */
export function bandFor(score: number): Band {
  if (score <= 3) return "stable";
  if (score <= 6) return "observe";
  if (score <= 9) return "attention";
  return "priority";
}

/** Rótulos públicos das faixas. Nunca exibir o número como nota. */
export const BAND_LABEL: Record<Band, string> = {
  stable: "Mais estável",
  observe: "Vale observar",
  attention: "Merece atenção",
  priority: "Principal ponto de atenção",
};

/**
 * Respostas: id da pergunta → valor escolhido na escala
 * (0 Nunca · 1 Raramente · 2 Às vezes · 3 Frequentemente · 4 Quase sempre).
 * Item protetivo é invertido aqui, não na interface.
 */
export function scoreDimensional(
  config: DimensionalMapConfig,
  answers: Record<string, number>
): DimensionalResult {
  const porEixo = new Map<string, number>(config.axes.map((a) => [a.key, 0]));

  for (const q of config.questions) {
    const v = answers[q.id];
    if (!Number.isInteger(v) || v < 0 || v > 4) {
      throw new MapAnswerError(`Resposta ausente ou inválida para ${q.id}`);
    }
    const pontos = q.reverse ? 4 - v : v;
    porEixo.set(q.axis, (porEixo.get(q.axis) ?? 0) + pontos);
  }

  const axes = config.axes.map((a) => {
    const score = porEixo.get(a.key) ?? 0;
    return { key: a.key, score, band: bandFor(score) };
  });

  // Ordena por pontuação; empate mantém a ordem do documento só para ter um
  // resultado determinístico. O empate em si é comunicado, nunca escondido.
  const ordem = [...axes].sort(
    (x, y) =>
      y.score - x.score ||
      config.axes.findIndex((a) => a.key === x.key) -
        config.axes.findIndex((a) => a.key === y.key)
  );
  const top = ordem[0];
  const segundo = ordem[1];
  const tiedTop = ordem.filter((a) => a.score === top.score).map((a) => a.key);

  let kind: DimensionalResult["kind"];
  if (top.band === "stable") kind = "low";
  else if (tiedTop.length >= 2) kind = "tie";
  else if (top.score - segundo.score === 1) kind = "close";
  else kind = "single";

  return {
    mapType: config.mapType,
    mapVersion: config.mapVersion,
    scoringVersion: config.scoringVersion,
    kind,
    axes,
    primary: top.key,
    secondary: segundo.key,
    tiedTop: kind === "tie" ? tiedTop : [],
    primaryBand: top.band,
  };
}

/* ───────────────────────── Mapa de Fricção ───────────────────────── */

/**
 * Respostas: número da pergunta → letra escolhida (A a E).
 *
 * Desempate (Mapa de Fricção §3):
 * 1) mais ocorrências de peso principal (+3);
 * 2) persistindo, a dimensão cujo +3 veio da pergunta mais adiante na
 *    sequência (as perguntas avançam em direção à ação concreta);
 * 3) por fim, a ordem do Protocolo, só para ser determinístico.
 * Diferença de 0 ou 1 ponto entre as duas primeiras é sempre comunicada
 * como "duas fricções muito próximas", sem falsa precisão.
 */
export function scoreFriction(
  config: FrictionMapConfig,
  answers: Record<number, string>
): FrictionResult {
  const zero = () =>
    Object.fromEntries(DIMENSION_IDS.map((d) => [d, 0])) as Record<DimensionId, number>;
  const scores = zero();
  const primaryHits = zero();
  const ultimaPerguntaPrincipal = zero();

  for (const q of config.questions) {
    const letra = answers[q.id];
    const opcao = q.options.find((o) => o.id === letra);
    if (!opcao) throw new MapAnswerError(`Resposta ausente ou inválida para a pergunta ${q.id}`);
    scores[opcao.primary] += config.primaryWeight;
    scores[opcao.secondary] += config.secondaryWeight;
    primaryHits[opcao.primary] += 1;
    ultimaPerguntaPrincipal[opcao.primary] = Math.max(ultimaPerguntaPrincipal[opcao.primary], q.id);
  }

  const ordem = [...DIMENSION_IDS].sort(
    (a, b) =>
      scores[b] - scores[a] ||
      primaryHits[b] - primaryHits[a] ||
      ultimaPerguntaPrincipal[b] - ultimaPerguntaPrincipal[a] ||
      DIMENSION_IDS.indexOf(a) - DIMENSION_IDS.indexOf(b)
  );
  const [primary, secondary] = ordem;
  const diff = scores[primary] - scores[secondary];
  const tiedTop = ordem.filter((d) => scores[d] === scores[primary]);

  return {
    mapType: "friccao",
    mapVersion: config.mapVersion,
    scoringVersion: config.scoringVersion,
    kind: diff === 0 ? "tie" : diff === 1 ? "close" : "single",
    scores,
    primaryHits,
    primary,
    secondary,
    tiedTop: diff === 0 ? tiedTop : [],
  };
}

/** Escala de resposta dos Mapas dimensionais (todos os documentos). */
export const ANSWER_SCALE = [
  { value: 0, label: "Nunca" },
  { value: 1, label: "Raramente" },
  { value: 2, label: "Às vezes" },
  { value: 3, label: "Frequentemente" },
  { value: 4, label: "Quase sempre" },
] as const;
