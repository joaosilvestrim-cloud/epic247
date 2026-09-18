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

/* ───────────── Funil, abandono do quiz e perfil (004_funil.sql) ───────────── */

export interface EtapaFunil {
  etapa: string;
  ordem: number;
  pessoas: number;
}

export interface EtapaQuiz {
  etapa: number;
  pessoas: number;
}

export interface LinhaPerfil {
  dimensao: string;
  valor: string;
  visitantes: number;
}

export interface DetalheOrigem {
  /** false quando o 004_funil.sql ainda não rodou. */
  pronto: boolean;
  funil: EtapaFunil[];
  quiz: EtapaQuiz[];
  perfil: LinhaPerfil[];
}

export async function getDetalheOrigem(
  periodo: PeriodoOrigem,
  source: string | null,
  medium: string | null
): Promise<DetalheOrigem> {
  const vazio: DetalheOrigem = { pronto: false, funil: [], quiz: [], perfil: [] };
  const supabase = getServiceClient();
  if (!supabase) return vazio;

  const args = {
    p_desde: new Date(Date.now() - DIAS[periodo] * 864e5).toISOString(),
    p_source: source,
    p_medium: source ? medium ?? "" : null,
  };

  const [funil, quiz, perfil] = await Promise.all([
    supabase.rpc("origem_funil", args),
    supabase.rpc("origem_quiz_etapas", args),
    supabase.rpc("origem_perfil", args),
  ]);
  if (funil.error || quiz.error || perfil.error) return vazio;

  return {
    pronto: true,
    funil: ((funil.data as EtapaFunil[]) ?? []).map((f) => ({
      ...f,
      pessoas: Number(f.pessoas),
    })),
    quiz: ((quiz.data as EtapaQuiz[]) ?? []).map((q) => ({
      etapa: Number(q.etapa),
      pessoas: Number(q.pessoas),
    })),
    perfil: ((perfil.data as LinhaPerfil[]) ?? []).map((p) => ({
      ...p,
      visitantes: Number(p.visitantes),
    })),
  };
}

export function periodoValido(v: string | null): PeriodoOrigem {
  return v === "7" || v === "tudo" ? v : "30";
}
