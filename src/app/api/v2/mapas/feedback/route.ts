import { withTx } from "@/lib/epic/server/db";
import { registrarEvento } from "@/lib/epic/server/events";
import { ehBot, erro, excedeuLimite, lerJson, logErro, ok, str } from "@/lib/epic/server/http";
import { sessaoAtual } from "@/lib/epic/server/identity";

const RESPOSTAS = ["sim", "em_parte", "nao"];

/**
 * "Este resultado faz sentido para você?" (seção 17 de cada Mapa: feedback
 * qualitativo sobre reconhecimento do resultado). Quem tem o token do
 * resultado pode responder; a última resposta vale.
 */
export async function POST(req: Request) {
  if (ehBot(req)) return ok();
  if (await excedeuLimite(req, "feedback", 20, 600)) return erro("Muitas tentativas seguidas.", 429);
  const b = await lerJson(req);
  const token = str(b?.token, 64);
  const resposta = str(b?.resposta, 10);
  if (!token || !resposta || !RESPOSTAS.includes(resposta)) return erro("Resposta inválida.");
  try {
    const salvo = await withTx(async (q) => {
      const [r] = await q<{ lead_id: string; map_type: string; primary_pattern: string | null; primary_dimension: string | null }>(
        `update map_results set feedback = $2, feedback_comment = coalesce($3, feedback_comment), feedback_at = now()
         where result_token = $1 and status = 'completed'
         returning lead_id, map_type, primary_pattern, primary_dimension`,
        [token, resposta, str(b?.comentario, 500)]
      );
      if (!r) return false;
      await registrarEvento(q, "ResultFeedback", {
        lead_id: r.lead_id, session_id: await sessaoAtual(), map_type: r.map_type,
        dimension: r.map_type === "friccao" ? r.primary_dimension : r.map_type,
        primary_pattern: r.primary_pattern, props: { resposta },
      });
      return true;
    });
    return salvo ? ok() : erro("Resultado não encontrado.", 404);
  } catch (e) {
    logErro("v2/mapas/feedback", e);
    return erro("Não foi possível registrar agora.", 500);
  }
}
