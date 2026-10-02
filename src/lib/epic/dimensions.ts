// As 10 dimensões da Infraestrutura Humana (Posicionamento §5, Site §3).
// Fonte única: nome, slug, ordem e onda de lançamento vêm daqui (RF-075).

export const DIMENSION_IDS = [
  "energia",
  "mentalidade",
  "autoconhecimento",
  "felicidade",
  "planejamento",
  "coragem",
  "acao",
  "inteligencia",
  "excelencia",
  "amor",
] as const;

export type DimensionId = (typeof DIMENSION_IDS)[number];

export type Publication = "published" | "draft";

export interface Dimension {
  id: DimensionId;
  /** Posição no Protocolo (1 a 10). */
  order: number;
  name: string;
  /** Linha do manifesto: "Energia para começar." */
  manifestoLine: string;
  /** Frase curta do mega-menu. COPY PENDENTE nos docs (Blueprint §5). */
  menuPhrase: string | null;
  /** Onda técnica em que o Mapa profundo entra (Funis §49). */
  mapWave: 1 | 2 | 3 | 4;
  /** RF-088: dimensão sem copy aprovada fica em rascunho. */
  page: Publication;
  map: Publication;
}

export const DIMENSIONS: Record<DimensionId, Dimension> = {
  energia: {
    id: "energia", order: 1, name: "Energia",
    manifestoLine: "Energia para começar.",
    menuPhrase: null, mapWave: 1, page: "published", map: "published",
  },
  mentalidade: {
    id: "mentalidade", order: 2, name: "Mentalidade",
    manifestoLine: "Mentalidade para interpretar.",
    menuPhrase: null, mapWave: 3, page: "published", map: "published",
  },
  autoconhecimento: {
    id: "autoconhecimento", order: 3, name: "Autoconhecimento",
    manifestoLine: "Autoconhecimento para escolher.",
    menuPhrase: null, mapWave: 2, page: "published", map: "published",
  },
  felicidade: {
    id: "felicidade", order: 4, name: "Felicidade",
    manifestoLine: "Felicidade para não adiar a vida inteira.",
    menuPhrase: null, mapWave: 3, page: "published", map: "published",
  },
  planejamento: {
    id: "planejamento", order: 5, name: "Planejamento",
    manifestoLine: "Planejamento para transformar desejo em caminho.",
    menuPhrase: null, mapWave: 3, page: "published", map: "published",
  },
  coragem: {
    id: "coragem", order: 6, name: "Coragem",
    manifestoLine: "Coragem para atravessar o medo.",
    menuPhrase: null, mapWave: 2, page: "published", map: "published",
  },
  acao: {
    id: "acao", order: 7, name: "Ação",
    manifestoLine: "Ação para sair do papel.",
    menuPhrase: null, mapWave: 1, page: "published", map: "published",
  },
  inteligencia: {
    id: "inteligencia", order: 8, name: "Inteligência",
    manifestoLine: "Inteligência para adaptar a rota.",
    menuPhrase: null, mapWave: 4, page: "published", map: "published",
  },
  excelencia: {
    id: "excelencia", order: 9, name: "Excelência",
    manifestoLine: "Excelência para continuar melhorando.",
    menuPhrase: null, mapWave: 4, page: "published", map: "published",
  },
  amor: {
    id: "amor", order: 10, name: "Amor",
    manifestoLine: "Amor para lembrar por que tudo isso importa.",
    menuPhrase: null, mapWave: 4, page: "published", map: "published",
  },
};

export function isDimensionId(v: unknown): v is DimensionId {
  return typeof v === "string" && (DIMENSION_IDS as readonly string[]).includes(v);
}

export const dimensionPath = (id: DimensionId) => `/dimensoes/${id}`;
export const mapPath = (id: DimensionId) => `/mapas/${id}`;
export const FRICTION_MAP_PATH = "/mapa";
