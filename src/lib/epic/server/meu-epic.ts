import "server-only";
import { DIMENSIONS, isDimensionId, type DimensionId } from "../dimensions";
import { FRICCAO, getDimensionalMap } from "../maps";
import { DO_LEAD } from "./acessos";
import type { Q } from "./db";

// Leituras do Meu EPIC (CR-01A). Tudo a partir do lead da sessão, com o
// histórico unido (mesma pessoa em outro aparelho ou outro e-mail de compra).

export interface MapaDaConta {
  map_result_id: string;
  map_type: string;
  nome: string;
  dimensao: DimensionId | null;
  concluidoEm: string;
  principal: string | null;
  secundario: string | null;
  url: string;
  primeiroMovimento: string | null;
}

interface LinhaMapa {
  map_result_id: string;
  map_type: string;
  completed_at: string;
  primary_pattern: string | null;
  secondary_pattern: string | null;
  primary_dimension: string | null;
  secondary_dimension: string | null;
  chosen_pattern: string | null;
  result_token: string;
}

function descrever(r: LinhaMapa): MapaDaConta {
  if (r.map_type === "friccao") {
    const p = isDimensionId(r.primary_dimension) ? r.primary_dimension : null;
    const s = isDimensionId(r.secondary_dimension) ? r.secondary_dimension : null;
    return {
      map_result_id: r.map_result_id, map_type: r.map_type, nome: "Mapa de Fricção", dimensao: p,
      concluidoEm: r.completed_at,
      principal: p ? DIMENSIONS[p].name : null,
      secundario: s ? DIMENSIONS[s].name : null,
      url: `/mapa/resultado/${r.result_token}`,
      primeiroMovimento: p ? (FRICCAO.results[p]?.firstMove ?? null) : null,
    };
  }
  const d = isDimensionId(r.map_type) ? r.map_type : null;
  const cfg = d ? getDimensionalMap(d) : null;
  const chave = r.chosen_pattern ?? r.primary_pattern;
  const rot = (k: string | null) => (k && cfg ? (cfg.axes.find((a) => a.key === k)?.label ?? null) : null);
  const perfil = chave && cfg ? cfg.profiles[chave] : null;
  return {
    map_result_id: r.map_result_id, map_type: r.map_type, nome: cfg?.title ?? "Mapa", dimensao: d,
    concluidoEm: r.completed_at,
    principal: rot(chave) ? `${rot(chave)}${perfil?.editorialName ? ` (${perfil.editorialName})` : ""}` : null,
    secundario: rot(r.secondary_pattern !== chave ? r.secondary_pattern : r.primary_pattern),
    url: `/mapas/${r.map_type}/resultado/${r.result_token}`,
    primeiroMovimento: perfil?.firstMove ?? null,
  };
}

/** Todos os Mapas concluídos, repetições incluídas, do mais novo ao mais antigo. */
export async function mapasDaConta(q: Q, lead: string, limite = 200): Promise<MapaDaConta[]> {
  const rows = await q<LinhaMapa>(
    `select map_result_id, map_type, completed_at, primary_pattern, secondary_pattern, primary_dimension,
            secondary_dimension, chosen_pattern, result_token
     from map_results
     where lead_id in (${DO_LEAD}) and status = 'completed' and result_token is not null
     order by completed_at desc limit $2`,
    [lead, limite]
  );
  return rows.map(descrever);
}

/** Histórico básico de compras (Minha Conta): produto, data e status. Nada financeiro além disso. */
export async function comprasDaConta(q: Q, lead: string) {
  return q<{ product_name: string; transaction_status: string; data: string }>(
    `select p.product_name, t.transaction_status, coalesce(t.approved_at, t.purchased_at, t.created_at) as data
     from transactions t join products p using (product_id)
     where t.lead_id in (${DO_LEAD}) and t.transaction_status in ('approved','refunded','chargeback')
     order by data desc`,
    [lead]
  );
}

export function rotuloCompra(s: string) {
  return s === "approved" ? "Aprovada" : s === "refunded" ? "Reembolsada" : s === "chargeback" ? "Contestada" : s;
}

/** Estado da Mentoria para o Meu EPIC (D10: só o status). */
export async function mentoriaDaConta(q: Q, lead: string): Promise<string | null> {
  const [m] = await q<{ status: string }>(
    `select status from mentoring_applications where lead_id in (${DO_LEAD}) and status in ('ativo','concluido')
     order by status_changed_at desc nulls last limit 1`,
    [lead]
  );
  return m ? (m.status === "ativo" ? "Em andamento" : "Concluída") : null;
}

export function dataCurta(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric", timeZone: "America/Sao_Paulo" });
}
