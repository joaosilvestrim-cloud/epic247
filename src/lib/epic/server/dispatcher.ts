import "server-only";
import { createHash } from "node:crypto";
import { DIMENSIONS, isDimensionId, mapPath, type DimensionId } from "../dimensions";
import { renderEmail, renderTexto, SITE_URL } from "../emails/layout";
import { TEMPLATES, type DadosEmail } from "../emails/templates";
import { FRICCAO, getDimensionalMap } from "../maps";
import type { DimensionalResult, FrictionResult } from "../maps/types";
import { CONTEUDO_PLANO } from "../plano/conteudo";
import { assinar } from "./assinatura";
import { mapaVisivel } from "../site";
import { AUTOMACOES, etapaDe, type Contexto, type PerfilLead } from "./automations";
import { withTx, type Q } from "./db";
import { registrarEvento, type EventoNome } from "./events";
import { recomporResultado, resultadoPorToken, type ResultadoSalvo } from "./mapas";
import { enviarEmail } from "./resend";

// Disparador da fila de mensagens. Cada mensagem vencida é avaliada com o
// estado ATUAL do lead (supressão, consentimento, frequência) e só então
// renderizada e enviada. Uma transação por mensagem, com lock que pula linhas
// já pegas por outra execução (dois disparos simultâneos não duplicam).

const IS_PROD = process.env.NEXT_PUBLIC_EPIC_ENV === "production";

interface Mensagem {
  message_id: string;
  lead_id: string;
  automation_id: string;
  step: string;
  template_key: string;
  priority: number;
  context: Contexto;
  created_at: string;
  postponed_count: number;
}

export interface Relatorio {
  avaliadas: number;
  enviadas: number;
  simuladas: number;
  puladas: Record<string, number>;
  adiadas: number;
  falhas: number;
}

/** Envio de um modelo que comprova a execução de uma etapa (Modelo de Dados §17). */
const EVENTO_DE_ENVIO: Record<string, EventoNome> = {
  map_result: "ResultEmailSent",
  plan_delivery: "PlanDelivered",
  plan_ready: "PlanDelivered",
  kit_delivery: "KitDelivered",
  protocol_welcome: "ProtocolActivated",
};

/** UUID estável a partir de uma chave: o mesmo envio nunca gera dois eventos. */
function eventoDeterministico(chave: string): string {
  const h = createHash("sha256").update(chave).digest("hex");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-4${h.slice(13, 16)}-8${h.slice(17, 20)}-${h.slice(20, 32)}`;
}

export function urlDescadastro(leadId: string) {
  return `${SITE_URL}/descadastro?l=${leadId}&t=${assinar(leadId, "descadastro")}`;
}

async function perfil(q: Q, lead: string): Promise<PerfilLead | null> {
  const [p] = await q<PerfilLead>(
    `select lead_id, email, first_name, lifecycle_stage, marketing_email_allowed, unsubscribed_at,
            plan_purchased, kit_purchased, protocol_purchased, mentoring_purchased, kits_owned,
            (select l.email_bounced_at from leads l where l.lead_id = lead_profile.lead_id) as email_bounced_at
     from lead_profile where lead_id = $1`,
    [lead]
  );
  return p ?? null;
}

async function produtoVendavelUrl(q: Q, id: string, pagina: string): Promise<string | null> {
  const [p] = await q<{ ok: boolean }>(
    "select (active and checkout_url is not null) as ok from products where product_id = $1", [id]
  );
  return p?.ok || !IS_PROD ? `${SITE_URL}${pagina}` : null;
}

/** Monta os dados de um e-mail a partir do contexto e do estado atual. */
async function montarDados(q: Q, m: Mensagem, p: PerfilLead): Promise<DadosEmail> {
  const ctx = m.context;
  const dim = typeof ctx.dimension === "string" && isDimensionId(ctx.dimension) ? (ctx.dimension as DimensionId) : null;
  const d: DadosEmail = {
    nome: p.first_name,
    dimensaoNome: dim ? DIMENSIONS[dim].name : undefined,
    protocoloUrl: `${SITE_URL}/protocolo`,
    mentoriaUrl: `${SITE_URL}/mentoria`,
    mapaFriccaoUrl: `${SITE_URL}/mapa`,
    ideiasUrl: `${SITE_URL}/ideias`,
    mapaUrl: dim ? `${SITE_URL}${mapPath(dim)}` : undefined,
  };

  // Resultado do Mapa (entrega e nutrição).
  const token = typeof ctx.token === "string" ? ctx.token : null;
  let salvo: ResultadoSalvo | null = null;
  if (token) salvo = await resultadoPorToken(q, token);
  else if (typeof ctx.map_result_id === "string") {
    const [r] = await q<{ result_token: string | null }>(
      "select result_token from map_results where map_result_id = $1", [ctx.map_result_id]
    );
    if (r?.result_token) salvo = await resultadoPorToken(q, r.result_token);
  }
  if (salvo) {
    const r = recomporResultado(salvo);
    if (salvo.map_type === "friccao") {
      const f = r as FrictionResult;
      const copy = FRICCAO.results[f.primary];
      d.dimensaoNome = DIMENSIONS[f.primary].name;
      d.mapaUrl = `${SITE_URL}${mapPath(f.primary)}`;
      d.mapa = {
        nome: "Mapa de Fricção", titulo: copy.title, interpretacao: copy.interpretation,
        primeiroMovimento: copy.firstMove, friccao: true,
        resultadoUrl: `${SITE_URL}/mapa/resultado/${salvo.result_token ?? token}`,
      };
    } else {
      const cfg = getDimensionalMap(salvo.map_type);
      const dr = r as DimensionalResult;
      const perfilMapa = cfg.profiles[dr.primary];
      const rot = (k: string) => cfg.axes.find((a) => a.key === k)?.label ?? k;
      d.mapa = {
        nome: cfg.title, titulo: perfilMapa.title, interpretacao: perfilMapa.interpretation,
        primeiroMovimento: perfilMapa.firstMove, reconhecimento: perfilMapa.recognition,
        padraoNome: rot(dr.primary), nomeEditorial: perfilMapa.editorialName ?? null,
        secundarioNome: rot(dr.secondary), friccao: false, fechamento: cfg.closingPhrase,
        resultadoUrl: `${SITE_URL}/mapas/${salvo.map_type}/resultado/${salvo.result_token ?? token}`,
        ferramenta: CONTEUDO_PLANO[salvo.map_type][dr.primary]?.movimentos?.[0] ?? null,
        relacionadas: cfg.related.map((x) => ({
          nome: DIMENSIONS[x.dimension].name, quando: x.when, url: `${SITE_URL}/dimensoes/${x.dimension}`,
        })),
      };
    }
  }

  // Ofertas, já com supressão pelo estado atual.
  if (dim) {
    const temKit = p.kits_owned?.includes(dim);
    if (!p.protocol_purchased && !temKit && !p.plan_purchased)
      d.planoOfertaUrl = await produtoVendavelUrl(q, `plan_${dim}`, `/plano/${dim}${token ? `?r=${token}` : ""}`);
    if (!p.protocol_purchased && !temKit) d.kitUrl = await produtoVendavelUrl(q, `kit_${dim}`, `/kit/${dim}`);
  }
  // Cross-dimension: a conexão vem do próprio Mapa de origem (campo related).
  if (typeof ctx.related === "string" && isDimensionId(ctx.related) && dim) {
    const rel = getDimensionalMap(dim).related.find((x) => x.dimension === ctx.related);
    const alvo = ctx.related as DimensionId;
    d.cruzada = {
      nome: DIMENSIONS[alvo].name,
      quando: rel?.when ?? "",
      temMapa: mapaVisivel(alvo),
      url: `${SITE_URL}${mapaVisivel(alvo) ? mapPath(alvo) : `/dimensoes/${alvo}`}`,
    };
  }
  if (typeof ctx.content_id === "string") {
    const [c] = await q<{ title: string; excerpt: string | null; body: string | null; slug: string; content_type: string }>(
      "select title, excerpt, body, slug, content_type from content_items where id = $1 and status = 'published'",
      [ctx.content_id]
    );
    if (c) {
      const rota = c.content_type === "artigo" ? "artigos" : c.content_type === "video" ? "videos" : c.content_type;
      d.edicao = { titulo: c.title, resumo: c.excerpt, corpo: c.body, url: `${SITE_URL}/ideias/${rota}/${c.slug}` };
    }
  }
  if (typeof ctx.plan_token === "string") {
    d.planoUrl = `${SITE_URL}/plano/acesso/${ctx.plan_token}`;
    d.planoPronto = ctx.plan_ready !== false;
  }
  if (typeof ctx.product_id === "string") {
    const [prod] = await q<{ product_name: string; product_type: string; product_dimension: string | null }>(
      "select product_name, product_type, product_dimension from products where product_id = $1", [ctx.product_id]
    );
    if (prod) {
      d.produtoNome = prod.product_name;
      const pagina = prod.product_type === "plan" ? `/plano/${prod.product_dimension}`
        : prod.product_type === "kit" ? `/kit/${prod.product_dimension}`
        : `/${prod.product_type === "protocol" ? "protocolo" : "mentoria"}`;
      d.checkoutUrl = typeof ctx.checkout_link === "string" ? ctx.checkout_link : `${SITE_URL}${pagina}`;
    }
  }
  return d;
}

type Decisao = { acao: "enviar" } | { acao: "pular"; motivo: string } | { acao: "adiar" };

async function decidir(q: Q, m: Mensagem, p: PerfilLead | null): Promise<Decisao> {
  if (!p) return { acao: "pular", motivo: "lead_inexistente" };
  if (!p.email) return { acao: "pular", motivo: "sem_email" };
  if (p.email_bounced_at) return { acao: "pular", motivo: "email_invalido" };
  const etapa = etapaDe(m.automation_id, m.step);
  if (!etapa) return { acao: "pular", motivo: "etapa_desconhecida" };
  const automacao = AUTOMACOES[m.automation_id];

  // Consentimento: transacional sempre; comportamental/promocional só com aceite.
  if (m.priority >= 4) {
    if (p.unsubscribed_at) return { acao: "pular", motivo: "descadastrado" };
    if (!automacao.interesseLegitimo && !p.marketing_email_allowed) return { acao: "pular", motivo: "sem_aceite_marketing" };
  }

  // Supressão da etapa com o estado atual.
  const extra: { mapaAberto?: boolean; compraFeita?: boolean; relacionadaFeita?: boolean } = {};
  if (typeof m.context.related === "string") {
    const [feito] = await q(
      `select 1 from map_results where map_type = $2 and status = 'completed'
         and lead_id in (select lead_id from leads where lead_id = $1 or merged_into = $1)`,
      [m.lead_id, m.context.related]
    );
    extra.relacionadaFeita = Boolean(feito);
  }
  if (typeof m.context.map_result_id === "string") {
    const [mr] = await q<{ status: string }>("select status from map_results where map_result_id = $1", [m.context.map_result_id]);
    extra.mapaAberto = mr?.status === "in_progress";
  }
  if (typeof m.context.product_id === "string") {
    const [t] = await q(
      `select 1 from transactions where lead_id = $1 and product_id = $2 and transaction_status = 'approved'
         and created_at >= $3::timestamptz - interval '1 day'`,
      [m.lead_id, m.context.product_id, m.created_at]
    );
    extra.compraFeita = Boolean(t);
  }
  const motivo = etapa.suprimir?.(p, m.context, extra);
  if (motivo) return { acao: "pular", motivo };

  // Frequência: no máximo 1 não transacional por dia (Modelo de Dados §25).
  // Quem continua inativo depois da reativação recebe no máximo 1 por semana
  // (Matriz AUT_INACTIVE_30D: "após ausência de reação, reduzir frequência").
  if (m.priority >= 4) {
    const [ina] = await q<{ reduzir: boolean }>(
      `select l.inactive_flag and exists (
         select 1 from messages x where x.lead_id = l.lead_id and x.automation_id = 'AUT_INACTIVE_30D'
           and x.step = 'E3' and x.status = 'sent') as reduzir
       from leads l where l.lead_id = $1`,
      [m.lead_id]
    );
    const janela = ina?.reduzir && m.automation_id !== "AUT_INACTIVE_30D" ? "7 days" : "20 hours";
    const [recente] = await q(
      `select 1 from messages where lead_id = $1 and status = 'sent' and priority >= 4
         and sent_at > now() - $2::interval`,
      [m.lead_id, janela]
    );
    if (recente) return m.postponed_count >= 2 ? { acao: "pular", motivo: "frequencia" } : { acao: "adiar" };
  }
  return { acao: "enviar" };
}

async function processarUma(rel: Relatorio): Promise<boolean> {
  return withTx(async (q) => {
    const [m] = await q<Mensagem>(
      `select message_id, lead_id, automation_id, step, template_key, priority, context, created_at, postponed_count
       from messages where status = 'scheduled' and scheduled_for <= now()
       order by priority, scheduled_for limit 1 for update skip locked`
    );
    if (!m) return false;
    rel.avaliadas++;
    const p = await perfil(q, m.lead_id);
    const dec = await decidir(q, m, p);

    if (dec.acao === "pular") {
      await q("update messages set status = 'skipped', skip_reason = $2 where message_id = $1", [m.message_id, dec.motivo]);
      rel.puladas[dec.motivo] = (rel.puladas[dec.motivo] ?? 0) + 1;
      return true;
    }
    if (dec.acao === "adiar") {
      await q(
        `update messages set scheduled_for = now() + interval '24 hours', postponed_count = postponed_count + 1
         where message_id = $1`,
        [m.message_id]
      );
      rel.adiadas++;
      return true;
    }

    const tpl = TEMPLATES[m.template_key];
    if (!tpl) {
      await q("update messages set status = 'skipped', skip_reason = 'template_inexistente' where message_id = $1", [m.message_id]);
      rel.puladas.template_inexistente = (rel.puladas.template_inexistente ?? 0) + 1;
      return true;
    }
    const dados = await montarDados(q, m, p!);
    let email;
    try {
      email = tpl(dados);
    } catch {
      await q("update messages set status = 'skipped', skip_reason = 'dados_incompletos' where message_id = $1", [m.message_id]);
      rel.puladas.dados_incompletos = (rel.puladas.dados_incompletos ?? 0) + 1;
      return true;
    }
    // RF-095: rascunho de marketing não sai em produção.
    if (IS_PROD && !email.aprovado && m.priority >= 3) {
      await q("update messages set status = 'skipped', skip_reason = 'copy_pendente' where message_id = $1", [m.message_id]);
      rel.puladas.copy_pendente = (rel.puladas.copy_pendente ?? 0) + 1;
      return true;
    }

    const descadastro = m.priority >= 3 ? urlDescadastro(m.lead_id) : null;
    const motivo =
      m.priority <= 2
        ? "Você recebeu este e-mail porque pediu ou comprou algo no EPIC247."
        : "Você recebeu este e-mail porque se cadastrou no EPIC247.";
    try {
      const r = await enviarEmail({
        para: p!.email!,
        assunto: email.assunto,
        html: renderEmail({ preheader: email.preheader, blocos: email.blocos, descadastroUrl: descadastro, motivo }),
        texto: renderTexto(email.blocos, descadastro),
        descadastroUrl: descadastro,
        tag: m.automation_id,
      });
      await q(
        `update messages set status = 'sent', sent_at = now(), provider_message_id = $2, subject = $3,
           delivery_mode = $4, error = null where message_id = $1`,
        [m.message_id, r.id, email.assunto, r.modo]
      );
      // Evento de execução de cada automação (Matriz de Automações, "evento de execução").
      const execucao = EVENTO_DE_ENVIO[m.template_key];
      if (execucao) {
        await registrarEvento(q, execucao, {
          event_id: eventoDeterministico(`${execucao}:${m.message_id}`),
          lead_id: m.lead_id,
          product_id: typeof m.context.product_id === "string" ? m.context.product_id : null,
          transaction_id: typeof m.context.transaction_id === "string" ? m.context.transaction_id : null,
          dimension: typeof m.context.dimension === "string" ? m.context.dimension : null,
          map_type: typeof m.context.map_type === "string" ? m.context.map_type : null,
          props: { modo: r.modo, message_id: m.message_id },
        });
      }
      if (r.modo === "live") rel.enviadas++;
      else rel.simuladas++;
    } catch (e) {
      // Falha do provedor: registra e não trava a fila (RF-079).
      await q("update messages set status = 'failed', error = $2 where message_id = $1", [
        m.message_id, (e instanceof Error ? e.message : String(e)).slice(0, 300),
      ]);
      rel.falhas++;
    }
    return true;
  });
}

/**
 * Renderiza uma mensagem da fila sem enviar (pré-visualização no admin).
 * Usa o estado atual do lead, como o disparo faria agora.
 */
export async function previsualizar(messageId: string): Promise<
  { assunto: string; html: string; aprovado: boolean; decisao: string } | { erro: string }
> {
  return withTx(async (q) => {
    const [m] = await q<Mensagem>(
      `select message_id, lead_id, automation_id, step, template_key, priority, context, created_at, postponed_count
       from messages where message_id = $1`,
      [messageId]
    );
    if (!m) return { erro: "Mensagem não encontrada." };
    const p = await perfil(q, m.lead_id);
    if (!p) return { erro: "Lead não encontrado (anonimizado ou mesclado)." };
    const tpl = TEMPLATES[m.template_key];
    if (!tpl) return { erro: `Modelo ${m.template_key} não existe.` };
    const dec = await decidir(q, m, p);
    let email;
    try {
      email = tpl(await montarDados(q, m, p));
    } catch {
      return { erro: "Dados incompletos para montar este e-mail." };
    }
    const descadastro = m.priority >= 3 ? urlDescadastro(m.lead_id) : null;
    return {
      assunto: email.assunto,
      aprovado: email.aprovado,
      decisao: dec.acao === "pular" ? `seria pulada: ${dec.motivo}` : dec.acao === "adiar" ? "seria adiada (frequência)" : "seria enviada",
      html: renderEmail({ preheader: email.preheader, blocos: email.blocos, descadastroUrl: descadastro, motivo: "Pré-visualização do admin." }),
    };
  });
}

/** Processa até `limite` mensagens vencidas. */
export async function dispararFila(limite = 40): Promise<Relatorio> {
  const rel: Relatorio = { avaliadas: 0, enviadas: 0, simuladas: 0, puladas: {}, adiadas: 0, falhas: 0 };
  for (let i = 0; i < limite; i++) {
    const houve = await processarUma(rel);
    if (!houve) break;
  }
  return rel;
}

/** Diário: agenda reativação para quem está 30 dias sem atividade (AUT_INACTIVE_30D). */
export async function agendarInativos(): Promise<number> {
  return withTx(async (q) => {
    const periodo = new Date().toISOString().slice(0, 7);
    const leads = await q<{ lead_id: string }>(
      `update leads set inactive_flag = true, inactive_since = coalesce(inactive_since, now())
       where merged_into is null and email is not null and marketing_email_allowed and unsubscribed_at is null
         and last_activity_at < now() - interval '30 days' and not inactive_flag
       returning lead_id`
    );
    const { agendarAutomacao } = await import("./automations");
    for (const l of leads) await agendarAutomacao(q, l.lead_id, "AUT_INACTIVE_30D", { periodo });
    return leads.length;
  });
}
