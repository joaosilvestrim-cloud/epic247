// Registro dos Mapas configurados. Um Mapa novo entra aqui com a sua
// configuração e passa a funcionar no mesmo motor e no mesmo template.

import type { DimensionId } from "../dimensions";
import { ACAO } from "./acao";
import { ENERGIA } from "./energia";
import { FRICCAO } from "./friccao";
import type { DimensionalMapConfig, MapType } from "./types";

export const DIMENSIONAL_MAPS: Partial<Record<DimensionId, DimensionalMapConfig>> = {
  energia: ENERGIA,
  acao: ACAO,
};

export { FRICCAO };

export function getDimensionalMap(d: DimensionId): DimensionalMapConfig | undefined {
  return DIMENSIONAL_MAPS[d];
}

export function hasDeepMap(d: DimensionId): boolean {
  return Boolean(DIMENSIONAL_MAPS[d]);
}

export const CONFIGURED_MAP_TYPES: MapType[] = [
  "friccao",
  ...(Object.keys(DIMENSIONAL_MAPS) as DimensionId[]),
];
