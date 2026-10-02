// Depoimentos reais (Blueprint §7, TestimonialBlock). Vazio até existirem
// depoimentos de clientes com autorização por escrito para uso público.
// "autorizado: false" nunca aparece no site.

export type LugarDepoimento = "home" | "protocolo" | "mentoria" | "kit" | "plano";

export interface Depoimento {
  texto: string;
  nome: string;
  contexto?: string;
  lugares: LugarDepoimento[];
  autorizado: boolean;
}

export const DEPOIMENTOS: Depoimento[] = [];
