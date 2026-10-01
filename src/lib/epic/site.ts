// Navegação global (RF-001, Blueprint §5).

import { DIMENSION_IDS, DIMENSIONS, dimensionPath, type Dimension } from "./dimensions";
import { IS_PRODUCTION } from "./content/copy";

export const NAV = [
  { label: "Protocolo", href: "/protocolo" },
  { label: "Mentoria", href: "/mentoria" },
  { label: "Ju", href: "/ju" },
  { label: "Ideias", href: "/ideias" },
  { label: "Contato", href: "/contato" },
] as const;

export const CTA_FRICCAO = { label: "Descubra seu ponto de fricção", href: "/mapa" } as const;

/** Dimensões visíveis: em produção só as publicadas (RF-088). */
export function dimensoesVisiveis(): Dimension[] {
  return DIMENSION_IDS.map((d) => DIMENSIONS[d]).filter((d) => !IS_PRODUCTION || d.page === "published");
}

export function dimensaoVisivel(id: Dimension["id"]): boolean {
  return !IS_PRODUCTION || DIMENSIONS[id].page === "published";
}

export function mapaVisivel(id: Dimension["id"]): boolean {
  return !IS_PRODUCTION || DIMENSIONS[id].map === "published";
}

export { dimensionPath };
