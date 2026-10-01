// Copy com status (Blueprint §30, RF-087, RF-095).
// - string: texto APROVADO (vem dos documentos oficiais). Aparece sempre.
// - { pendente }: rascunho aguardando aprovação. Aparece só em staging,
//   marcado; em produção vira nada, e o bloco que depende dele some.

export type Copy = string | { pendente: string };

export const pendente = (texto: string): Copy => ({ pendente: texto });

export const IS_PRODUCTION = process.env.NEXT_PUBLIC_EPIC_ENV === "production";

/** Texto para lugares que não aceitam marcação (title, alt, metadata). */
export function copyText(v: Copy | null | undefined): string | null {
  if (v == null) return null;
  if (typeof v === "string") return v;
  return IS_PRODUCTION ? null : v.pendente;
}

export function temCopy(v: Copy | null | undefined): boolean {
  return copyText(v) !== null;
}
