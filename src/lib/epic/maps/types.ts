// Tipos do MapEngine (Blueprint §10). Um único motor configurável para os
// 11 Mapas: o de Fricção (roteador) e os 10 dimensionais. Tudo que muda de
// um Mapa para outro é configuração; nada de lógica duplicada por Mapa.

import type { DimensionId } from "../dimensions";

/** "friccao" + as 10 dimensões (Modelo de Dados §6). */
export type MapType = "friccao" | DimensionId;

/** Faixas internas por eixo (Modelo de Dados §8). Nunca mostrar como nota. */
export type Band = "stable" | "observe" | "attention" | "priority";

/**
 * Como o resultado deve ser comunicado.
 * - single: um padrão claramente à frente.
 * - close: primeiro e segundo separados por 1 ponto ("muito próximos").
 * - tie: empate em primeiro (resultado duplo).
 * - low: nenhum eixo passa de "estável" (copy própria, pendente nos docs).
 */
export type ResultKind = "single" | "close" | "tie" | "low";

/* ───────────────────────── Mapas dimensionais ───────────────────────── */

export interface AnswerOption {
  value: 0 | 1 | 2 | 3 | 4;
  label: string;
}

export interface DimensionalQuestion {
  /** Código do documento: E1, A7, C12... */
  id: string;
  axis: string;
  text: string;
  /** Item protetivo: Nunca=4 ... Quase sempre=0. */
  reverse: boolean;
}

export interface Axis {
  /** Chave estável, usada em score_<key> e nos dados. */
  key: string;
  label: string;
}

export interface ProfileCopy {
  /** Ex.: "O Preparador". Energia não usa nome editorial. */
  editorialName?: string;
  title: string;
  interpretation: string;
  recognition: string;
  firstMove: string;
  /** Conceitos EPIC relacionados, quando o documento cita. */
  concepts?: string[];
}

export interface DimensionalMapConfig {
  kind: "dimensional";
  mapType: DimensionId;
  mapVersion: string;
  scoringVersion: string;
  resultCopyVersion: string;
  title: string;
  /** Texto de responsabilidade exibido na abertura/rodapé. */
  disclaimer: string;
  estimatedMinutes: string;
  axes: Axis[];
  questions: DimensionalQuestion[];
  profiles: Record<string, ProfileCopy>;
  /** Mensagem do resultado duplo, com {A} e {B}. */
  dualMessage: string;
  /** Título geral opcional (Energia: "Seu maior vazamento..."). */
  generalTitle?: string;
  generalSubtitle?: string;
  closingPhrase: string;
  ctaPlan: string;
  ctaKit: string;
  /** Dimensões a sugerir quando a fricção pode estar em outro lugar. */
  related: { dimension: DimensionId; when: string }[];
}

/* ───────────────────────── Mapa de Fricção ───────────────────────── */

export interface FrictionOption {
  /** A, B, C, D, E */
  id: string;
  text: string;
  primary: DimensionId;
  secondary: DimensionId;
}

export interface FrictionQuestion {
  id: number;
  text: string;
  options: FrictionOption[];
}

export interface FrictionResultCopy {
  title: string;
  interpretation: string;
  firstMove: string;
  cta: string;
}

export interface FrictionMapConfig {
  kind: "friccao";
  mapType: "friccao";
  mapVersion: string;
  scoringVersion: string;
  resultCopyVersion: string;
  title: string;
  disclaimer: string;
  estimatedMinutes: string;
  primaryWeight: number;
  secondaryWeight: number;
  questions: FrictionQuestion[];
  results: Record<DimensionId, FrictionResultCopy>;
  dualMessage: string;
}

export type MapConfig = DimensionalMapConfig | FrictionMapConfig;

/* ───────────────────────── Resultados ───────────────────────── */

export interface AxisScore {
  key: string;
  score: number;
  band: Band;
}

export interface DimensionalResult {
  mapType: DimensionId;
  mapVersion: string;
  scoringVersion: string;
  kind: ResultKind;
  /** Eixos na ordem do documento. */
  axes: AxisScore[];
  primary: string;
  secondary: string;
  /** Todos os eixos empatados em primeiro, quando kind = tie. */
  tiedTop: string[];
  primaryBand: Band;
}

export interface FrictionResult {
  mapType: "friccao";
  mapVersion: string;
  scoringVersion: string;
  kind: Exclude<ResultKind, "low">;
  scores: Record<DimensionId, number>;
  /** Quantas vezes cada dimensão recebeu o peso principal. */
  primaryHits: Record<DimensionId, number>;
  primary: DimensionId;
  secondary: DimensionId;
  tiedTop: DimensionId[];
}
