// Trava de venda do Plano EPIC 7 Dias (auditoria Entrega 01, NC-07).
// Um Plano só pode ser ativado/vendido quando o conteúdo da dimensão está
// completo para todos os perfis E aprovado pelo projeto. Sem isso, o gerador
// cairia em movimentos genéricos, e isso não pode virar produto pago.

import { DIMENSION_IDS, type DimensionId } from "../dimensions";
import { CONTEUDO_PLANO } from "./conteudo";

/**
 * Aprovação editorial do conteúdo do Plano por dimensão. Marcar true só
 * quando Ju/Luiz aprovarem os blocos-base (foco, reduzir, movimentos,
 * prática) de todos os perfis da dimensão.
 */
export const PLANO_CONTEUDO_APROVADO: Record<DimensionId, boolean> = {
  energia: false,
  mentalidade: false,
  autoconhecimento: false,
  felicidade: false,
  planejamento: false,
  coragem: false,
  acao: false,
  inteligencia: false,
  excelencia: false,
  amor: false,
};

/** Todos os perfis da dimensão têm foco aprovado e os blocos do Plano escritos. */
export function conteudoPlanoCompleto(d: DimensionId): boolean {
  const perfis = Object.values(CONTEUDO_PLANO[d] ?? {});
  return perfis.length > 0 && perfis.every((c) => c.focoAprovado && c.reduzir && c.movimentos?.length === 3 && c.pratica);
}

/** Pode ser ativado e vendido: completo e aprovado. */
export function planoLiberavel(d: DimensionId, aprovados: Record<DimensionId, boolean> = PLANO_CONTEUDO_APROVADO): boolean {
  return conteudoPlanoCompleto(d) && aprovados[d] === true;
}

/** Para o admin: o que falta em cada dimensão. */
export function pendenciasPlano(d: DimensionId): string[] {
  const falta: string[] = [];
  for (const [perfil, c] of Object.entries(CONTEUDO_PLANO[d] ?? {})) {
    const itens = [
      !c.focoAprovado && "foco aprovado",
      !c.reduzir && "o que reduzir",
      c.movimentos?.length !== 3 && "3 movimentos",
      !c.pratica && "prática diária",
    ].filter(Boolean);
    if (itens.length) falta.push(`${perfil}: ${itens.join(", ")}`);
  }
  if (!PLANO_CONTEUDO_APROVADO[d]) falta.push("aprovação editorial da dimensão");
  return falta;
}

export const DIMENSOES_PLANO = DIMENSION_IDS;
