import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { getDetalheOrigem, periodoValido } from "@/lib/origem-resumo";

/** Funil, abandono do quiz e perfil para a aba Origem do /admin. */
export async function GET(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }
  const q = new URL(request.url).searchParams;
  const source = q.get("source")?.slice(0, 120) || null;
  const medium = source ? (q.get("medium") ?? "").slice(0, 120) : null;

  const detalhe = await getDetalheOrigem(periodoValido(q.get("periodo")), source, medium);
  return NextResponse.json(detalhe, { headers: { "Cache-Control": "no-store" } });
}
