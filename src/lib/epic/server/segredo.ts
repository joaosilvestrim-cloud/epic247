import "server-only";

// Segredo do site (EPIC_SECRET): assina links, hash de IP do rate limit e
// webhooks de saída. Auditoria NC-13: sem segredo fixo de reserva.
// Produção sem EPIC_SECRET falha de forma explícita; só desenvolvimento e
// teste local usam um valor de reserva, com aviso.

let avisado = false;

export function segredoDoSite(): string {
  const s = process.env.EPIC_SECRET;
  if (s && s.length >= 16) return s;
  if (process.env.NEXT_PUBLIC_EPIC_ENV === "production" || process.env.VERCEL_ENV === "production") {
    throw new Error("EPIC_SECRET ausente ou curto demais em produção (mínimo 16 caracteres)");
  }
  if (!avisado) {
    console.warn("[epic] EPIC_SECRET ausente: usando valor de desenvolvimento. Nunca em produção.");
    avisado = true;
  }
  return "epic247-somente-desenvolvimento";
}
