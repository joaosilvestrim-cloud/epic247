import { withTx } from "@/lib/epic/server/db";
import { EVENTOS_DO_NAVEGADOR, registrarEvento, type EventoNome } from "@/lib/epic/server/events";
import { ehBot, erro, lerJson, logErro, ok, str } from "@/lib/epic/server/http";
import { leadAtual, sessaoAtual } from "@/lib/epic/server/identity";

const UUID = /^[0-9a-f-]{36}$/i;

/** Eventos de navegação vindos do navegador (whitelist). */
export async function POST(req: Request) {
  if (ehBot(req)) return ok({ bot: true });
  const b = await lerJson(req);
  if (!b) return erro("Requisição inválida.");
  const nome = str(b.event_name, 40);
  if (!nome || !EVENTOS_DO_NAVEGADOR.has(nome)) return erro("Evento não aceito.");
  const eventId = typeof b.event_id === "string" && UUID.test(b.event_id) ? b.event_id : undefined;
  try {
    await withTx(async (q) => {
      const lead = await leadAtual(q);
      await registrarEvento(q, nome as EventoNome, {
        event_id: eventId,
        lead_id: lead,
        session_id: await sessaoAtual(),
        page_url: str(b.page_url),
        referrer: str(b.referrer),
        map_type: str(b.map_type, 30),
        dimension: str(b.dimension, 30),
        product_id: str(b.product_id, 40),
        product_type: str(b.product_type, 20),
        product_price: typeof b.product_price === "number" ? b.product_price : null,
        question_index: Number.isInteger(b.question_index) ? (b.question_index as number) : null,
      });
    });
    return ok();
  } catch (e) {
    logErro("v2/evento", e);
    return erro("Falha ao registrar evento.", 500);
  }
}
