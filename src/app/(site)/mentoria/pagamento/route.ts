import { NextResponse } from "next/server";
import { PROVEDOR } from "@/lib/epic/server/checkout";
import { withTx } from "@/lib/epic/server/db";
import { registrarEvento } from "@/lib/epic/server/events";
import { ehBot, logErro } from "@/lib/epic/server/http";
import { seguirLead } from "@/lib/epic/server/identity";
import { linkPagamentoValido } from "@/lib/epic/server/mentoria";
import { produto, vendavel } from "@/lib/epic/server/produtos";

const UUID = /^[0-9a-f-]{36}$/i;

/**
 * Link de pagamento liberado pela equipe (RC1 §6). Só vale para candidatura
 * com status "link_enviado". Registra StartCheckout antes de levar à Kiwify
 * (Microcopy §12). Link vencido ou já pago volta para /mentoria.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get("a") ?? "";
  const t = url.searchParams.get("t") ?? "";
  // Já pago: volta para a página, que reconhece o cliente pelo cookie. Nunca
  // confirmar pagamento por parâmetro de URL (Microcopy §13).
  const voltar = (estado: "indisponivel" | "pago") =>
    NextResponse.redirect(new URL(estado === "pago" ? "/mentoria" : "/mentoria?pagamento=indisponivel#formulario", req.url), 303);
  if (!UUID.test(id) || !linkPagamentoValido(id, t)) return voltar("indisponivel");

  try {
    const p = await produto("mentoring");
    if (!vendavel(p)) return voltar("indisponivel");
    const destino = await withTx(async (q) => {
      const [c] = await q<{ lead_id: string | null; status: string }>(
        "select lead_id, status from mentoring_applications where id = $1", [id]
      );
      if (!c?.lead_id) return { estado: "indisponivel" } as const;
      if (c.status === "ativo") return { estado: "pago" } as const;
      if (c.status !== "link_enviado") return { estado: "indisponivel" } as const;
      const lead = (await seguirLead(q, c.lead_id)) ?? c.lead_id;
      const [l] = await q<Record<string, string | null>>(
        `select last_touch_source as utm_source, last_touch_medium as utm_medium,
                last_touch_campaign as utm_campaign, last_touch_content as utm_content,
                last_touch_term as utm_term
         from leads where lead_id = $1`,
        [lead]
      );
      // Pré-visualização de link (robô do provedor de e-mail) não conta como início de checkout.
      if (!ehBot(req)) {
        await registrarEvento(q, "StartCheckout", {
          lead_id: lead, product_id: p.product_id, product_type: p.product_type, product_price: p.price_list,
          props: { origem: "link_mentoria" },
        });
      }
      return { estado: "ok", url: PROVEDOR.montarUrl(p, { leadId: lead, mapResultId: null, utm: l ?? {} }) } as const;
    });
    if (destino.estado !== "ok") return voltar(destino.estado);
    return NextResponse.redirect(destino.url, 303);
  } catch (e) {
    logErro("mentoria/pagamento", e);
    return voltar("indisponivel");
  }
}
