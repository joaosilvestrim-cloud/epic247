import { NextResponse } from "next/server";
import { withTx } from "@/lib/epic/server/db";
import { registrarEvento } from "@/lib/epic/server/events";
import { logErro } from "@/lib/epic/server/http";
import { conferirSvix } from "@/lib/epic/svix";

/**
 * Webhook do Resend: entrega, abertura, clique, bounce e reclamação.
 * Configurar no painel do Resend apontando para /api/v2/webhooks/resend,
 * com os eventos email.delivered, email.opened, email.clicked,
 * email.bounced e email.complained. O segredo vai em RESEND_WEBHOOK_SECRET.
 * Todas as atualizações são idempotentes (o Resend pode reenviar).
 */
export async function POST(req: Request) {
  const segredo = process.env.RESEND_WEBHOOK_SECRET;
  if (!segredo) return NextResponse.json({ ok: false, error: "webhook não configurado" }, { status: 503 });
  const corpo = await req.text();
  const valido = conferirSvix(
    segredo,
    {
      id: req.headers.get("svix-id"),
      timestamp: req.headers.get("svix-timestamp"),
      assinatura: req.headers.get("svix-signature"),
    },
    corpo
  );
  if (!valido) return NextResponse.json({ ok: false, error: "assinatura inválida" }, { status: 401 });

  let ev: { type?: string; data?: { email_id?: string } };
  try {
    ev = JSON.parse(corpo);
  } catch {
    return NextResponse.json({ ok: false, error: "json inválido" }, { status: 400 });
  }
  const emailId = ev.data?.email_id;
  if (!emailId) return NextResponse.json({ ok: true, ignorado: "sem email_id" });

  const coluna: Record<string, string> = {
    "email.delivered": "delivered_at = coalesce(delivered_at, now())",
    "email.opened": "opened_at = coalesce(opened_at, now())",
    "email.clicked": "clicked_at = coalesce(clicked_at, now()), opened_at = coalesce(opened_at, now())",
    "email.bounced": "bounced_at = coalesce(bounced_at, now())",
    "email.complained": "complained_at = coalesce(complained_at, now())",
  };
  const set = ev.type ? coluna[ev.type] : undefined;
  if (!set) return NextResponse.json({ ok: true, ignorado: ev.type ?? "sem tipo" });

  try {
    await withTx(async (q) => {
      const [antes] = await q<{ message_id: string; template_key: string; opened_at: string | null; clicked_at: string | null }>(
        "select message_id, template_key, opened_at, clicked_at from messages where provider_message_id = $1 for update",
        [emailId]
      );
      const [m] = await q<{ lead_id: string }>(
        `update messages set ${set} where provider_message_id = $1 returning lead_id`,
        [emailId]
      );
      if (!m) return;
      // Eventos de sucesso da entrega do resultado (Matriz, AUT_MAP_RESULT_DELIVERY).
      if (antes?.template_key === "map_result") {
        if (ev.type === "email.opened" && !antes.opened_at) {
          await registrarEvento(q, "ResultEmailOpened", { lead_id: m.lead_id, props: { message_id: antes.message_id } });
        }
        if (ev.type === "email.clicked" && !antes.clicked_at) {
          await registrarEvento(q, "ResultEmailClicked", { lead_id: m.lead_id, props: { message_id: antes.message_id } });
        }
      }
      if (ev.type === "email.bounced") {
        // Endereço inválido: para tudo, inclusive transacional (não chega mesmo).
        await q("update leads set email_bounced_at = coalesce(email_bounced_at, now()) where lead_id = $1", [m.lead_id]);
        await q(
          "update messages set status = 'cancelled', skip_reason = 'email_invalido' where lead_id = $1 and status = 'scheduled'",
          [m.lead_id]
        );
      }
      if (ev.type === "email.complained") {
        // Marcou como spam: vale como descadastro do marketing.
        await q(
          `update leads set marketing_email_allowed = false, unsubscribed_at = coalesce(unsubscribed_at, now())
           where lead_id = $1`,
          [m.lead_id]
        );
        await q(
          `update messages set status = 'cancelled', skip_reason = 'reclamou_spam'
           where lead_id = $1 and status = 'scheduled' and priority >= 3`,
          [m.lead_id]
        );
        await registrarEvento(q, "Unsubscribe", { lead_id: m.lead_id, props: { via: "spam" } });
      }
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    logErro("webhook resend", e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
