import { withTx } from "@/lib/epic/server/db";
import { ehBot, erro, lerJson, logErro, ok, str } from "@/lib/epic/server/http";
import { atribuicaoDe, origemDoToque } from "@/lib/epic/server/identity";
import { ehMapType, iniciarMapa } from "@/lib/epic/server/mapas";
import { mapaVisivel } from "@/lib/epic/site";

export async function POST(req: Request) {
  if (ehBot(req)) return erro("Indisponível.", 403);
  const b = await lerJson(req);
  if (!b || !ehMapType(b.map_type)) return erro("Mapa inválido.");
  if (b.map_type !== "friccao" && !mapaVisivel(b.map_type)) return erro("Mapa indisponível.", 404);
  try {
    const toque = origemDoToque(atribuicaoDe(b), new URL(req.url).hostname);
    const r = await withTx((q) =>
      iniciarMapa(q, b.map_type as never, { utm_source: str(b.utm_source, 120), utm_medium: str(b.utm_medium, 120) }, toque)
    );
    return ok({ ...r });
  } catch (e) {
    logErro("v2/mapas/iniciar", e);
    return erro("Não foi possível iniciar o Mapa agora.", 500);
  }
}
