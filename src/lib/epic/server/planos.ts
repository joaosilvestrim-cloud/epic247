import "server-only";
import { randomBytes } from "node:crypto";
import { isDimensionId, type DimensionId } from "../dimensions";
import { getDimensionalMap } from "../maps";
import { scoreDimensional } from "../maps/engine";
import { aplicarPrioridade, gerarPlano, PLAN_TEMPLATE_VERSION, type Plano } from "../plano/gerador";
import type { Q } from "./db";
import { eventIdDeTransacao } from "./checkout";
import { registrarEvento } from "./events";

// Geração e entrega do Plano EPIC 7 Dias (RF-029 a RF-031).
// O Plano é ligado a um Mapa concluído da mesma dimensão. Se a pessoa
// comprou sem ter feito o Mapa (entrada não linear, RF-037), o Plano fica
// pendente e é gerado sozinho assim que ela concluir o Mapa.

const novoToken = () => randomBytes(24).toString("base64url");

async function mapaParaPlano(q: Q, lead: string, dim: DimensionId, preferido: string | null) {
  if (preferido && /^[0-9a-f-]{36}$/i.test(preferido)) {
    const [m] = await q<{ map_result_id: string; answers_json: Record<string, number>; chosen_pattern: string | null }>(
      `select map_result_id, answers_json, chosen_pattern from map_results
       where map_result_id = $1 and lead_id = $2 and map_type = $3 and status = 'completed'`,
      [preferido, lead, dim]
    );
    if (m) return m;
  }
  const [ultimo] = await q<{ map_result_id: string; answers_json: Record<string, number>; chosen_pattern: string | null }>(
    `select map_result_id, answers_json, chosen_pattern from map_results
     where lead_id = $1 and map_type = $2 and status = 'completed'
     order by completed_at desc limit 1`,
    [lead, dim]
  );
  return ultimo ?? null;
}

/** Cria (ou reaproveita) o Plano de uma compra. Idempotente por transação. */
export async function prepararPlano(
  q: Q,
  ctx: { lead: string; dim: DimensionId; productId: string; provider: string; transacao: string; mapResultId: string | null }
): Promise<{ id: string; token: string | null; gerado: boolean }> {
  const [existente] = await q<{ plan_generation_id: string; access_token: string | null; processing_status: string }>(
    "select plan_generation_id, access_token, processing_status from plan_generations where provider = $1 and transaction_id = $2",
    [ctx.provider, ctx.transacao]
  );
  if (existente) {
    return { id: existente.plan_generation_id, token: existente.access_token, gerado: existente.processing_status === "generated" };
  }
  const mapa = await mapaParaPlano(q, ctx.lead, ctx.dim, ctx.mapResultId);
  const token = novoToken();
  if (!mapa) {
    const [row] = await q<{ plan_generation_id: string }>(
      `insert into plan_generations (lead_id, product_id, provider, transaction_id, input_version, access_token,
         processing_status, processing_error)
       values ($1,$2,$3,$4,$5,$6,'pending','sem_mapa') returning plan_generation_id`,
      [ctx.lead, ctx.productId, ctx.provider, ctx.transacao, PLAN_TEMPLATE_VERSION, token]
    );
    return { id: row.plan_generation_id, token, gerado: false };
  }
  const plano = montar(ctx.dim, mapa.answers_json, mapa.chosen_pattern);
  const [row] = await q<{ plan_generation_id: string }>(
    `insert into plan_generations (lead_id, map_result_id, product_id, provider, transaction_id, generated_at,
       input_version, output_version, content, access_token, processing_status)
     values ($1,$2,$3,$4,$5, now(), $6, $6, $7, $8, 'generated') returning plan_generation_id`,
    [ctx.lead, mapa.map_result_id, ctx.productId, ctx.provider, ctx.transacao, PLAN_TEMPLATE_VERSION, JSON.stringify(plano), token]
  );
  return { id: row.plan_generation_id, token, gerado: true };
}

function montar(dim: DimensionId, respostas: Record<string, number>, escolhido: string | null = null): Plano {
  const cfg = getDimensionalMap(dim);
  return gerarPlano(cfg, aplicarPrioridade(scoreDimensional(cfg, respostas), escolhido), respostas);
}

/** Chamado ao concluir um Mapa: gera Planos que estavam esperando por ele. */
export async function gerarPlanosPendentes(q: Q, lead: string, dim: string, mapResultId: string) {
  if (!isDimensionId(dim)) return 0;
  const pendentes = await q<{ plan_generation_id: string }>(
    `select g.plan_generation_id from plan_generations g join products p using (product_id)
     where g.lead_id = $1 and g.processing_status = 'pending' and p.product_dimension = $2`,
    [lead, dim]
  );
  if (!pendentes.length) return 0;
  const [m] = await q<{ answers_json: Record<string, number>; chosen_pattern: string | null }>(
    "select answers_json, chosen_pattern from map_results where map_result_id = $1", [mapResultId]
  );
  const plano = montar(dim, m.answers_json, m.chosen_pattern);
  for (const p of pendentes) {
    await q(
      `update plan_generations set map_result_id = $2, content = $3, generated_at = now(),
         output_version = $4, processing_status = 'generated', processing_error = null
       where plan_generation_id = $1`,
      [p.plan_generation_id, mapResultId, JSON.stringify(plano), PLAN_TEMPLATE_VERSION]
    );
  }
  return pendentes.length;
}

export async function planoPorToken(q: Q, token: string) {
  if (!/^[A-Za-z0-9_-]{20,64}$/.test(token)) return null;
  const [row] = await q<{
    plan_generation_id: string; lead_id: string; processing_status: string; content: Plano | null;
    product_id: string; generated_at: string | null; transaction_status: string | null;
  }>(
    `select g.plan_generation_id, g.lead_id, g.processing_status, g.content, g.product_id, g.generated_at,
            t.transaction_status
     from plan_generations g
     left join transactions t on t.provider = g.provider and t.transaction_id = g.transaction_id
     where g.access_token = $1`,
    [token]
  );
  return row ?? null;
}

/**
 * PlanDay7Completed (Matriz, AUT_PLAN_PURCHASE): a pessoa voltou ao Plano a
 * partir do 7º dia. É o sinal mais próximo de "percorreu os 7 dias" que o
 * site consegue observar. Um evento por Plano.
 */
export async function registrarRetornoDia7(
  q: Q,
  g: { plan_generation_id: string; lead_id: string; product_id: string; generated_at: string | null }
) {
  if (!g.generated_at || Date.now() - new Date(g.generated_at).getTime() < 7 * 864e5) return;
  await registrarEvento(q, "PlanDay7Completed", {
    event_id: eventIdDeTransacao("plano", g.plan_generation_id, "dia7"),
    lead_id: g.lead_id,
    product_id: g.product_id,
    product_type: "plan",
    dimension: g.product_id.replace("plan_", ""),
  });
}
