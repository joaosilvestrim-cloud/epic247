// Registro dos Mapas configurados. Um Mapa novo entra aqui com a sua
// configuração e passa a funcionar no mesmo motor e no mesmo template.
// Se o Mapa aparece no site ou não é decidido em dimensions.ts (status).

import type { DimensionId } from "../dimensions";
import { ACAO } from "./acao";
import { AMOR } from "./amor";
import { AUTOCONHECIMENTO } from "./autoconhecimento";
import { CORAGEM } from "./coragem";
import { ENERGIA } from "./energia";
import { EXCELENCIA } from "./excelencia";
import { FELICIDADE } from "./felicidade";
import { FRICCAO } from "./friccao";
import { INTELIGENCIA } from "./inteligencia";
import { MENTALIDADE } from "./mentalidade";
import { PLANEJAMENTO } from "./planejamento";
import type { DimensionalMapConfig, MapType } from "./types";

export const DIMENSIONAL_MAPS: Record<DimensionId, DimensionalMapConfig> = {
  energia: ENERGIA,
  mentalidade: MENTALIDADE,
  autoconhecimento: AUTOCONHECIMENTO,
  felicidade: FELICIDADE,
  planejamento: PLANEJAMENTO,
  coragem: CORAGEM,
  acao: ACAO,
  inteligencia: INTELIGENCIA,
  excelencia: EXCELENCIA,
  amor: AMOR,
};

export { FRICCAO };

export function getDimensionalMap(d: DimensionId): DimensionalMapConfig {
  return DIMENSIONAL_MAPS[d];
}

export const CONFIGURED_MAP_TYPES: MapType[] = ["friccao", ...(Object.keys(DIMENSIONAL_MAPS) as DimensionId[])];
