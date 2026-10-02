import { PROVEDOR } from "@/lib/epic/server/checkout";
import { withTx } from "@/lib/epic/server/db";
import { registrarEvento } from "@/lib/epic/server/events";
import { ehBot, erro, excedeuLimite, lerJson, logErro, ok, str } from "@/lib/epic/server/http";
import { garantirLead, sessaoAtual } from "@/lib/epic/server/identity";
import { resultadoPorToken } from "@/lib/epic/server/mapas";
import { ofertasPermitidas, perfilAtual } from "@/lib/epic/server/perfil";
import { produto, vendavel } from "@/lib/epic/server/produtos";

/**
 * Início de checkout (RF-043). Valida o produto, impede recompra do que já
 * foi comprado (RF-039/040), registra StartCheckout e devolve o link do
 * provedor com rastreio (lead e Mapa) para o webhook ligar a compra.
 */
export async function POST(req: Request) {
  if (ehBot(req)) return erro("Indisponível.", 403);
  if (await excedeuLimite(req, "checkout", 20, 600)) return erro("Muitas tentativas seguidas. Espere alguns minutos e tente de novo.", 429);
  const b = await lerJson(req);
  const id = str(b?.product_id, 40);
  if (!b || !id) return erro("Produto inválido.");
  const p = await produto(id);
  // Mentoria não tem checkout direto: o link sai só depois da vaga confirmada (RC1 §6).
  if (p?.product_type === "mentoring") return erro("A Mentoria começa pelo formulário de interesse.", 409);
  if (!vendavel(p)) return erro("Este produto ainda não está disponível.", 409);

  const perfil = await perfilAtual();
  if (p.product_dimension) {
    const regras = ofertasPermitidas(perfil, p.product_dimension);
    const jaTemPlano = p.product_type === "plan" && perfil?.plans_owned.includes(p.product_dimension);
    if ((p.product_type === "kit" && !regras.kit) || jaTemPlano) {
      return erro("Você já tem este produto. Confira o seu e-mail de acesso.", 409);
    }
  }
  if (p.product_type === "protocol" && perfil?.protocol_purchased) {
    return erro("Você já tem o Protocolo. Confira o seu e-mail de acesso.", 409);
  }

  try {
    const r = await withTx(async (q) => {
      const lead = await garantirLead(q, null);
      const token = str(b.r, 64);
      const mapa = token ? await resultadoPorToken(q, token) : null;
      const [l] = await q<Record<string, string | null>>(
        `select last_touch_source as utm_source, last_touch_medium as utm_medium,
                last_touch_campaign as utm_campaign, last_touch_content as utm_content,
                last_touch_term as utm_term
         from leads where lead_id = $1`,
        [lead]
      );
      const event_id = await registrarEvento(q, "StartCheckout", {
        lead_id: lead,
        session_id: await sessaoAtual(),
        product_id: p.product_id,
        product_type: p.product_type,
        product_price: p.price_list,
        dimension: p.product_dimension,
        map_type: mapa?.map_type ?? null,
      });
      const url = PROVEDOR.montarUrl(p, {
        leadId: lead,
        mapResultId: mapa && mapa.lead_id === lead ? mapa.map_result_id : null,
        utm: l ?? {},
      });
      return { url, event_id };
    });
    return ok({ ...r, value: p.price_list });
  } catch (e) {
    logErro("v2/checkout/iniciar", e);
    return erro("Não foi possível abrir o checkout agora.", 500);
  }
}
