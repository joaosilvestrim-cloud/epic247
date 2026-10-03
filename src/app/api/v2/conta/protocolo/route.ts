import { NextResponse } from "next/server";
import { isDimensionId } from "@/lib/epic/dimensions";
import { temProtocolo } from "@/lib/epic/meu-epic";
import { acessosDoLead, marcarConclusao } from "@/lib/epic/server/acessos";
import { contaAtual } from "@/lib/epic/server/conta";
import { withTx } from "@/lib/epic/server/db";

/** "Concluí esta dimensão" (D9): ação explícita de quem tem o Protocolo. */
export async function POST(req: Request) {
  const f = await req.formData().catch(() => null);
  const d = String(f?.get("dimensao") ?? "");
  const concluida = f?.get("concluida") === "1";
  if (!isDimensionId(d)) return NextResponse.redirect(new URL("/meu-epic/produtos/protocolo", req.url), 303);
  const conta = await contaAtual().catch(() => null);
  if (!conta) return NextResponse.redirect(new URL(`/meu-epic/entrar?volta=/meu-epic/produtos/protocolo/${d}`, req.url), 303);
  await withTx(async (q) => {
    if (!temProtocolo(await acessosDoLead(q, conta.leadId))) return;
    await marcarConclusao(q, conta.leadId, d, concluida);
  });
  return NextResponse.redirect(new URL(`/meu-epic/produtos/protocolo/${d}`, req.url), 303);
}
