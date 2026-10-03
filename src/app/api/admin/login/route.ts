import { NextResponse } from "next/server";
import { ADMIN_COOKIE, makeToken, senhaConfere, adminConfigurado, SESSAO_ADMIN_SEGUNDOS } from "@/lib/admin-auth";
import { excedeuLimite } from "@/lib/epic/server/http";

export async function POST(request: Request) {
  if (!adminConfigurado()) {
    return NextResponse.json(
      { error: "ADMIN_PASSWORD não configurada no servidor." },
      { status: 500 }
    );
  }

  // Força bruta (auditoria NC-14): 5 tentativas por IP a cada 15 minutos.
  if (await excedeuLimite(request, "admin-login", 5, 900)) {
    console.warn("[admin] login bloqueado por excesso de tentativas");
    return NextResponse.json({ error: "Muitas tentativas. Espere 15 minutos e tente de novo." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Requisição inválida." }, { status: 400 });
  }

  const senha = (body as { senha?: unknown })?.senha;
  if (typeof senha !== "string" || !senhaConfere(senha)) {
    // Registro sem dado pessoal: só o fato e a hora (o log da Vercel já tem a hora).
    console.warn("[admin] tentativa de login com senha incorreta");
    return NextResponse.json({ error: "Senha incorreta." }, { status: 401 });
  }

  const token = makeToken();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, token!, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: SESSAO_ADMIN_SEGUNDOS,
  });
  return res;
}
