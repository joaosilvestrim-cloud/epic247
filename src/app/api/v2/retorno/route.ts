import { isDimensionId } from "@/lib/epic/dimensions";
import { FRICCAO, getDimensionalMap } from "@/lib/epic/maps";
import { withTx } from "@/lib/epic/server/db";
import { ok } from "@/lib/epic/server/http";
import { leadAtual } from "@/lib/epic/server/identity";

/**
 * Quem volta ao site, mesmo sem ter deixado e-mail, reencontra o que já fez
 * (Matriz, AUT_MAP_COMPLETE_ANON: "persistir resultado e manter CTA
 * on-site"). Só lê o cookie: nada de dado pessoal na resposta.
 */
export async function GET() {
  try {
    const r = await withTx(async (q) => {
      const lead = await leadAtual(q);
      if (!lead) return null;
      const ids = `select lead_id from leads where lead_id = $1 or merged_into = $1`;
      const [aberto] = await q<{ map_type: string; current_step: number; n: number }>(
        `select map_type, current_step, (select count(*) from jsonb_object_keys(answers_json))::int n
         from map_results where lead_id in (${ids}) and status = 'in_progress'
           and started_at > now() - interval '7 days'
         order by started_at desc limit 1`,
        [lead]
      );
      const [feito] = await q<{ map_type: string; result_token: string; completed_at: string }>(
        `select map_type, result_token, completed_at from map_results
         where lead_id in (${ids}) and status = 'completed' and result_token is not null
           and completed_at > now() - interval '90 days'
         order by completed_at desc limit 1`,
        [lead]
      );
      const nome = (t: string) => (t === "friccao" ? "Mapa de Fricção" : isDimensionId(t) ? getDimensionalMap(t).title : "Mapa");
      const total = (t: string) => (t === "friccao" ? FRICCAO.questions.length : isDimensionId(t) ? getDimensionalMap(t).questions.length : 15);
      return {
        emAndamento:
          aberto && aberto.n > 0
            ? { nome: nome(aberto.map_type), url: aberto.map_type === "friccao" ? "/mapa" : `/mapas/${aberto.map_type}`, respondidas: aberto.n, total: total(aberto.map_type) }
            : null,
        resultado: feito
          ? {
              nome: nome(feito.map_type),
              url: feito.map_type === "friccao" ? `/mapa/resultado/${feito.result_token}` : `/mapas/${feito.map_type}/resultado/${feito.result_token}`,
              data: feito.completed_at,
            }
          : null,
      };
    });
    return ok(r ?? { emAndamento: null, resultado: null });
  } catch {
    return ok({ emAndamento: null, resultado: null });
  }
}
