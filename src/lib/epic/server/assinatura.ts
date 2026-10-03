import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { segredoDoSite } from "./segredo";

// Links assinados (descadastro). Sem login: o link do e-mail prova que a
// pessoa tem acesso àquela caixa. A assinatura impede descadastrar terceiros.

const segredo = segredoDoSite;

export function assinar(valor: string, finalidade: string): string {
  return createHmac("sha256", segredo()).update(`${finalidade}:${valor}`).digest("base64url").slice(0, 32);
}

export function conferir(valor: string, finalidade: string, assinatura: string): boolean {
  if (!assinatura) return false;
  const a = Buffer.from(assinar(valor, finalidade));
  const b = Buffer.from(assinatura);
  return a.length === b.length && timingSafeEqual(a, b);
}
