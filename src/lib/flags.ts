/**
 * Flags de lançamento — Ciclo 1 (reunião 17/09/2026, Luiz + João).
 *
 * Nada aqui foi excluído do código. Tudo o que está `false` volta a aparecer
 * ao trocar o valor para `true`, sem precisar reescrever seção nenhuma.
 * A previsão combinada é reativar no Ciclo 2, quando a VSL e os depoimentos
 * reais estiverem prontos.
 */

/** Vídeo/VSL no hero. Volta no Ciclo 2, com a VSL da Ju gravada. */
export const SHOW_HERO_VIDEO = false;

/** Seção "O que muda em 30 dias". Volta quando houver depoimentos reais. */
export const SHOW_DEPOIMENTOS = false;

/**
 * Tudo que promete "plataforma de monitoramento da Bateria Vital" e
 * "check-in diário". Não é entregável do Kiwify hoje, então sai da página
 * para não gerar dúvida. A entrega real é Manual, Workbook e Livro digital.
 */
export const SHOW_PLATAFORMA_BATERIA_VITAL = false;

/** Bloco do order bump na LP. O Kiwify já mostra isso sozinho no checkout. */
export const SHOW_ORDER_BUMP_NA_LP = false;

/** Link do /admin no rodapé público. */
export const SHOW_ADMIN_NO_RODAPE = false;

/** Prazo de garantia, alinhado ao reembolso automático do Kiwify. */
export const GARANTIA_DIAS = 7;
