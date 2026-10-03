// Modelo do Calendário de Conteúdo (importado da planilha editorial).

export type ConteudoStatus = "a_produzir" | "validar" | "entregue" | "repost";

export interface Anexo {
  nome: string;
  url: string;
  path: string;
  tamanho?: number;
}

export interface Conteudo {
  id: string;
  semana: string | null;
  data: string | null; // YYYY-MM-DD
  dia: string | null;
  horario: string | null;
  tipo: string | null;
  formato: string | null;
  nomenclatura: string | null;
  nome: string;
  story_num: string | null;
  status: ConteudoStatus;
  link: string | null;
  legenda: string | null;
  hashtags: string | null;
  notas: string | null;
  anexos: Anexo[] | null;
  ordem: number | null;
  created_at: string;
  updated_at: string;
}

export const STATUS_INFO: Record<ConteudoStatus, { label: string; cor: string }> = {
  a_produzir: { label: "A produzir", cor: "#94a3b8" },
  validar: { label: "Validar", cor: "#c09840" },
  entregue: { label: "Entregue", cor: "#10b981" },
  repost: { label: "Repost", cor: "#6366f1" },
};

export const STATUS_ORDER: ConteudoStatus[] = [
  "a_produzir",
  "validar",
  "entregue",
  "repost",
];

export function isStatus(v: unknown): v is ConteudoStatus {
  return (
    v === "a_produzir" || v === "validar" || v === "entregue" || v === "repost"
  );
}

/** Dias até a data de publicação (negativo = passou). null se sem data. */
export function diasAteData(data: string | null, hojeISO: string): number | null {
  if (!data) return null;
  const a = new Date(data + "T00:00:00");
  const b = new Date(hojeISO + "T00:00:00");
  return Math.round((a.getTime() - b.getTime()) / 86400000);
}

/** Status que ainda demandam produção/ação. */
export function pendente(status: ConteudoStatus): boolean {
  return status === "a_produzir" || status === "validar";
}
