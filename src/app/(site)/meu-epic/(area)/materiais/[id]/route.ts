import { NextResponse } from "next/server";
import { urlDeDownload } from "@/lib/epic/server/acessos";
import { contaAtual } from "@/lib/epic/server/conta";
import { withTx } from "@/lib/epic/server/db";
import { logErro } from "@/lib/epic/server/http";

/**
 * Download de material pago (CR-01A, storage): confere sessão e acesso a
 * cada pedido e entrega uma URL assinada que expira em 60 segundos.
 * Nenhum arquivo pago tem endereço público permanente.
 */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const conta = await contaAtual().catch(() => null);
  if (!conta) return NextResponse.redirect(new URL("/meu-epic/entrar?volta=/meu-epic/produtos", req.url), 303);
  try {
    const url = await withTx((q) => urlDeDownload(q, conta.leadId, id));
    if (!url) return new NextResponse("Material indisponível para esta conta.", { status: 404 });
    return NextResponse.redirect(url, { status: 303, headers: { "Cache-Control": "private, no-store" } });
  } catch (e) {
    logErro("meu-epic/materiais", e);
    return new NextResponse("Não foi possível abrir o material agora.", { status: 500 });
  }
}
