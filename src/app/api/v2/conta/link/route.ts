import { NextResponse } from "next/server";
import { pedirLink } from "@/lib/epic/server/conta";
import { excedeuLimite, logErro } from "@/lib/epic/server/http";
import { emailValido } from "@/lib/epic/server/identity";
import { destinoSeguro } from "@/lib/epic/meu-epic";

/**
 * Pedido de link de entrada no Meu EPIC. Formulário comum (funciona sem
 * JavaScript): sempre volta para a mesma tela de "enviamos", exista ou não a
 * conta, para não revelar quem é cliente.
 */
export async function POST(req: Request) {
  const f = await req.formData().catch(() => null);
  const email = String(f?.get("email") ?? "").trim();
  const volta = destinoSeguro(f?.get("volta"));
  const base = new URL("/meu-epic/entrar", req.url);
  base.searchParams.set("volta", volta);
  if (!emailValido(email)) {
    base.searchParams.set("erro", "email");
    return NextResponse.redirect(base, 303);
  }
  if (await excedeuLimite(req, "conta-link", 5, 900)) {
    base.searchParams.set("erro", "limite");
    return NextResponse.redirect(base, 303);
  }
  try {
    await pedirLink(email, volta);
  } catch (e) {
    logErro("v2/conta/link", e);
  }
  base.searchParams.set("enviado", "1");
  return NextResponse.redirect(base, 303);
}
