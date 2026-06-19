import { DRENOS_POR_HIERARQUIA, type DrenoId } from "./drenos";
import { QUIZ_QUESTIONS } from "./quiz-data";

export type ScoreMap = Record<DrenoId, number>;

export interface QuizResult {
  scores: ScoreMap;
  dominante: DrenoId;
  secundario: DrenoId;
  /** Drenos ordenados do maior para o menor score (com desempate biológico). */
  ranking: DrenoId[];
}

const DRENO_IDS: DrenoId[] = ["sono", "combustivel", "cortisol", "atencao", "movimento"];

export function emptyScores(): ScoreMap {
  return { sono: 0, combustivel: 0, cortisol: 0, atencao: 0, movimento: 0 };
}

/**
 * Calcula o resultado do quiz.
 *
 * @param respostas Mapa de id da pergunta -> índice da opção escolhida (0..3).
 *                  Perguntas não respondidas são ignoradas (peso 0).
 */
export function calcularResultado(respostas: Record<number, number>): QuizResult {
  const scores = emptyScores();

  for (const questao of QUIZ_QUESTIONS) {
    const indice = respostas[questao.id];
    if (indice === undefined) continue;
    const opcao = questao.opcoes[indice];
    if (!opcao) continue;
    scores[questao.dreno] += opcao.peso;
  }

  const ranking = ordenarComDesempate(scores);

  return {
    scores,
    dominante: ranking[0],
    secundario: ranking[1],
    ranking,
  };
}

/**
 * Ordena os Drenos do maior para o menor score.
 *
 * Desempate biológico: em caso de empate, vence o Dreno mais alto na
 * hierarquia fisiológica — Sono > Combustível > Estresse > Tela > Movimento.
 */
export function ordenarComDesempate(scores: ScoreMap): DrenoId[] {
  const hierarquia = new Map<DrenoId, number>(
    DRENOS_POR_HIERARQUIA.map((d) => [d.id, d.hierarquia])
  );

  return [...DRENO_IDS].sort((a, b) => {
    if (scores[b] !== scores[a]) return scores[b] - scores[a];
    // Empate: menor número de hierarquia vence (mais prioritário).
    return (hierarquia.get(a) ?? 99) - (hierarquia.get(b) ?? 99);
  });
}

/** Score máximo possível por Dreno (3 perguntas × peso 3). */
export const MAX_SCORE_POR_DRENO = 9;
