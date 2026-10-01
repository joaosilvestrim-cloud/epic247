import { withTx } from "@/lib/epic/server/db";
import { ehBot, erro, lerJson, logErro, ok } from "@/lib/epic/server/http";
import {
  abrirSessao, atribuicaoDe, garantirLead, origemDoToque, registrarToque, sessaoAtual,
} from "@/lib/epic/server/identity";

/**
 * Chamado uma vez por carregamento de página pelo rastreador do site.
 * Garante lead (cookie), registra o toque atribuível (first-touch só na
 * criação; last-touch quando há utm ou referrer externo) e abre a sessão.
 */
export async function POST(req: Request) {
  if (ehBot(req)) return ok({ bot: true });
  const body = await lerJson(req);
  if (!body) return erro("Requisição inválida.");
  try {
    const host = new URL(req.url).hostname;
    const atrib = atribuicaoDe(body);
    const toque = origemDoToque(atrib, host);
    await withTx(async (q) => {
      const jaTinhaSessao = await sessaoAtual();
      const lead = await garantirLead(q, toque);
      if (toque) await registrarToque(q, lead, toque);
      if (!jaTinhaSessao || toque) await abrirSessao(q, lead, toque ?? atrib, Boolean(toque));
    });
    return ok();
  } catch (e) {
    logErro("v2/sessao", e);
    return erro("Falha ao registrar sessão.", 500);
  }
}
