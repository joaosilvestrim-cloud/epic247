// Regras de supressão de oferta (RF-038 a RF-041, RF-081) e orientação de
// quem já tem o Protocolo. Puras: testadas em ofertas.test.ts.

import { DIMENSAO_NO_PROTOCOLO } from "./content/protocolo";
import { MICRO } from "./content/microcopy";
import { DIMENSIONS, type DimensionId } from "./dimensions";

export interface PerfilCompras {
  protocol_purchased: boolean;
  kits_owned: string[];
  plans_owned: string[];
}

export function ofertasPermitidas(perfil: PerfilCompras | null, dimensao: string) {
  const protocolo = Boolean(perfil?.protocol_purchased);
  return {
    plano: !protocolo && !perfil?.plans_owned.includes(dimensao) && !perfil?.kits_owned.includes(dimensao),
    kit: !protocolo && !perfil?.kits_owned.includes(dimensao),
    protocolo: !protocolo,
    jaTemProtocolo: protocolo,
  };
}

/**
 * RF-081: comprador do Protocolo que refaz um Mapa é orientado ao módulo da
 * dimensão, sem nova oferta. Só trechos aprovados da Copy Final: a função da
 * dimensão no sistema (§20, bloco 4), a microcopy pós-compra (§27.20) e o
 * CTA de usuário reconhecido (§27.31).
 */
export function orientacaoProtocolo(d: DimensionId) {
  return {
    rotulo: `${String(DIMENSIONS[d].order).padStart(2, "0")} · ${DIMENSIONS[d].name}`,
    funcao: DIMENSAO_NO_PROTOCOLO[d].funcao,
    pergunta: DIMENSAO_NO_PROTOCOLO[d].pergunta,
    sequencia: MICRO.posCompra.protocoloMicro,
    cta: MICRO.reconhecido.protocolo,
  };
}
