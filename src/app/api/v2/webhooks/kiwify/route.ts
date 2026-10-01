import { NextResponse } from "next/server";
import { PROVEDOR } from "@/lib/epic/server/checkout";
import { withTx } from "@/lib/epic/server/db";
import { logErro } from "@/lib/epic/server/http";
import { processarWebhook } from "@/lib/epic/server/webhooks";

/**
 * Webhook do Kiwify (RF-044 a RF-047, RF-066).
 * 1) valida a assinatura; 2) grava o payload cru (idempotente pela chave);
 * 3) processa. Falha de regra (ex.: produto sem mapeamento) fica registrada
 * para reprocessar no /admin; só erro de infraestrutura devolve 500, para o
 * Kiwify tentar de novo.
 */
export async function POST(req: Request) {
  const corpo = await req.text();
  if (!PROVEDOR.assinaturaValida(corpo, req)) {
    return NextResponse.json({ ok: false, error: "assinatura inválida" }, { status: 401 });
  }
  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(corpo);
  } catch {
    return NextResponse.json({ ok: false, error: "json inválido" }, { status: 400 });
  }
  try {
    const ev = PROVEDOR.interpretar(payload);
    const id = await withTx(async (q) => {
      const [novo] = await q<{ id: number }>(
        `insert into webhook_events (provider, event_key, event_type, payload)
         values ($1, $2, $3, $4) on conflict (provider, event_key) do nothing returning id`,
        [PROVEDOR.nome, ev.chave, ev.tipo, corpo]
      );
      if (novo) return novo.id;
      const [velho] = await q<{ id: number; processing_status: string }>(
        "select id, processing_status from webhook_events where provider = $1 and event_key = $2",
        [PROVEDOR.nome, ev.chave]
      );
      return velho.processing_status === "processed" ? null : velho.id;
    });
    if (id === null) return NextResponse.json({ ok: true, duplicado: true });
    const r = await processarWebhook(id);
    return NextResponse.json({ ok: true, status: r.status });
  } catch (e) {
    logErro("v2/webhooks/kiwify", e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
