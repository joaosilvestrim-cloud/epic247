import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "epic_admin";

function getSecret(): string | null {
  return process.env.ADMIN_PASSWORD || null;
}

/** Validade da sessão do admin (auditoria NC-14: antes eram 30 dias e sem prazo no servidor). */
export const SESSAO_ADMIN_SEGUNDOS = 60 * 60 * 24 * 7;

function assinaturaToken(secret: string, expira: number): string {
  return createHmac("sha256", secret).update(`epic247-admin-v2:${expira}`).digest("hex");
}

/**
 * Token de sessão: "<expira em ms>.<hmac>". O prazo vai assinado dentro do
 * token, então um cookie copiado deixa de valer sozinho, mesmo sem trocar a
 * senha. Trocar ADMIN_PASSWORD derruba todas as sessões na hora.
 */
export function makeToken(agora = Date.now()): string | null {
  const secret = getSecret();
  if (!secret) return null;
  const expira = agora + SESSAO_ADMIN_SEGUNDOS * 1000;
  return `${expira}.${assinaturaToken(secret, expira)}`;
}

export function senhaConfere(senha: string): boolean {
  const secret = getSecret();
  if (!secret) return false;
  const a = Buffer.from(senha);
  const b = Buffer.from(secret);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function tokenConfere(token: string | undefined, agora = Date.now()): boolean {
  const secret = getSecret();
  if (!secret || !token) return false;
  const [expiraTxt, assinatura] = token.split(".");
  const expira = Number(expiraTxt);
  if (!Number.isFinite(expira) || expira < agora || !assinatura) return false;
  const a = Buffer.from(assinatura);
  const b = Buffer.from(assinaturaToken(secret, expira));
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

/** Verifica o cookie de sessão admin (uso em Server Components / rotas). */
export async function isAdmin(): Promise<boolean> {
  const store = await cookies();
  return tokenConfere(store.get(ADMIN_COOKIE)?.value);
}

/** Se a senha do admin foi configurada no ambiente. */
export function adminConfigurado(): boolean {
  return Boolean(getSecret());
}
