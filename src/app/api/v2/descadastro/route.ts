import { NextResponse } from "next/server";
import { conferir } from "@/lib/epic/server/assinatura";
import { withTx } from "@/lib/epic/server/db";
import { registrarEvento } from "@/lib/epic/server/events";
import { logErro } from "@/lib/epic/server/http";

/**
 * Descadastro (RF-062, Matriz AUT_UNSUBSCRIBE). Aceita o POST de um clique
 * dos provedores de e-mail (RFC 8058) e o formulário da página /descadastro.
 * Transacionais necessários continuam (o que a pessoa comprou ou pediu).
 */
export async function POST(req: Request) {
  const url = new URL(req.url);
  let lead = url.searchParams.get("l") ?? "";
  let t = url.searchParams.get("t") ?? "";
  if (!lead) {
    const form = await req.formData().catch(() => null);
    lead = String(form?.get("l") ?? "");
    t = String(form?.get("t") ?? "");
  }
  if (!/^[0-9a-f-]{36}$/i.test(lead) || !conferir(lead, "descadastro", t)) {
    return NextResponse.json({ ok: false, error: "Link inválido." }, { status: 400 });
  }
  try {
    await withTx(async (q) => {
      await q(
        `update leads set marketing_email_allowed = false, unsubscribed_at = coalesce(unsubscribed_at, now())
         where lead_id = $1`,
        [lead]
      );
      await q(
        `update messages set status = 'cancelled', skip_reason = 'descadastro'
         where lead_id = $1 and status = 'scheduled' and priority >= 3`,
        [lead]
      );
      await registrarEvento(q, "Unsubscribe", { lead_id: lead });
    });
    const aceitaHtml = req.headers.get("accept")?.includes("text/html");
    return aceitaHtml
      ? NextResponse.redirect(new URL("/descadastro?ok=1", req.url), 303)
      : NextResponse.json({ ok: true });
  } catch (e) {
    logErro("v2/descadastro", e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
