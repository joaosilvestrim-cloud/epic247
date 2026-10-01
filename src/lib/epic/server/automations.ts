import "server-only";
import type { DimensionId } from "../dimensions";
import type { Q } from "./db";

// Motor de automação (Matriz de Automações e Gatilhos v1.0).
//
// Agendar = gravar uma linha por etapa na tabela messages, com horário,
// prioridade e uma dedupe_key que impede agendar a mesma etapa duas vezes.
// Enviar = o disparador (dispatcher.ts) pega o que venceu e REAVALIA a
// supressão com o estado atual do lead antes de mandar. Assim uma compra
// feita entre o agendamento e o envio sempre vence (regra-mãe da Matriz:
// "se o sistema já sabe que a pessoa avançou, ele precisa parar de
// tratá-la como se ainda estivesse no passo anterior").

/** 1 transacional · 2 entrega · 3 acompanhamento · 4 comportamental · 5 newsletter · 6 promocional */
export type Prioridade = 1 | 2 | 3 | 4 | 5 | 6;

export interface Etapa {
  step: string;
  /** Atraso a partir do gatilho, em horas. */
  horas: number;
  template: string;
  prioridade: Prioridade;
  /**
   * Regra de supressão avaliada NA HORA DO ENVIO. Retorna o motivo para
   * pular, ou null para enviar. Recebe o perfil atual do lead e o contexto.
   */
  suprimir?: Supressao;
}

export interface PerfilLead {
  lead_id: string;
  email: string | null;
  first_name: string | null;
  lifecycle_stage: string;
  marketing_email_allowed: boolean;
  unsubscribed_at: string | null;
  plan_purchased: boolean;
  kit_purchased: boolean;
  protocol_purchased: boolean;
  mentoring_purchased: boolean;
  kits_owned: string[] | null;
  /** E-mail voltou (bounce permanente): nada mais é enviado. */
  email_bounced_at?: string | null;
}

export type Contexto = Record<string, unknown> & {
  dimension?: string;
  map_result_id?: string;
  transaction_id?: string;
  product_id?: string;
};

type Supressao = (
  p: PerfilLead,
  ctx: Contexto,
  extra: { mapaAberto?: boolean; compraFeita?: boolean; relacionadaFeita?: boolean }
) => string | null;

// ── Regras de supressão reutilizáveis (Modelo de Dados §27/28) ──
const jaComprouProtocolo: Supressao = (p) => (p.protocol_purchased ? "comprou_protocolo" : null);
const jaComprouAlgo: Supressao = (p) =>
  p.plan_purchased || p.kit_purchased || p.protocol_purchased || p.mentoring_purchased ? "ja_comprou" : null;
const jaTemKitDaDimensao: Supressao = (p, ctx) =>
  ctx.dimension && p.kits_owned?.includes(ctx.dimension) ? "ja_tem_kit_da_dimensao" : null;
const emMentoria: Supressao = (p) => (p.mentoring_purchased ? "cliente_mentoria" : null);
const todas =
  (...regras: Supressao[]): Supressao =>
  (p, ctx, extra) => {
    for (const r of regras) {
      const motivo = r(p, ctx, extra);
      if (motivo) return motivo;
    }
    return null;
  };

export interface Automacao {
  id: string;
  versao: string;
  /** Precisa de aceite de marketing para as etapas de prioridade >= 4. */
  etapas: Etapa[];
  /** Escopo da dedupe: "lead" ou uma chave do contexto (map_result_id, transaction_id, periodo...). */
  escopo: string;
  /**
   * Recuperação de algo que a própria pessoa iniciou (checkout abandonado):
   * envia sem aceite de marketing, mas respeita descadastro. Decisão a
   * validar com o jurídico (base legal de legítimo interesse).
   */
  interesseLegitimo?: boolean;
}

export const AUTOMACOES: Record<string, Automacao> = {
  // AUT_MAP_RESULT_DELIVERY: entrega o resultado que a pessoa PEDIU (transacional).
  AUT_MAP_RESULT_DELIVERY: {
    id: "AUT_MAP_RESULT_DELIVERY", versao: "1.0", escopo: "map_result_id",
    etapas: [{ step: "D0", horas: 0, template: "map_result", prioridade: 1 }],
  },
  // AUT_MAP_NURTURE: D1, D3, D5, D7 (o D0 é a entrega acima). Sai em qualquer compra.
  AUT_MAP_NURTURE: {
    id: "AUT_MAP_NURTURE", versao: "1.0", escopo: "map_result_id",
    etapas: [
      { step: "D1", horas: 24, template: "nurture_reconhecimento", prioridade: 4, suprimir: jaComprouAlgo },
      { step: "D3", horas: 72, template: "nurture_mecanismo", prioridade: 4, suprimir: jaComprouAlgo },
      { step: "D5", horas: 120, template: "nurture_ferramenta", prioridade: 4, suprimir: todas(jaComprouProtocolo, jaTemKitDaDimensao) },
      { step: "D7", horas: 168, template: "nurture_integracao", prioridade: 4, suprimir: jaComprouProtocolo },
    ],
  },
  // AUT_MAP_ABANDON_IDENTIFIED: 1 lembrete 24h depois, só se o Mapa continua aberto.
  AUT_MAP_ABANDON_IDENTIFIED: {
    id: "AUT_MAP_ABANDON_IDENTIFIED", versao: "1.0", escopo: "map_result_id",
    etapas: [{
      step: "T24h", horas: 24, template: "map_abandon", prioridade: 4,
      suprimir: (_p, _c, x) => (x.mapaAberto ? null : "mapa_concluido"),
    }],
  },
  // AUT_PLAN_PURCHASE: entrega + acompanhamento de 7 dias + CTA Kit no D7.
  AUT_PLAN_PURCHASE: {
    id: "AUT_PLAN_PURCHASE", versao: "1.0", escopo: "transaction_id",
    etapas: [
      { step: "D0", horas: 0, template: "plan_delivery", prioridade: 2 },
      { step: "D2", horas: 48, template: "plan_d2", prioridade: 3 },
      { step: "D4", horas: 96, template: "plan_d4", prioridade: 3 },
      { step: "D7", horas: 168, template: "plan_d7", prioridade: 3 },
    ],
  },
  // AUT_KIT_PURCHASE
  AUT_KIT_PURCHASE: {
    id: "AUT_KIT_PURCHASE", versao: "1.0", escopo: "transaction_id",
    etapas: [
      { step: "D0", horas: 0, template: "kit_delivery", prioridade: 2 },
      { step: "D2", horas: 48, template: "kit_d2", prioridade: 3 },
      { step: "D5", horas: 120, template: "kit_d5", prioridade: 3 },
      { step: "D9", horas: 216, template: "kit_d9", prioridade: 3 },
      { step: "D14", horas: 336, template: "kit_d14", prioridade: 4, suprimir: jaComprouProtocolo },
    ],
  },
  // AUT_PROTOCOL_PURCHASE
  AUT_PROTOCOL_PURCHASE: {
    id: "AUT_PROTOCOL_PURCHASE", versao: "1.0", escopo: "transaction_id",
    etapas: [
      { step: "D0", horas: 0, template: "protocol_welcome", prioridade: 2 },
      { step: "D1", horas: 24, template: "protocol_d1", prioridade: 3 },
      { step: "D4", horas: 96, template: "protocol_d4", prioridade: 3 },
      { step: "D10", horas: 240, template: "protocol_d10", prioridade: 3 },
      { step: "D21", horas: 504, template: "protocol_d21", prioridade: 3 },
      { step: "D30", horas: 720, template: "protocol_d30", prioridade: 4, suprimir: emMentoria },
    ],
  },
  // AUT_MENTORING_INTEREST / WAITLIST / PURCHASE
  AUT_MENTORING_INTEREST: {
    id: "AUT_MENTORING_INTEREST", versao: "1.0", escopo: "lead",
    etapas: [{ step: "D0", horas: 0, template: "mentoring_interest", prioridade: 1 }],
  },
  AUT_MENTORING_WAITLIST: {
    id: "AUT_MENTORING_WAITLIST", versao: "1.0", escopo: "lead",
    etapas: [{ step: "D0", horas: 0, template: "mentoring_waitlist", prioridade: 1 }],
  },
  AUT_MENTORING_PURCHASE: {
    id: "AUT_MENTORING_PURCHASE", versao: "1.0", escopo: "transaction_id",
    etapas: [{ step: "D0", horas: 0, template: "mentoring_welcome", prioridade: 2 }],
  },
  // AUT_CHECKOUT_ABANDON: T+1h, T+24h, T+72h. Sai na compra.
  AUT_CHECKOUT_ABANDON: {
    id: "AUT_CHECKOUT_ABANDON", versao: "1.0", escopo: "transaction_id", interesseLegitimo: true,
    etapas: [
      { step: "T1h", horas: 1, template: "checkout_t1h", prioridade: 4, suprimir: (_p, _c, x) => (x.compraFeita ? "comprou" : null) },
      { step: "T24h", horas: 24, template: "checkout_t24h", prioridade: 4, suprimir: (_p, _c, x) => (x.compraFeita ? "comprou" : null) },
      { step: "T72h", horas: 72, template: "checkout_t72h", prioridade: 4, suprimir: (_p, _c, x) => (x.compraFeita ? "comprou" : null) },
    ],
  },
  // AUT_INACTIVE_30D
  AUT_INACTIVE_30D: {
    id: "AUT_INACTIVE_30D", versao: "1.0", escopo: "periodo",
    etapas: [
      { step: "E1", horas: 0, template: "inactive_1", prioridade: 4 },
      { step: "E2", horas: 96, template: "inactive_2", prioridade: 4 },
      { step: "E3", horas: 192, template: "inactive_3", prioridade: 4 },
    ],
  },
  // AUT_CROSS_DIMENSION: convite de exploração (conteúdo, não venda) para a
  // dimensão relacionada prevista no próprio Mapa. Depois da nutrição (D9).
  AUT_CROSS_DIMENSION: {
    id: "AUT_CROSS_DIMENSION", versao: "1.0", escopo: "map_result_id",
    etapas: [{
      step: "D9", horas: 216, template: "cross_dimension", prioridade: 4,
      suprimir: todas(emMentoria, (_p, _c, x) => (x.relacionadaFeita ? "ja_explorou_relacionada" : null)),
    }],
  },
  // Plano comprado antes do Mapa: avisa quando ficou pronto.
  AUT_PLAN_READY: {
    id: "AUT_PLAN_READY", versao: "1.0", escopo: "transaction_id",
    etapas: [{ step: "D0", horas: 0, template: "plan_ready", prioridade: 2 }],
  },
  // Edição da newsletter editorial enviada pelo admin (Funis §44, prioridade 5).
  // Agendada em lote por SQL em enviarNewsletter (actions.ts), não por agendarAutomacao.
  AUT_NEWSLETTER_EDITION: {
    id: "AUT_NEWSLETTER_EDITION", versao: "1.0", escopo: "content_id",
    etapas: [{ step: "E", horas: 0, template: "newsletter_edition", prioridade: 5 }],
  },
  AUT_NEWSLETTER_WELCOME: {
    id: "AUT_NEWSLETTER_WELCOME", versao: "1.0", escopo: "lead",
    etapas: [{ step: "D0", horas: 0, template: "newsletter_welcome", prioridade: 2 }],
  },
};

/**
 * Conexões prioritárias de cross-dimension (Matriz §13, "exemplos
 * prioritários"). Vêm antes das conexões listadas em cada Mapa. O Mapa de
 * Energia não tem seção de conexões no documento: a Matriz supre com Ação.
 */
export const CROSS_PRIORITARIO: Partial<Record<DimensionId, DimensionId[]>> = {
  coragem: ["acao"],
  autoconhecimento: ["planejamento"],
  energia: ["acao"],
  excelencia: ["energia"],
  amor: ["autoconhecimento", "felicidade"],
};

/** Dimensões para onde um Mapa pode levar, na ordem de prioridade. */
export function conexoesDe(mapa: DimensionId, relacionadasDoMapa: DimensionId[]): DimensionId[] {
  return [...new Set([...(CROSS_PRIORITARIO[mapa] ?? []), ...relacionadasDoMapa])].filter((d) => d !== mapa);
}

/** Saídas (Matriz): quais automações uma compra encerra. */
export const ENCERRA_NA_COMPRA: Record<string, string[]> = {
  plan: ["AUT_MAP_NURTURE", "AUT_CHECKOUT_ABANDON"],
  kit: ["AUT_MAP_NURTURE", "AUT_CHECKOUT_ABANDON"],
  protocol: ["AUT_MAP_NURTURE", "AUT_CHECKOUT_ABANDON", "AUT_INACTIVE_30D"],
  mentoring: ["AUT_MAP_NURTURE", "AUT_CHECKOUT_ABANDON", "AUT_INACTIVE_30D", "AUT_KIT_PURCHASE", "AUT_PLAN_PURCHASE"],
};

function chaveEscopo(a: Automacao, lead: string, ctx: Contexto): string {
  const v = a.escopo === "lead" ? lead : (ctx[a.escopo] as string | undefined);
  if (!v) throw new Error(`${a.id}: contexto sem ${a.escopo}`);
  return `${lead}:${v}`;
}

/** Agenda todas as etapas. Reagendar a mesma automação no mesmo escopo não duplica. */
export async function agendarAutomacao(q: Q, leadId: string, id: keyof typeof AUTOMACOES | string, ctx: Contexto) {
  const a = AUTOMACOES[id];
  if (!a) throw new Error(`Automação desconhecida: ${id}`);
  const escopo = chaveEscopo(a, leadId, ctx);
  for (const e of a.etapas) {
    await q(
      `insert into messages (lead_id, automation_id, automation_version, step, template_key,
         priority, scheduled_for, context, dedupe_key)
       values ($1,$2,$3,$4,$5,$6, now() + make_interval(hours => $7), $8, $9)
       on conflict (dedupe_key) do nothing`,
      [leadId, a.id, a.versao, e.step, e.template, e.prioridade, e.horas, JSON.stringify(ctx),
        `${a.id}:${e.step}:${escopo}`]
    );
  }
}

/** Cancela etapas ainda não enviadas (saída por compra, descadastro etc.). */
export async function cancelarAutomacoes(q: Q, leadId: string, ids: string[], motivo: string) {
  if (!ids.length) return;
  await q(
    `update messages set status = 'cancelled', skip_reason = $3
     where lead_id = $1 and status = 'scheduled' and automation_id = any($2)`,
    [leadId, ids, motivo]
  );
}

export function etapaDe(automationId: string, step: string): Etapa | undefined {
  return AUTOMACOES[automationId]?.etapas.find((e) => e.step === step);
}
