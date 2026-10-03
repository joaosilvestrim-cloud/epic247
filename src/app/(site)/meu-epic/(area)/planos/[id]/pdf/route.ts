import { NextResponse } from "next/server";
import { DIMENSIONS, isDimensionId } from "@/lib/epic/dimensions";
import { estadoPlano } from "@/lib/epic/meu-epic";
import { planoEmPdf } from "@/lib/epic/plano/pdf";
import { contaAtual } from "@/lib/epic/server/conta";
import { listarConteudos, TIPO_ROTA } from "@/lib/epic/server/conteudo";
import { withTx } from "@/lib/epic/server/db";
import { registrarEvento } from "@/lib/epic/server/events";
import { logErro } from "@/lib/epic/server/http";
import { planoDaConta } from "@/lib/epic/server/planos";
import { SITE_URL } from "@/lib/epic/emails/layout";

/** PDF do Plano (D7): derivado do Plano persistido, só para o dono com acesso ativo. */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const conta = await contaAtual().catch(() => null);
  if (!conta) return NextResponse.redirect(new URL(`/meu-epic/entrar?volta=/meu-epic/planos/${id}`, req.url), 303);
  try {
    const g = await withTx(async (q) => {
      const plano = await planoDaConta(q, conta.leadId, id);
      if (!plano || plano.access_status !== "active" || estadoPlano(plano) !== "ready" || !plano.content) return null;
      await registrarEvento(q, "DownloadPlanPDF", {
        lead_id: conta.leadId, product_id: plano.product_id, product_type: "plan", dimension: plano.dimensao,
        props: { plan_generation_id: plano.plan_generation_id, versao: plano.output_version },
      });
      return plano;
    });
    if (!g?.content) return new NextResponse("Não encontrado.", { status: 404 });
    const nome = isDimensionId(g.dimensao) ? DIMENSIONS[g.dimensao].name : "";
    const [rec] = await listarConteudos({ dimensao: g.content.dimensao, limite: 1 });
    const bytes = await planoEmPdf(g.content, {
      dimensaoNome: nome,
      recomendado: rec ? { titulo: rec.title, url: `${SITE_URL}/ideias/${TIPO_ROTA[rec.content_type]}/${rec.slug}` } : null,
    });
    return new NextResponse(Buffer.from(bytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="plano-epic-${g.dimensao}-7-dias.pdf"`,
        "Cache-Control": "private, no-store",
        "X-Robots-Tag": "noindex, nofollow",
      },
    });
  } catch (e) {
    logErro("meu-epic/plano/pdf", e);
    return new NextResponse("Não foi possível gerar o PDF agora.", { status: 500 });
  }
}
