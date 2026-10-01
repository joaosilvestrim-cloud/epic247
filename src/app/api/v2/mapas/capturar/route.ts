import { MapAnswerError } from "@/lib/epic/maps/engine";
import { withTx } from "@/lib/epic/server/db";
import { caiuNaIsca, ehBot, erro, excedeuLimite, lerJson, logErro, ok, str } from "@/lib/epic/server/http";
import { emailValido } from "@/lib/epic/server/identity";
import { capturarResultado } from "@/lib/epic/server/mapas";

/** Captura pós-resultado (RF-016). O resultado já foi exibido antes. */
export async function POST(req: Request) {
  if (ehBot(req)) return ok();
  if (await excedeuLimite(req, "capturar", 10, 600)) return erro("Muitas tentativas seguidas. Espere alguns minutos e tente de novo.", 429);
  const b = await lerJson(req);
  if (!b) return erro("Requisição inválida.");
  if (caiuNaIsca(b)) return ok();
  if (typeof b.token !== "string") return erro("Resultado inválido.");
  if (!emailValido(b.email)) return erro("Confira o e-mail.");
  try {
    const r = await withTx((q) =>
      capturarResultado(q, b.token as string, {
        email: b.email as string,
        firstName: str(b.first_name, 80),
        marketing: b.marketing === true,
      })
    );
    return ok({ event_id: r.event_id });
  } catch (e) {
    if (e instanceof MapAnswerError) return erro("Resultado não encontrado.", 404);
    logErro("v2/mapas/capturar", e);
    return erro("Não foi possível enviar agora. Tente de novo em instantes.", 500);
  }
}
