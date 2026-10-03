// Páginas legais com status de publicação (auditoria Entrega 01, NC-03/04/12;
// RC1 §15: revisão jurídica antes de produção).
//
// Enquanto uma página não estiver aprovada pelo jurídico e com os dados do
// controlador preenchidos:
//   - ela continua no ar, porque os formulários de consentimento apontam
//     para ela (a pessoa precisa conseguir ler como seus dados são usados);
//   - mostra que é uma versão provisória em revisão;
//   - nunca mostra placeholder ([RAZÃO SOCIAL] etc.);
//   - fica fora do sitemap e com noindex.
// Quando o jurídico aprovar: preencher CONTROLADOR, marcar aprovado e
// atualizar a versão (que vai junto de cada consentimento, RF-063).

export interface Controlador {
  razaoSocial: string | null;
  cnpj: string | null;
  emailPrivacidade: string | null;
}

export const CONTROLADOR: Controlador = {
  razaoSocial: null,
  cnpj: null,
  emailPrivacidade: null,
};

export const PAGINAS_LEGAIS = {
  privacidade: { versao: "2026-10-01", aprovadaJuridico: false },
  termos: { versao: "2026-10-01", aprovadaJuridico: false },
} as const;

export type PaginaLegal = keyof typeof PAGINAS_LEGAIS;

export function controladorCompleto(c: Controlador = CONTROLADOR): boolean {
  return Boolean(c.razaoSocial && c.cnpj && c.emailPrivacidade);
}

/** Publicável de verdade (indexável, no sitemap): aprovada e, na privacidade, com controlador. */
export function legalPublicavel(pagina: PaginaLegal, c: Controlador = CONTROLADOR): boolean {
  const p = PAGINAS_LEGAIS[pagina];
  if (!p.aprovadaJuridico) return false;
  return pagina === "privacidade" ? controladorCompleto(c) : true;
}

export const AVISO_PROVISORIO =
  "Versão provisória, em revisão jurídica. O que está descrito aqui reflete o que o site faz hoje.";
