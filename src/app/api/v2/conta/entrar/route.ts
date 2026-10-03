import { NextResponse } from "next/server";
import { entrar } from "@/lib/epic/server/conta";
import { excedeuLimite, logErro } from "@/lib/epic/server/http";

/** Consome o link de entrada (POST do botão "Entrar") e abre a sessão. */
export async function POST(req: Request) {
  const f = await req.formData().catch(() => null);
  const token = String(f?.get("token") ?? "");
  if (await excedeuLimite(req, "conta-entrar", 20, 900)) {
    return NextResponse.redirect(new URL("/meu-epic/entrar?erro=limite", req.url), 303);
  }
  try {
    const r = await entrar(token);
    if (!r) return NextResponse.redirect(new URL("/meu-epic/entrar?erro=expirado", req.url), 303);
    return NextResponse.redirect(new URL(r.destino, req.url), 303);
  } catch (e) {
    logErro("v2/conta/entrar", e);
    return NextResponse.redirect(new URL("/meu-epic/entrar?erro=falha", req.url), 303);
  }
}
