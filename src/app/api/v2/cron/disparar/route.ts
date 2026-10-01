import { NextResponse } from "next/server";
import { enviarFilaCrm } from "@/lib/epic/server/crm";
import { agendarInativos, dispararFila } from "@/lib/epic/server/dispatcher";
import { logErro } from "@/lib/epic/server/http";

/**
 * Disparo da fila de e-mails. Chamado por agendador (pg_cron no Supabase
 * em produção, ou Vercel Cron) com Authorization: Bearer CRON_SECRET.
 */
async function executar(req: Request) {
  const segredo = process.env.CRON_SECRET;
  if (!segredo || req.headers.get("authorization") !== `Bearer ${segredo}`) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  try {
    const inativos = await agendarInativos();
    const rel = await dispararFila(40);
    const crm = await enviarFilaCrm(50);
    return NextResponse.json({ ok: true, inativos, ...rel, crm });
  } catch (e) {
    logErro("v2/cron/disparar", e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

// Até 40 envios por rodada, cada um com uma chamada ao Resend.
export const maxDuration = 60;

export const GET = executar;
export const POST = executar;
