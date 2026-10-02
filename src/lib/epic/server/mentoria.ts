import "server-only";
import { SITE_URL } from "../emails/layout";
import { assinar, conferir } from "./assinatura";

// Link de pagamento da Mentoria (RC1 §5 e §6). O e-mail leva a pessoa a
// uma rota do próprio site, assinada, que confere se o link ainda vale,
// registra o StartCheckout e só então redireciona para a Kiwify. Assim o
// checkout nunca fica exposto antes da vaga confirmada.

const FINALIDADE = "mentoria_pagamento";

export function linkPagamentoMentoria(candidaturaId: string): string {
  return `${SITE_URL}/mentoria/pagamento?a=${candidaturaId}&t=${assinar(candidaturaId, FINALIDADE)}`;
}

export function linkPagamentoValido(candidaturaId: string, t: string): boolean {
  return conferir(candidaturaId, FINALIDADE, t);
}
