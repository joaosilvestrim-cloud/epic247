import { MapAnswerError } from "@/lib/epic/maps/engine";
import { withTx } from "@/lib/epic/server/db";
import { erro, lerJson, logErro, ok } from "@/lib/epic/server/http";
import { concluirMapa } from "@/lib/epic/server/mapas";

const UUID = /^[0-9a-f-]{36}$/i;

/** Conclui o Mapa. O servidor recalcula tudo a partir das respostas. */
export async function POST(req: Request) {
  const b = await lerJson(req);
  if (!b || typeof b.map_result_id !== "string" || !UUID.test(b.map_result_id)) return erro("Inválido.");
  const respostas = b.answers && typeof b.answers === "object" && !Array.isArray(b.answers) ? b.answers : null;
  if (!respostas) return erro("Inválido.");
  try {
    const r = await withTx((q) => concluirMapa(q, b.map_result_id as string, respostas as Record<string, unknown>));
    return ok({ ...r });
  } catch (e) {
    if (e instanceof MapAnswerError) return erro("Faltou responder alguma pergunta. Volte e confira.", 422);
    logErro("v2/mapas/concluir", e);
    return erro("Não conseguimos calcular agora. Suas respostas estão salvas: tente de novo.", 500);
  }
}
