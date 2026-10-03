import { NextResponse, type NextRequest } from "next/server";

// Meu EPIC (CR-01A): a sessão de 30 dias é renovada a cada uso. O banco
// renova a validade (server/conta.ts); aqui só o cookie acompanha.
// Também marca toda a área como fora de busca e fora de cache público.

const COOKIE_CONTA = "epic_conta";
const TRINTA_DIAS = 30 * 24 * 60 * 60;

export function proxy(request: NextRequest) {
  const res = NextResponse.next();
  const sessao = request.cookies.get(COOKIE_CONTA)?.value;
  if (sessao) {
    res.cookies.set(COOKIE_CONTA, sessao, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: TRINTA_DIAS,
    });
  }
  res.headers.set("X-Robots-Tag", "noindex, nofollow");
  res.headers.set("Cache-Control", "private, no-store");
  return res;
}

export const config = {
  matcher: ["/meu-epic", "/meu-epic/:path*"],
};
