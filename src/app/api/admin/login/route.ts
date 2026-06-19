import { NextResponse } from "next/server";
import { ADMIN_COOKIE, makeToken, senhaConfere, adminConfigurado } from "@/lib/admin-auth";

export async function POST(request: Request) {
  if (!adminConfigurado()) {
    return NextResponse.json(
      { error: "ADMIN_PASSWORD não configurada no servidor." },
      { status: 500 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Requisição inválida." }, { status: 400 });
  }

  const senha = (body as { senha?: unknown })?.senha;
  if (typeof senha !== "string" || !senhaConfere(senha)) {
    return NextResponse.json({ error: "Senha incorreta." }, { status: 401 });
  }

  const token = makeToken();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, token!, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 dias
  });
  return res;
}
