// Modelo de Tarefas (gestão de atividades no /admin).

export type TarefaStatus = "a_fazer" | "fazendo" | "concluido";
export type TarefaPrioridade = "baixa" | "media" | "alta";

export interface Tarefa {
  id: string;
  titulo: string;
  descricao: string | null;
  categoria: string | null;
  responsavel: string | null;
  status: TarefaStatus;
  prioridade: TarefaPrioridade;
  prazo: string | null; // YYYY-MM-DD
  ordem: number | null;
  concluido_em: string | null;
  created_at: string;
  updated_at: string;
}

export const STATUS_INFO: Record<TarefaStatus, { label: string; cor: string }> = {
  a_fazer: { label: "A fazer", cor: "#94a3b8" },
  fazendo: { label: "Fazendo", cor: "#c09840" },
  concluido: { label: "Concluído", cor: "#10b981" },
};

export const STATUS_ORDER: TarefaStatus[] = ["a_fazer", "fazendo", "concluido"];

export const PRIORIDADE_INFO: Record<
  TarefaPrioridade,
  { label: string; cor: string }
> = {
  baixa: { label: "Baixa", cor: "#94a3b8" },
  media: { label: "Média", cor: "#c09840" },
  alta: { label: "Alta", cor: "#f43f5e" },
};

export function isStatus(v: unknown): v is TarefaStatus {
  return v === "a_fazer" || v === "fazendo" || v === "concluido";
}

export function isPrioridade(v: unknown): v is TarefaPrioridade {
  return v === "baixa" || v === "media" || v === "alta";
}

/** Dias até o prazo (negativo = atrasada). null se sem prazo. `hoje` em YYYY-MM-DD. */
export function diasAtePrazo(prazo: string | null, hojeISO: string): number | null {
  if (!prazo) return null;
  const a = new Date(prazo + "T00:00:00");
  const b = new Date(hojeISO + "T00:00:00");
  return Math.round((a.getTime() - b.getTime()) / 86400000);
}
