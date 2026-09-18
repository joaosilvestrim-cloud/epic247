import { getServiceClient } from "./supabase";

// Resumo de origem para o /admin (servidor). Usa a função origem_resumo
// criada em supabase/003_origem.sql, que agrega no banco.

export interface LinhaOrigem {
  utm_source: string;
  utm_medium: string;
  visitantes: number;
  visitas: number;
  checkouts: number;
  leads: number;
}

export type PeriodoOrigem = "7" | "30" | "tudo";

export interface ResumoOrigem {
  /** false quando a migration ainda não rodou. */
  pronto: boolean;
  periodos: Record<PeriodoOrigem, LinhaOrigem[]>;
}

const DIAS: Record<PeriodoOrigem, number> = { "7": 7, "30": 30, tudo: 3650 };

export async function getResumoOrigem(): Promise<ResumoOrigem> {
  const vazio: ResumoOrigem = { pronto: false, periodos: { "7": [], "30": [], tudo: [] } };
  const supabase = getServiceClient();
  if (!supabase) return vazio;

  const periodos = Object.keys(DIAS) as PeriodoOrigem[];
  const resultados = await Promise.all(
    periodos.map((p) =>
      supabase.rpc("origem_resumo", {
        p_desde: new Date(Date.now() - DIAS[p] * 864e5).toISOString(),
      })
    )
  );

  if (resultados.some((r) => r.error)) return vazio;

  const out = { ...vazio.periodos };
  periodos.forEach((p, i) => {
    out[p] = ((resultados[i].data as LinhaOrigem[]) ?? []).map((l) => ({
      ...l,
      visitantes: Number(l.visitantes),
      visitas: Number(l.visitas),
      checkouts: Number(l.checkouts),
      leads: Number(l.leads),
    }));
  });
  return { pronto: true, periodos: out };
}
