import "server-only";
import { sendMetaEvent } from "@/lib/meta-capi";
import { PROVEDOR } from "./checkout";
import { processarEventoCheckout, ProdutoNaoMapeado, type ResultadoCompra } from "./compras";
import { withTx } from "./db";

/**
 * Processa um webhook já gravado em webhook_events. Usado na chegada e no
 * reprocessamento manual pelo /admin (RF-079).
 */
export async function processarWebhook(
  id: number
): Promise<{ status: string; erro?: string; resultado?: ResultadoCompra }> {
  try {
    const resultado = await withTx(async (q) => {
      const [w] = await q<{ payload: Record<string, unknown>; processing_status: string }>(
        "select payload, processing_status from webhook_events where id = $1 for update",
        [id]
      );
      if (!w) throw new Error("webhook não encontrado");
      if (w.processing_status === "processed") return null;
      const ev = PROVEDOR.interpretar(w.payload);
      const r = await processarEventoCheckout(q, ev);
      await q(
        `update webhook_events set processing_status = $2, processing_error = null, event_type = $3,
           last_retry_at = now()
         where id = $1`,
        [id, r.acao === "ignorada" ? "ignored" : "processed", ev.tipo]
      );
      return r;
    });
    // Conversions API fora da transação: falha do Meta não desfaz a compra.
    if (resultado?.acao === "nova_compra") {
      void sendMetaEvent("Purchase", {
        email: resultado.email ?? undefined,
        eventId: resultado.eventId,
        value: resultado.valor,
        currency: "BRL",
      }).catch(() => {});
    }
    return { status: resultado ? "processed" : "already", resultado: resultado ?? undefined };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    await withTx((q) =>
      q(
        `update webhook_events set processing_status = 'failed', processing_error = $2,
           retry_count = retry_count + 1, last_retry_at = now() where id = $1`,
        [id, msg.slice(0, 500)]
      )
    ).catch(() => {});
    return { status: e instanceof ProdutoNaoMapeado ? "unmapped" : "failed", erro: msg };
  }
}
