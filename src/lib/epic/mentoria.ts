// Regras puras da Mentoria piloto (RC1 §6, Requisitos RF-034 a RF-036,
// RF-041, RF-060, RF-085, RF-086, Matriz §26). Sem banco e sem React:
// servem ao formulário, à API, ao admin e ao disparador, e têm teste.

export const STATUS_MENTORIA = [
  "novo",
  "em_contato",
  "vaga_confirmada",
  "link_enviado",
  "ativo",
  "concluido",
  "lista_espera",
  "encerrado_sem_aderencia",
] as const;
export type StatusMentoria = (typeof STATUS_MENTORIA)[number];

export const ehStatusMentoria = (v: unknown): v is StatusMentoria =>
  typeof v === "string" && (STATUS_MENTORIA as readonly string[]).includes(v);

/** Rótulos do admin. "Encerrado sem aderência" é interno: nunca vai para a pessoa. */
export const ROTULO_STATUS: Record<StatusMentoria, string> = {
  novo: "Novo",
  em_contato: "Em contato",
  vaga_confirmada: "Vaga confirmada",
  link_enviado: "Link de pagamento enviado",
  ativo: "Ativo",
  concluido: "Concluído",
  lista_espera: "Lista de espera",
  encerrado_sem_aderencia: "Encerrado sem aderência",
};

/** Conversa em andamento: a pessoa sai das automações comerciais de baixo ticket. */
export const EM_TRATATIVA: readonly StatusMentoria[] = ["novo", "em_contato", "vaga_confirmada", "link_enviado"];

/**
 * Mudanças que a equipe pode fazer à mão. "link_enviado" só entra pela ação
 * de liberar o link. "ativo" só entra pela confirmação do pagamento
 * (webhook): nada é confirmado antes do pagamento.
 */
export const TRANSICOES: Record<StatusMentoria, readonly StatusMentoria[]> = {
  novo: ["em_contato", "vaga_confirmada", "lista_espera", "encerrado_sem_aderencia"],
  em_contato: ["vaga_confirmada", "lista_espera", "encerrado_sem_aderencia"],
  vaga_confirmada: ["em_contato", "lista_espera", "encerrado_sem_aderencia"],
  link_enviado: ["vaga_confirmada", "lista_espera", "encerrado_sem_aderencia"],
  ativo: ["concluido"],
  concluido: [],
  lista_espera: ["em_contato", "vaga_confirmada", "encerrado_sem_aderencia"],
  encerrado_sem_aderencia: ["novo", "em_contato", "lista_espera"],
};

export function podeMudar(de: StatusMentoria, para: StatusMentoria): boolean {
  return TRANSICOES[de].includes(para);
}

/** O link de pagamento só sai depois da vaga confirmada. Reenviar vale enquanto não pagou. */
export function podeLiberarLink(status: StatusMentoria): boolean {
  return status === "vaga_confirmada" || status === "link_enviado";
}

export type EstadoMentoria = "AVAILABLE" | "WAITLIST";

/** Capacidade preenchida por clientes ativos vira lista de espera (RF-035). */
export function estadoMentoria(capacidade: number, ocupadas: number): EstadoMentoria {
  return ocupadas < capacidade ? "AVAILABLE" : "WAITLIST";
}

// ── Formulário (RF-060 e microcopy §3) ──

export const LIMITE_CONTEXTO = 600;

export const MSG = {
  nome: "Digite seu nome.",
  emailVazio: "Digite seu e-mail.",
  emailInvalido: "Digite um e-mail válido.",
  whatsapp: "Confira o número e tente novamente.",
} as const;

export type CampoMentoria = "name" | "email" | "whatsapp";

export interface InteresseMentoria {
  nome: string;
  email: string;
  whatsapp: string | null;
  contexto: string | null;
  marketing: boolean;
}

const texto = (v: unknown, n: number) => (typeof v === "string" && v.trim() ? v.trim().slice(0, n) : null);

/**
 * WhatsApp opcional. Guarda só dígitos com "+". Número brasileiro sem DDI
 * (10 ou 11 dígitos) ganha o 55. Retorna undefined quando é inválido.
 */
export function normalizarWhatsapp(v: unknown): string | null | undefined {
  if (typeof v !== "string" || !v.trim()) return null;
  if (/[a-z]/i.test(v)) return undefined;
  let d = v.replace(/\D/g, "");
  if (d.length === 10 || d.length === 11) d = `55${d}`;
  if (d.length < 12 || d.length > 15) return undefined;
  return `+${d}`;
}

export function emailOk(v: string): boolean {
  return v.length <= 254 && /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(v);
}

export function validarInteresse(
  b: Record<string, unknown>
): { ok: true; dados: InteresseMentoria } | { ok: false; erros: Partial<Record<CampoMentoria, string>> } {
  const erros: Partial<Record<CampoMentoria, string>> = {};
  const nome = texto(b.name, 120);
  if (!nome) erros.name = MSG.nome;
  const email = texto(b.email, 254)?.toLowerCase() ?? null;
  if (!email) erros.email = MSG.emailVazio;
  else if (!emailOk(email)) erros.email = MSG.emailInvalido;
  const whatsapp = normalizarWhatsapp(b.whatsapp);
  if (whatsapp === undefined) erros.whatsapp = MSG.whatsapp;
  if (Object.keys(erros).length) return { ok: false, erros };
  return {
    ok: true,
    dados: {
      nome: nome!,
      email: email!,
      whatsapp: whatsapp ?? null,
      contexto: texto(b.context, LIMITE_CONTEXTO),
      marketing: b.marketing === true,
    },
  };
}

// ── Supressão (RF-041, Matriz §10 e §26) ──

export interface SituacaoMentoria {
  automacao: string;
  prioridade: number;
  productId?: string | null;
  /** Compra da Mentoria aprovada (lead_profile.mentoring_purchased). */
  comprou: boolean;
  /** Status da candidatura mais recente, se houver. */
  status: StatusMentoria | null;
  /** O link de pagamento já foi liberado para a pessoa. */
  linkLiberado: boolean;
}

/**
 * Motivo para não enviar uma mensagem por causa da Mentoria, ou null.
 * - Checkout abandonado da Mentoria só existe depois do link liberado.
 * - Cliente em acompanhamento sai dos fluxos promocionais padrão.
 * - Durante a conversa, nada de automação comercial de baixo ticket.
 * Transacionais (prioridade 1 a 3) e a newsletter editorial seguem.
 */
export function supressaoMentoria(s: SituacaoMentoria): string | null {
  const abandonoMentoria = s.automacao === "AUT_CHECKOUT_ABANDON" && s.productId === "mentoring";
  if (abandonoMentoria && !s.linkLiberado) return "mentoria_sem_link";
  if (s.prioridade < 4 || s.automacao === "AUT_NEWSLETTER_EDITION") return null;
  const emAcompanhamento = s.status === "ativo" || (s.comprou && s.status !== "concluido");
  if (emAcompanhamento) return "cliente_mentoria";
  if (s.status && EM_TRATATIVA.includes(s.status) && !abandonoMentoria) return "tratativa_mentoria";
  return null;
}
