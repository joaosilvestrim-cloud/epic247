// Páginas de dimensão da "Copy Final do Site" v1.0 (PROPOSTA FINAL).
// dimensoes.json é gerado por scripts/v2-copy-final.mjs a partir do
// documento: o texto público vem dele, sem reescrita (Blueprint v1.2 §54.1).

import type { DimensionId } from "../../dimensions";
import dados from "./dimensoes.json";

export type TipoBloco =
  | "hero"
  | "reconhecimento"
  | "significado"
  | "pontos"
  | "mapa"
  | "resultado"
  | "movimento"
  | "captura"
  | "plano"
  | "kit"
  | "conexoes"
  | "editorial"
  | "repertorio"
  | "protocolo"
  | "fechamento"
  | "livre";

export interface CardCopy {
  titulo: string;
  perfil?: string;
  pergunta?: string;
  texto?: string;
  reconhecimento?: string;
  primeiro?: string;
}

export interface BlocoCopy {
  n: number;
  tipo: TipoBloco;
  nome: string;
  eyebrow?: string[];
  titulo?: string[];
  sub?: string[];
  apoio?: string[];
  texto?: string[];
  cenas?: string[];
  destaque?: string[];
  fechamento?: string[];
  marca?: string[];
  cta?: string[];
  cta2?: string[];
  preco?: string[];
  micro?: string[];
  nota?: string[];
  listas?: { titulo: string; itens: string[] }[];
  cards?: CardCopy[];
  conexoes?: { titulo: string; texto: string }[];
  filme?: string[];
  exemplo?: string[];
}

export interface MapaCopy {
  intro: string | null;
  calculando: string | null;
  pronto: string | null;
  tituloResultado: string | null;
  duplo: string | null;
  capturaTitulo: string | null;
  capturaTexto: string | null;
  capturaCta: string | null;
  responsabilidade: string | null;
  alerta: string | null;
}

export interface PaginaDimensaoCopy {
  blocos: BlocoCopy[];
  seo: { title?: string; description?: string; ogTitle?: string; ogDescription?: string; canonical?: string };
  mapa: MapaCopy;
}

export const PAGINAS_DIMENSAO = dados as unknown as Record<DimensionId, PaginaDimensaoCopy>;

export function paginaDimensao(id: DimensionId): PaginaDimensaoCopy {
  return PAGINAS_DIMENSAO[id];
}

/** Eyebrow do documento vem em caixa alta; a marca não usa caixa alta. */
export function fraseCaso(s: string): string {
  const baixo = s.toLowerCase().replace(/epic247/g, "EPIC247").replace(/\bepic\b/g, "EPIC");
  return baixo.replace(/(^|[.!?]\s+)(\p{L})/gu, (_, a: string, b: string) => a + b.toUpperCase());
}

/** Troca [ÁREA], [ÁREA A], [DRENO B] etc. pelos nomes reais. */
export function preencher(texto: string, principal: string, secundaria?: string): string {
  return texto
    .replace(/\[(?:ÁREA|DRENO|EIXO)(?: A)?\]/g, principal)
    .replace(/\[(?:ÁREA|DRENO|EIXO) B\]/g, secundaria ?? "");
}
