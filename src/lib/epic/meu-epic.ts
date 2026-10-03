// Regras puras do Meu EPIC (CR-01A), testáveis fora do servidor:
// quem pode abrir o quê, estado do Plano, progresso do Protocolo e o
// destino seguro depois do login.

import { DIMENSION_IDS, isDimensionId, type DimensionId } from "./dimensions";

export type StatusAcesso = "active" | "suspended" | "revoked";

export interface Acesso {
  product_type: "plan" | "kit" | "protocol" | "mentoring";
  scope: string;
  access_status: StatusAcesso;
}

const ativos = (a: Acesso[]) => a.filter((x) => x.access_status === "active");

/** Protocolo inclui os materiais de todas as dimensões (CR-01A, regra de acesso). */
export function temProtocolo(acessos: Acesso[]): boolean {
  return ativos(acessos).some((a) => a.product_type === "protocol");
}

/** Kit da dimensão: comprou o Kit ou o Protocolo. */
export function podeAbrirKit(acessos: Acesso[], d: string): boolean {
  return temProtocolo(acessos) || ativos(acessos).some((a) => a.product_type === "kit" && a.scope === d);
}

/** Material: de Kit abre com o Kit da dimensão ou o Protocolo; do Protocolo, só com o Protocolo. */
export function podeBaixarMaterial(acessos: Acesso[], m: { product_type: "kit" | "protocol"; dimension: string }): boolean {
  return m.product_type === "protocol" ? temProtocolo(acessos) : podeAbrirKit(acessos, m.dimension);
}

/** Plano: só com acesso ativo ao Plano daquela dimensão (Protocolo não inclui o Plano personalizado). */
export function podeAbrirPlano(acessos: Acesso[], d: string): boolean {
  return ativos(acessos).some((a) => a.product_type === "plan" && a.scope === d);
}

// ── Plano ──
export type EstadoPlano = "processing" | "ready" | "failed";

export function estadoPlano(g: { processing_status: string; content: unknown }): EstadoPlano {
  if (g.processing_status === "generated" && g.content) return "ready";
  if (g.processing_status === "failed") return "failed";
  return "processing";
}

/** Texto do estado, sem depender de cor (CR-01A, acessibilidade). */
export function rotuloPlano(estado: EstadoPlano, aguardandoMapa: boolean): string {
  if (estado === "ready") return "Pronto";
  if (estado === "failed") return "Em revisão pela equipe";
  return aguardandoMapa ? "Aguardando seu Mapa" : "Em preparação";
}

export function rotuloAcesso(s: StatusAcesso): string {
  return s === "active" ? "Ativo" : s === "suspended" ? "Suspenso" : "Encerrado";
}

// ── Protocolo ──
export type EstadoDimensao = "nao_iniciado" | "em_andamento" | "concluido";

/** Ordem recomendada já aprovada: a mesma das 10 dimensões no site. */
export const ORDEM_PROTOCOLO: readonly DimensionId[] = DIMENSION_IDS;

export function progressoProtocolo(linhas: { dimension: string; status: string }[]) {
  const por = new Map(linhas.map((l) => [l.dimension, l.status]));
  const dimensoes = ORDEM_PROTOCOLO.map((d) => {
    const s = por.get(d);
    const estado: EstadoDimensao = s === "completed" ? "concluido" : s === "in_progress" ? "em_andamento" : "nao_iniciado";
    return { dimensao: d, estado };
  });
  const concluidas = dimensoes.filter((x) => x.estado === "concluido").length;
  // Próxima sugerida: a primeira em andamento; senão, a primeira não iniciada na ordem.
  const proxima =
    dimensoes.find((x) => x.estado === "em_andamento")?.dimensao ??
    dimensoes.find((x) => x.estado === "nao_iniciado")?.dimensao ??
    null;
  return { dimensoes, concluidas, total: ORDEM_PROTOCOLO.length, proxima };
}

export function rotuloDimensao(e: EstadoDimensao): string {
  return e === "concluido" ? "Concluído" : e === "em_andamento" ? "Em andamento" : "Não iniciado";
}

// ── Login ──
/** Destino depois do login: só caminhos internos do Meu EPIC. Nada de URL externa. */
export function destinoSeguro(v: unknown): string {
  if (typeof v !== "string") return "/meu-epic";
  if (!/^\/meu-epic(\/[A-Za-z0-9/_-]*)?$/.test(v) || v.includes("//")) return "/meu-epic";
  return v;
}

/** "joao@exemplo.com" → "j***@exemplo.com": confirma o destino sem expor o endereço. */
export function emailMascarado(email: string): string {
  const [u, dom] = email.split("@");
  if (!dom) return "seu e-mail";
  return `${u.slice(0, 1)}***@${dom}`;
}

export const dimensaoValida = (v: unknown): v is DimensionId => isDimensionId(v);
