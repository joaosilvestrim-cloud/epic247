// Copy com status (Blueprint §30 e v1.2 §54.4, RF-087, RF-095).
// - string: texto APROVADO. Aparece sempre.
// - proposta(): texto da "Copy Final do Site" em PROPOSTA FINAL. É texto
//   do cliente, completo, aguardando a validação de Luiz/Ju (RC1 §8).
//   Aparece em todo ambiente; o status fica marcado no código e no admin.
// - pendente(): rascunho nosso. Só em staging, marcado.

export type Copy = string | { pendente: string } | { proposta: string };

export const pendente = (texto: string): Copy => ({ pendente: texto });
export const proposta = (texto: string): Copy => ({ proposta: texto });

export const IS_PRODUCTION = process.env.NEXT_PUBLIC_EPIC_ENV === "production";

/** Texto para lugares que não aceitam marcação (title, alt, metadata). */
export function copyText(v: Copy | null | undefined): string | null {
  if (v == null) return null;
  if (typeof v === "string") return v;
  if ("proposta" in v) return v.proposta;
  return IS_PRODUCTION ? null : v.pendente;
}

export function temCopy(v: Copy | null | undefined): boolean {
  return copyText(v) !== null;
}
