import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { withTx } from "@/lib/epic/server/db";

const UUID = /^[0-9a-f-]{36}$/i;

/** Exporta tudo o que o banco guarda sobre uma pessoa (pedido de acesso, LGPD art. 18). */
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  const { id } = await params;
  if (!UUID.test(id)) return NextResponse.json({ error: "Id inválido." }, { status: 400 });

  const dados = await withTx(async (q) => {
    const ids = (await q<{ lead_id: string }>("select lead_id from leads where lead_id = $1 or merged_into = $1", [id])).map((r) => r.lead_id);
    if (!ids.length) return null;
    const por = (sql: string) => q(sql, [ids]);
    return {
      exportado_em: new Date().toISOString(),
      lead: await por("select * from leads where lead_id = any($1)"),
      sessoes: await por("select * from sessions where lead_id = any($1) order by session_started_at"),
      mapas: await por("select * from map_results where lead_id = any($1) order by started_at"),
      compras: await por("select * from transactions where lead_id = any($1) order by created_at"),
      planos: await por(
        "select plan_generation_id, map_result_id, product_id, generated_at, content from plan_generations where lead_id = any($1)"
      ),
      mensagens: await por(
        "select automation_id, step, status, scheduled_for, sent_at, subject from messages where lead_id = any($1) order by scheduled_for"
      ),
      eventos: await por("select * from events where lead_id = any($1) order by occurred_at"),
      candidatura_mentoria: await por("select * from mentoring_applications where lead_id = any($1)"),
      contato: await por("select * from contact_messages where lead_id = any($1)"),
    };
  });
  if (!dados) return NextResponse.json({ error: "Não encontrado." }, { status: 404 });

  return new NextResponse(JSON.stringify(dados, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="epic247-lead-${id}.json"`,
      "Cache-Control": "no-store",
    },
  });
}
