import "server-only";
import { getServiceClient } from "@/lib/supabase";
import { isDimensionId } from "../dimensions";
import { podeBaixarMaterial, type Acesso, type StatusAcesso } from "../meu-epic";
import type { Q } from "./db";
import { registrarEvento } from "./events";

// Acesso aos produtos (CR-01, AccessGrant). A compra aprovada concede; o
// reembolso e o chargeback revogam (D8). O histórico nunca é apagado: o
// acesso muda de estado e guarda quando e por quê.

/** Leads unidos a este (histórico do mesmo dono). */
export const DO_LEAD = "select lead_id from leads where lead_id = $1 or merged_into = $1";

export function escopoDo(p: { product_type: string; product_dimension: string | null }): string {
  return p.product_type === "plan" || p.product_type === "kit" ? (p.product_dimension ?? "") : p.product_type;
}

/** Concede o acesso de uma compra aprovada. Idempotente pela transação. */
export async function concederPorCompra(
  q: Q,
  c: { lead: string; productId: string; productType: string; scope: string; provider: string; transacao: string; mapResultId: string | null }
): Promise<boolean> {
  const mapa = c.mapResultId && /^[0-9a-f-]{36}$/i.test(c.mapResultId) ? c.mapResultId : null;
  const novo = await q(
    `insert into access_grants (lead_id, product_id, product_type, scope, provider, source_transaction_id, map_result_id)
     values ($1, $2, $3, $4, $5, $6, (select map_result_id from map_results where map_result_id = $7::uuid))
     on conflict (provider, source_transaction_id, product_id) where source_transaction_id is not null do nothing
     returning grant_id`,
    [c.lead, c.productId, c.productType, c.scope, c.provider, c.transacao, mapa]
  );
  return novo.length > 0;
}

/** Reembolso e chargeback encerram o acesso daquela compra (histórico preservado). */
export async function revogarPorCompra(q: Q, provider: string, transacao: string, motivo: string) {
  await q(
    `update access_grants set access_status = 'revoked', revoked_at = coalesce(revoked_at, now()),
       status_reason = $3, updated_at = now()
     where provider = $1 and source_transaction_id = $2 and access_status <> 'revoked'`,
    [provider, transacao, motivo]
  );
}

/** Ajuste manual pelo admin (suporte, investigação, chargeback revertido). */
export async function alterarAcesso(q: Q, grantId: string, status: StatusAcesso, motivo: string) {
  await q(
    `update access_grants set access_status = $2, status_reason = $3, updated_at = now(),
       revoked_at = case when $2 = 'active' then null else coalesce(revoked_at, now()) end
     where grant_id = $1`,
    [grantId, status, motivo.slice(0, 200)]
  );
}

/** Concessão sem compra no 2.0: cortesia, migração de compradores do Ciclo 1. */
export async function concederManual(q: Q, lead: string, productId: string, origem: "admin" | "migration") {
  const [p] = await q<{ product_type: string; product_dimension: string | null }>(
    "select product_type, product_dimension from products where product_id = $1", [productId]
  );
  if (!p) throw new Error("produto inexistente");
  const [ja] = await q(
    `select 1 from access_grants where lead_id in (${DO_LEAD}) and product_id = $2 and access_status = 'active'`,
    [lead, productId]
  );
  if (ja) return false;
  await q(
    `insert into access_grants (lead_id, product_id, product_type, scope, source) values ($1, $2, $3, $4, $5)`,
    [lead, productId, p.product_type, escopoDo(p), origem]
  );
  return true;
}

export interface AcessoDoLead extends Acesso {
  grant_id: string;
  product_id: string;
  product_name: string;
  delivery: "epic" | "kiwify";
  granted_at: string;
  revoked_at: string | null;
  transaction_status: string | null;
}

export async function acessosDoLead(q: Q, lead: string): Promise<AcessoDoLead[]> {
  return q<AcessoDoLead>(
    `select g.grant_id, g.product_id, g.product_type, g.scope, g.access_status, g.granted_at, g.revoked_at,
            p.product_name, p.delivery, t.transaction_status
     from access_grants g
     join products p using (product_id)
     left join transactions t on t.provider = g.provider and t.transaction_id = g.source_transaction_id
     where g.lead_id in (${DO_LEAD})
     order by g.granted_at desc`,
    [lead]
  );
}

// ───────────────────────────── Materiais ─────────────────────────────

export const BUCKET_PRIVADO = "epic-produtos";

export interface Material {
  asset_id: string;
  product_type: "kit" | "protocol";
  dimension: string;
  asset_kind: "manual" | "workbook" | "ferramenta" | "outro";
  title: string;
  file_name: string;
  file_size: number | null;
  version: number;
  published: boolean;
  storage_path: string;
}

export async function materiaisDaDimensao(q: Q, dimensao: string, tipos: ("kit" | "protocol")[]): Promise<Material[]> {
  return q<Material>(
    `select asset_id, product_type, dimension, asset_kind, title, file_name, file_size, version, published, storage_path
     from product_assets where dimension = $1 and product_type = any($2) and published
     order by product_type, sort_order, case asset_kind when 'manual' then 0 when 'workbook' then 1 when 'ferramenta' then 2 else 3 end, title`,
    [dimensao, tipos]
  );
}

/** Dimensões com material publicado (trava de venda de Kit e Protocolo). */
export async function dimensoesComMaterial(q: Q): Promise<Set<string>> {
  const r = await q<{ dimension: string }>("select distinct dimension from product_assets where published");
  return new Set(r.map((x) => x.dimension));
}

/** Garante o bucket privado (idempotente). Nunca público: só URL assinada e curta. */
export async function garantirBucket() {
  const sb = getServiceClient();
  if (!sb) throw new Error("Supabase não configurado");
  const { data } = await sb.storage.getBucket(BUCKET_PRIVADO);
  if (!data) {
    const { error } = await sb.storage.createBucket(BUCKET_PRIVADO, { public: false });
    if (error && !/exist/i.test(error.message)) throw new Error(error.message);
  }
  return sb;
}

/**
 * Download de material: confere sessão + acesso no servidor, registra o
 * evento e devolve uma URL assinada de 60 segundos (CR-01A, storage).
 */
export async function urlDeDownload(q: Q, lead: string, assetId: string): Promise<string | null> {
  if (!/^[0-9a-f-]{36}$/i.test(assetId)) return null;
  const [m] = await q<Material>(
    "select * from product_assets where asset_id = $1 and published", [assetId]
  );
  if (!m) return null;
  const acessos = await acessosDoLead(q, lead);
  if (!podeBaixarMaterial(acessos, m)) return null;
  const sb = getServiceClient();
  if (!sb) return null;
  const { data, error } = await sb.storage.from(BUCKET_PRIVADO).createSignedUrl(m.storage_path, 60, { download: m.file_name });
  if (error || !data) return null;
  await registrarEvento(q, "DownloadProductAsset", {
    lead_id: lead, product_type: m.product_type, dimension: m.dimension,
    props: { asset_id: m.asset_id, tipo: m.asset_kind, versao: m.version },
  });
  if (isDimensionId(m.dimension) && acessos.some((a) => a.product_type === "protocol" && a.access_status === "active")) {
    await marcarInicio(q, lead, m.dimension);
  }
  return data.signedUrl;
}

// ───────────────────────────── Progresso do Protocolo ─────────────────────────────

/** Abriu ou baixou material da dimensão: "em andamento" (D9). Não rebaixa concluída. */
export async function marcarInicio(q: Q, lead: string, dimensao: string) {
  await q(
    `insert into protocol_progress (lead_id, dimension, status) values ($1, $2, 'in_progress')
     on conflict (lead_id, dimension) do nothing`,
    [lead, dimensao]
  );
}

export async function marcarConclusao(q: Q, lead: string, dimensao: string, concluida: boolean) {
  if (concluida) {
    await q(
      `insert into protocol_progress (lead_id, dimension, status, completed_at) values ($1, $2, 'completed', now())
       on conflict (lead_id, dimension) do update set status = 'completed', completed_at = now(), updated_at = now()`,
      [lead, dimensao]
    );
    await registrarEvento(q, "CompleteProtocolDimension", { lead_id: lead, dimension: dimensao, product_type: "protocol" });
  } else {
    await q(
      `update protocol_progress set status = 'in_progress', completed_at = null, updated_at = now()
       where lead_id = $1 and dimension = $2`,
      [lead, dimensao]
    );
  }
}

export async function progressoDoLead(q: Q, lead: string) {
  return q<{ dimension: string; status: string }>(
    `select dimension, status from protocol_progress where lead_id in (${DO_LEAD})`, [lead]
  );
}
