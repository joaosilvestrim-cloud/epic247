import { isDimensionId } from "@/lib/epic/dimensions";
import { withTx } from "@/lib/epic/server/db";
import { ehBot, erro, excedeuLimite, lerJson, logErro, ok, str } from "@/lib/epic/server/http";
import { recomporResultado, resultadoPorToken } from "@/lib/epic/server/mapas";
import type { DimensionalResult } from "@/lib/epic/maps/types";

/**
 * Empate em primeiro: a pessoa escolhe por qual área quer começar (Mapa de
 * Energia §8). Só aceita uma das áreas empatadas. O Plano parte dela.
 */
export async function POST(req: Request) {
  if (ehBot(req)) return ok();
  if (await excedeuLimite(req, "prioridade", 20, 600)) return erro("Muitas tentativas seguidas.", 429);
  const b = await lerJson(req);
  const token = str(b?.token, 64);
  const eixo = str(b?.eixo, 40);
  if (!token || !eixo) return erro("Escolha inválida.");
  try {
    const ok_ = await withTx(async (q) => {
      const salvo = await resultadoPorToken(q, token);
      if (!salvo || !isDimensionId(salvo.map_type)) return false;
      const r = recomporResultado(salvo) as DimensionalResult;
      if (r.kind !== "tie" || !r.tiedTop.includes(eixo)) return false;
      await q("update map_results set chosen_pattern = $2 where result_token = $1", [token, eixo]);
      return true;
    });
    return ok_ ? ok() : erro("Essa área não está entre as empatadas.");
  } catch (e) {
    logErro("v2/mapas/prioridade", e);
    return erro("Não foi possível registrar agora.", 500);
  }
}
