import "server-only";
import { randomBytes } from "node:crypto";
import { isDimensionId, type DimensionId } from "../dimensions";
import { MapAnswerError, scoreDimensional, scoreFriction } from "../maps/engine";
import { FRICCAO, getDimensionalMap } from "../maps";
import type { DimensionalResult, FrictionResult, MapType } from "../maps/types";
import { agendarAutomacao } from "./automations";
import { registrarConsentimento } from "./consent";
import type { Q } from "./db";
import { registrarEvento } from "./events";
import { garantirLead, identificar, leadAtual, sessaoAtual, type Atribuicao } from "./identity";
import { gerarPlanosPendentes } from "./planos";

export function ehMapType(v: unknown): v is MapType {
  return v === "friccao" || isDimensionId(v);
}

const versoes = (t: MapType) =>
  t === "friccao"
    ? { map: FRICCAO.mapVersion, scoring: FRICCAO.scoringVersion, copy: FRICCAO.resultCopyVersion }
    : (() => {
        const c = getDimensionalMap(t);
        return { map: c.mapVersion, scoring: c.scoringVersion, copy: c.resultCopyVersion };
      })();

export interface MapaEmAndamento {
  map_result_id: string;
  answers: Record<string, unknown>;
  step: number;
  retomado: boolean;
  event_id: string;
}

/**
 * Inicia o Mapa ou retoma o que ficou aberto (RF-012/013). Uma tentativa em
 * andamento do mesmo Mapa nos últimos 7 dias é reaproveitada.
 */
export async function iniciarMapa(
  q: Q,
  tipo: MapType,
  utm: Record<string, string | null>,
  toque: Atribuicao | null = null
): Promise<MapaEmAndamento> {
  // O toque garante first-touch certo mesmo se o Mapa iniciar antes da sessão.
  const lead = await garantirLead(q, toque);
  const sessao = await sessaoAtual();

  const [aberto] = await q<{ map_result_id: string; answers_json: Record<string, unknown>; current_step: number }>(
    `select map_result_id, answers_json, current_step from map_results
     where lead_id = $1 and map_type = $2 and status = 'in_progress'
       and started_at > now() - interval '7 days'
     order by started_at desc limit 1`,
    [lead, tipo]
  );
  if (aberto && Object.keys(aberto.answers_json ?? {}).length > 0) {
    const event_id = await registrarEvento(q, "ResumeMap", { lead_id: lead, session_id: sessao, map_type: tipo });
    return { map_result_id: aberto.map_result_id, answers: aberto.answers_json, step: aberto.current_step, retomado: true, event_id };
  }

  const v = versoes(tipo);
  const [novo] = await q<{ map_result_id: string }>(
    `insert into map_results (lead_id, session_id, map_type, map_version, scoring_version, result_copy_version,
       utm_source, utm_medium, utm_campaign, utm_content)
     select $1, $2, $3, $4, $5, $6, l.last_touch_source, l.last_touch_medium, l.last_touch_campaign, l.last_touch_content
     from leads l where l.lead_id = $1
     returning map_result_id`,
    [lead, sessao, tipo, v.map, v.scoring, v.copy]
  );
  await q("select promote_lifecycle($1, 'map_started')", [lead]);
  const event_id = await registrarEvento(q, "StartMap", {
    lead_id: lead, session_id: sessao, map_type: tipo,
    dimension: tipo === "friccao" ? null : tipo,
    utm_source: utm.utm_source ?? null, utm_medium: utm.utm_medium ?? null,
  });

  // Lembrete de abandono só para quem já é conhecido (AUT_MAP_ABANDON_IDENTIFIED).
  const [conhecido] = await q<{ email: string | null; marketing_email_allowed: boolean }>(
    "select email, marketing_email_allowed from leads where lead_id = $1", [lead]
  );
  if (conhecido?.email && conhecido.marketing_email_allowed) {
    await agendarAutomacao(q, lead, "AUT_MAP_ABANDON_IDENTIFIED", {
      map_result_id: novo.map_result_id, map_type: tipo,
      dimension: tipo === "friccao" ? undefined : tipo,
    });
  }
  return { map_result_id: novo.map_result_id, answers: {}, step: 0, retomado: false, event_id };
}

async function mapaDoLead(q: Q, id: string) {
  const lead = await leadAtual(q);
  if (!lead) return null;
  const [row] = await q<{ map_result_id: string; map_type: MapType; status: string; lead_id: string }>(
    "select map_result_id, map_type, status, lead_id from map_results where map_result_id = $1 and lead_id = $2",
    [id, lead]
  );
  return row ?? null;
}

/** Salva respostas parciais. Só o dono do Mapa (cookie) consegue gravar. */
export async function salvarProgresso(q: Q, id: string, respostas: Record<string, unknown>, passo: number) {
  const m = await mapaDoLead(q, id);
  if (!m || m.status !== "in_progress") return false;
  await q(
    `update map_results set answers_json = $2, current_step = greatest(current_step, $3) where map_result_id = $1`,
    [id, JSON.stringify(respostas), passo]
  );
  return true;
}

const novoToken = () => randomBytes(24).toString("base64url");

export interface Conclusao {
  token: string;
  map_type: MapType;
  event_id: string;
  primary: string;
}

/** Conclui: o servidor recalcula o resultado a partir das respostas. */
export async function concluirMapa(q: Q, id: string, respostasBrutas: Record<string, unknown>): Promise<Conclusao> {
  const m = await mapaDoLead(q, id);
  if (!m) throw new MapAnswerError("Mapa não encontrado.");

  // Já concluído (duplo clique, refresh): devolve o mesmo resultado.
  if (m.status === "completed") {
    const [r] = await q<{ result_token: string; primary_pattern: string | null; primary_dimension: string | null }>(
      "select result_token, primary_pattern, primary_dimension from map_results where map_result_id = $1", [id]
    );
    return { token: r.result_token, map_type: m.map_type, event_id: "", primary: r.primary_pattern ?? r.primary_dimension ?? "" };
  }

  const token = novoToken();
  let dim: string;
  let sec: string | null;
  let padraoP: string | null = null;
  let padraoS: string | null = null;
  let resultado: DimensionalResult | FrictionResult;

  if (m.map_type === "friccao") {
    const respostas: Record<number, string> = {};
    for (const [k, v] of Object.entries(respostasBrutas)) if (typeof v === "string") respostas[Number(k)] = v;
    const r = scoreFriction(FRICCAO, respostas);
    resultado = r;
    dim = r.primary;
    sec = r.secondary;
    await q(
      `update map_results set status = 'completed', completed_at = now(), answers_json = $2,
         primary_dimension = $3, secondary_dimension = $4, result_kind = $5, scores = $6, result_token = $7,
         current_step = $8
       where map_result_id = $1`,
      [id, JSON.stringify(respostas), r.primary, r.secondary, r.kind, JSON.stringify(r.scores), token, FRICCAO.questions.length]
    );
  } else {
    const cfg = getDimensionalMap(m.map_type);
    const respostas: Record<string, number> = {};
    for (const [k, v] of Object.entries(respostasBrutas)) if (typeof v === "number") respostas[k] = v;
    const r = scoreDimensional(cfg, respostas);
    resultado = r;
    dim = m.map_type;
    sec = null;
    padraoP = r.primary;
    padraoS = r.secondary;
    await q(
      `update map_results set status = 'completed', completed_at = now(), answers_json = $2,
         primary_dimension = $3, primary_pattern = $4, secondary_pattern = $5, result_kind = $6,
         result_band_primary = $7, scores = $8, result_token = $9, current_step = $10
       where map_result_id = $1`,
      [id, JSON.stringify(respostas), m.map_type, r.primary, r.secondary, r.kind, r.primaryBand,
        JSON.stringify(Object.fromEntries(r.axes.map((a) => [a.key, a.score]))), token, cfg.questions.length]
    );
  }

  // Resumo no lead, sem apagar histórico (RF-022, RF-082).
  await q(
    `update leads set
       maps_completed_count = maps_completed_count + 1,
       first_map = coalesce(first_map, $2), last_map = $2,
       first_primary_dimension = coalesce(first_primary_dimension, $3),
       latest_primary_dimension = $3, latest_secondary_dimension = $4,
       last_primary_pattern = $5, last_secondary_pattern = $6, last_activity_at = now()
     where lead_id = $1`,
    [m.lead_id, m.map_type, dim, sec, padraoP, padraoS]
  );
  await q("select promote_lifecycle($1, 'map_completed')", [m.lead_id]);
  const event_id = await registrarEvento(q, "CompleteMap", {
    lead_id: m.lead_id, session_id: await sessaoAtual(), map_type: m.map_type,
    dimension: dim, primary_pattern: padraoP, secondary_pattern: padraoS,
    props: { result_kind: resultado.kind },
  });
  // Mapa concluído cancela o lembrete de abandono dele.
  await q(
    `update messages set status = 'cancelled', skip_reason = 'mapa_concluido'
     where lead_id = $1 and status = 'scheduled' and automation_id = 'AUT_MAP_ABANDON_IDENTIFIED'
       and context->>'map_result_id' = $2`,
    [m.lead_id, id]
  );
  // Plano comprado antes do Mapa (entrada não linear): gera agora e avisa.
  if (m.map_type !== "friccao") {
    const gerados = await gerarPlanosPendentes(q, m.lead_id, m.map_type, id);
    if (gerados > 0) {
      const prontos = await q<{ transaction_id: string; access_token: string }>(
        `select g.transaction_id, g.access_token from plan_generations g join products p using (product_id)
         where g.lead_id = $1 and p.product_dimension = $2 and g.map_result_id = $3`,
        [m.lead_id, m.map_type, id]
      );
      for (const g of prontos) {
        await agendarAutomacao(q, m.lead_id, "AUT_PLAN_READY", {
          transaction_id: g.transaction_id, plan_token: g.access_token, dimension: m.map_type,
        });
      }
    }
  }
  return { token, map_type: m.map_type, event_id, primary: padraoP ?? dim };
}

export interface ResultadoSalvo {
  map_result_id: string;
  lead_id: string;
  map_type: MapType;
  map_version: string;
  scores: Record<string, number>;
  primary_dimension: DimensionId | null;
  secondary_dimension: DimensionId | null;
  primary_pattern: string | null;
  secondary_pattern: string | null;
  result_kind: "single" | "close" | "tie" | "low";
  completed_at: string;
  answers_json: Record<string, unknown>;
}

/** Resultado revisitável pelo token (RF-021). Token nunca expõe respostas. */
export async function resultadoPorToken(q: Q, token: string): Promise<ResultadoSalvo | null> {
  if (!/^[A-Za-z0-9_-]{20,64}$/.test(token)) return null;
  const [r] = await q<ResultadoSalvo>(
    `select map_result_id, lead_id, map_type, map_version, scores, primary_dimension, secondary_dimension,
            primary_pattern, secondary_pattern, result_kind, completed_at, answers_json
     from map_results where result_token = $1 and status = 'completed'`,
    [token]
  );
  return r ?? null;
}

/** Recalcula o resultado completo (com faixas e empates) a partir do salvo. */
export function recomporResultado(r: ResultadoSalvo): DimensionalResult | FrictionResult {
  if (r.map_type === "friccao") {
    return scoreFriction(FRICCAO, r.answers_json as Record<number, string>);
  }
  return scoreDimensional(getDimensionalMap(r.map_type), r.answers_json as Record<string, number>);
}

/**
 * Captura pós-resultado (RF-016/017): associa e-mail, registra consentimento
 * separado e agenda a entrega do resultado (transacional) e, só com aceite
 * de marketing, a nutrição.
 */
export async function capturarResultado(
  q: Q,
  token: string,
  dados: { email: string; firstName: string | null; marketing: boolean }
) {
  const r = await resultadoPorToken(q, token);
  if (!r) throw new MapAnswerError("Resultado não encontrado.");
  // Quem captura é quem está no navegador (cookie). Se outra pessoa abriu um
  // link compartilhado, o e-mail vai para o lead DELA, nunca para o do dono.
  const anon = (await leadAtual(q)) ?? (await garantirLead(q, null));
  const lead = await identificar(q, anon, { email: dados.email, firstName: dados.firstName });
  await registrarConsentimento(q, lead, "map_result", dados.marketing);
  await q("select promote_lifecycle($1, 'identified_lead')", [lead]);
  const dimension = r.map_type === "friccao" ? r.primary_dimension : r.map_type;
  const event_id = await registrarEvento(q, "SubmitMapEmail", {
    lead_id: lead, session_id: await sessaoAtual(), map_type: r.map_type,
    dimension, primary_pattern: r.primary_pattern, secondary_pattern: r.secondary_pattern,
  });
  const ctx = {
    map_result_id: r.map_result_id, map_type: r.map_type, token,
    dimension: dimension ?? undefined,
  };
  await agendarAutomacao(q, lead, "AUT_MAP_RESULT_DELIVERY", ctx);
  if (dados.marketing && r.map_type !== "friccao") {
    await agendarAutomacao(q, lead, "AUT_MAP_NURTURE", ctx);
  }
  return { event_id, lead };
}

