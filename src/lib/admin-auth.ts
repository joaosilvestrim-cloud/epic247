import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "epic_admin";

function getSecret(): string | null {
  return process.env.ADMIN_PASSWORD || null;
}

/** Token determinístico derivado da senha do admin. */
export function makeToken(): string | null {
  const secret = getSecret();
  if (!secret) return null;
  return createHmac("sha256", secret).update("epic247-admin-v1").digest("hex");
}

export function senhaConfere(senha: string): boolean {
  const secret = getSecret();
  if (!secret) return false;
  const a = Buffer.from(senha);
  const b = Buffer.from(secret);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function tokenConfere(token: string | undefined): boolean {
  const esperado = makeToken();
  if (!esperado || !token) return false;
  const a = Buffer.from(token);
  const b = Buffer.from(esperado);
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
