// Estrutura do Plano EPIC 7 Dias de cada dimensão, transcrita da seção
// "Plano EPIC [Dimensão] — R$29" de cada documento de Mapa (pasta 08).
// Texto APROVADO (títulos dos blocos). O conteúdo de cada bloco vem do
// gerador; o que o documento não traz vira campo para a pessoa preencher,
// como num caderno de trabalho.

import type { DimensionId } from "../dimensions";

export const ESTRUTURA_PLANO: Record<DimensionId, string[]> = {
  energia: [
    "Seu foco dos próximos 7 dias", "O padrão a observar", "Uma coisa para reduzir", "Três movimentos simples",
    "Prática diária mínima", "Pergunta de reflexão", "Um conteúdo recomendado", "Critério de revisão no dia 7",
    "Próximo passo: Kit Energia",
  ],
  mentalidade: [
    "Seu foco dos próximos 7 dias", "Padrão mental a observar", "Pensamento recorrente", "Crença operacional a testar",
    "Um erro para transformar em dado", "Uma justificativa a investigar", "Uma pausa funcional entre estímulo e resposta",
    "Pergunta de reflexão", "Um conteúdo recomendado", "Revisão no dia 7", "Próximo passo: Kit Mentalidade",
  ],
  autoconhecimento: [
    "Seu foco dos próximos 7 dias", "Eu Atual: o padrão a observar", "Eu Futuro: a direção que deseja testar",
    "Valor central em tensão", "Uma crença ou expectativa a investigar", "Um “sim” ou “não” que precisa ser percebido",
    "Uma ação de alinhamento", "Pergunta de reflexão", "Um conteúdo recomendado", "Revisão no dia 7",
    "Próximo passo: Kit Autoconhecimento",
  ],
  felicidade: [
    "Seu foco dos próximos 7 dias", "O padrão a observar", "Um momento a saborear", "Uma atividade de engajamento",
    "Uma relação a nutrir", "Uma pergunta de significado", "Um progresso a reconhecer", "Um micro-hábito diário",
    "Pergunta de reflexão", "Um conteúdo recomendado", "Revisão no dia 7", "Próximo passo: Kit Felicidade",
  ],
  planejamento: [
    "Seu foco dos próximos 7 dias", "Resultado que importa", "Por que esse resultado importa", "Recursos e restrições atuais",
    "Uma prioridade protegida", "Próximo passo executável", "Indicador simples de progresso", "Plano B ou gatilho de revisão",
    "Pergunta de reflexão", "Um conteúdo recomendado", "Revisão no dia 7", "Próximo passo: Kit Planejamento",
  ],
  coragem: [
    "Seu foco dos próximos 7 dias", "A decisão ou situação a observar", "A ameaça imaginada mais recorrente",
    "O que está sob seu controle", "O que pode ser prevenido", "O que pode ser reparado", "Custo da inércia",
    "Uma microexposição ou microação de travessia", "Pergunta de reflexão", "Um conteúdo recomendado", "Revisão no dia 7",
    "Próximo passo: Kit Coragem",
  ],
  acao: [
    "Seu foco dos próximos 7 dias", "O padrão a observar", "Uma coisa para reduzir", "Três movimentos simples",
    "Uma ação mínima diária", "Gatilho de execução", "Regra de retomada", "Pergunta de reflexão", "Um conteúdo recomendado",
    "Revisão no dia 7", "Próximo passo: Kit Ação",
  ],
  inteligencia: [
    "Seu foco dos próximos 7 dias", "O imprevisto ou padrão a observar", "Fato objetivo x interpretação",
    "Estado emocional predominante", "Recurso de retorno disponível", "Aprendizado extraído", "Rota alternativa possível",
    "Próxima microação", "Uma pessoa/rede de apoio a acionar quando necessário", "Pergunta de reflexão",
    "Um conteúdo recomendado", "Revisão no dia 7", "Próximo passo: Kit Inteligência",
  ],
  excelencia: [
    "Seu foco dos próximos 7 dias", "O padrão atual a observar", "O que significa “bom o suficiente” nessa área",
    "Uma sub-habilidade a treinar", "Uma sessão curta de prática deliberada", "Uma fonte de feedback",
    "Um ciclo manter / ajustar / elevar", "Uma micro melhoria de 1%", "Uma ação de cuidado ou extra mile proporcional",
    "Pergunta de reflexão", "Revisão no dia 7", "Próximo passo: Kit Excelência",
  ],
  amor: [
    "Seu foco dos próximos 7 dias", "Relação ou situação a observar", "Um micro-momento diário de presença",
    "Uma conversa ou gesto de conexão", "Um exercício breve de autocompaixão", "Um ponto de pertencimento a reconhecer ou proteger",
    "Uma ação de compartilhamento ou contribuição", "Uma prática de gratidão ou reconhecimento", "Pergunta de reflexão",
    "Um conteúdo recomendado", "Revisão no dia 7", "Próximo passo: Kit Amor",
  ],
};

export type TipoBloco =
  | "foco" | "observar" | "reduzir" | "movimentos" | "pratica" | "gatilho" | "retomada"
  | "pergunta" | "conteudo" | "revisao" | "proximo" | "campo";

/** Que conteúdo do gerador preenche cada bloco; o resto vira campo para escrever. */
export function tipoDoBloco(titulo: string): TipoBloco {
  const t = titulo.toLowerCase();
  if (t.startsWith("seu foco")) return "foco";
  if (t.startsWith("próximo passo: kit")) return "proximo";
  if (t.includes("revisão no dia 7")) return "revisao";
  if (t.includes("conteúdo recomendado")) return "conteudo";
  if (t === "pergunta de reflexão") return "pergunta";
  if (t.includes("a observar")) return "observar";
  if (t === "uma coisa para reduzir") return "reduzir";
  if (t === "três movimentos simples") return "movimentos";
  if (t === "prática diária mínima" || t === "uma ação mínima diária" || t === "um micro-hábito diário") return "pratica";
  if (t === "gatilho de execução") return "gatilho";
  if (t === "regra de retomada") return "retomada";
  return "campo";
}
