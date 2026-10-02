// Conteúdo das páginas de produto. Tudo transcrito dos documentos (APROVADO):
// estrutura do Plano por Mapa ("10. PLANO EPIC [X] — R$29 · Estrutura"),
// função do Kit ("12. KIT [X] — R$97"), composição do Protocolo e formato
// da Mentoria (Produtos e Pricing v1.0).

import type { DimensionId } from "../dimensions";

export const ESTRUTURA_PLANO: Record<DimensionId, string[]> = {
  energia: [
    "Seu foco dos próximos 7 dias", "O padrão a observar", "Uma coisa para reduzir", "Três movimentos simples",
    "Prática diária mínima", "Pergunta de reflexão", "Um conteúdo recomendado", "Critério de revisão no dia 7",
    "Próximo passo: Kit Energia",
  ],
  acao: [
    "Seu foco dos próximos 7 dias", "O padrão a observar", "Uma coisa para reduzir", "Três movimentos simples",
    "Uma ação mínima diária", "Gatilho de execução", "Regra de retomada", "Pergunta de reflexão",
    "Um conteúdo recomendado", "Revisão no dia 7", "Próximo passo: Kit Ação",
  ],
  coragem: [
    "Seu foco dos próximos 7 dias", "A decisão ou situação a observar", "A ameaça imaginada mais recorrente",
    "O que está sob seu controle", "O que pode ser prevenido", "O que pode ser reparado", "Custo da inércia",
    "Uma microexposição ou microação de travessia", "Pergunta de reflexão", "Um conteúdo recomendado",
    "Revisão no dia 7", "Próximo passo: Kit Coragem",
  ],
  autoconhecimento: [
    "Seu foco dos próximos 7 dias", "Eu Atual: o padrão a observar", "Eu Futuro: a direção que deseja testar",
    "Valor central em tensão", "Uma crença ou expectativa a investigar", "Um “sim” ou “não” que precisa ser percebido",
    "Uma ação de alinhamento", "Pergunta de reflexão", "Um conteúdo recomendado", "Revisão no dia 7",
    "Próximo passo: Kit Autoconhecimento",
  ],
  mentalidade: [
    "Seu foco dos próximos 7 dias", "Padrão mental a observar", "Pensamento recorrente", "Crença operacional a testar",
    "Um erro para transformar em dado", "Uma justificativa a investigar", "Uma pausa funcional entre estímulo e resposta",
    "Pergunta de reflexão", "Um conteúdo recomendado", "Revisão no dia 7", "Próximo passo: Kit Mentalidade",
  ],
  felicidade: [
    "Seu foco dos próximos 7 dias", "O padrão a observar", "Um momento a saborear", "Uma atividade de engajamento",
    "Uma relação a nutrir", "Uma pergunta de significado", "Um progresso a reconhecer", "Um micro-hábito diário",
    "Pergunta de reflexão", "Um conteúdo recomendado", "Revisão no dia 7", "Próximo passo: Kit Felicidade",
  ],
  planejamento: [
    "Seu foco dos próximos 7 dias", "Resultado que importa", "Por que esse resultado importa",
    "Recursos e restrições atuais", "Uma prioridade protegida", "Próximo passo executável",
    "Indicador simples de progresso", "Plano B ou gatilho de revisão", "Pergunta de reflexão",
    "Um conteúdo recomendado", "Revisão no dia 7", "Próximo passo: Kit Planejamento",
  ],
  inteligencia: [
    "Seu foco dos próximos 7 dias", "O imprevisto ou padrão a observar", "Fato objetivo x interpretação",
    "Estado emocional predominante", "Recurso de retorno disponível", "Aprendizado extraído",
    "Rota alternativa possível", "Próxima microação", "Uma pessoa/rede de apoio a acionar quando necessário",
    "Pergunta de reflexão", "Um conteúdo recomendado", "Revisão no dia 7", "Próximo passo: Kit Inteligência",
  ],
  excelencia: [
    "Seu foco dos próximos 7 dias", "O padrão atual a observar", "O que significa “bom o suficiente” nessa área",
    "Uma sub-habilidade a treinar", "Uma sessão curta de prática deliberada", "Uma fonte de feedback",
    "Um ciclo manter / ajustar / elevar", "Uma micro melhoria de 1%", "Uma ação de cuidado ou extra mile proporcional",
    "Pergunta de reflexão", "Revisão no dia 7", "Próximo passo: Kit Excelência",
  ],
  amor: [
    "Seu foco dos próximos 7 dias", "Relação ou situação a observar", "Um micro-momento diário de presença",
    "Uma conversa ou gesto de conexão", "Um exercício breve de autocompaixão",
    "Um ponto de pertencimento a reconhecer ou proteger", "Uma ação de compartilhamento ou contribuição",
    "Uma prática de gratidão ou reconhecimento", "Pergunta de reflexão", "Um conteúdo recomendado",
    "Revisão no dia 7", "Próximo passo: Kit Amor",
  ],
};

/** "Função após o Mapa" do Kit de cada dimensão. */
export const FUNCAO_KIT: Record<DimensionId, string> = {
  energia: "aprofundar a compreensão e a aplicação sobre o dreno dominante e os demais drenos.",
  acao: "aprofundar a compreensão do padrão, reduzir fricção e construir um sistema de execução mais sustentável.",
  coragem:
    "aprofundar conversas internas, emoções paralisantes, análise de medo, prevenção, reparo, custo da inércia, exposição gradual e ritual de partida.",
  autoconhecimento:
    "aprofundar Eu Atual, Eu Futuro, valores, crenças, autoimagem, feedback externo, o que manter/o que mudar e plano de alinhamento.",
  mentalidade:
    "aprofundar crenças operacionais, interpretação do erro, autossabotagem, decisão e mindfulness funcional.",
  felicidade:
    "aprofundar o modelo PERMA, micro-hábitos de felicidade e aplicação prática de emoções positivas, engajamento, relações, significado e realização.",
  planejamento:
    "aprofundar definição de resultado, levantamento de recursos e restrições, modelagem, metas, priorização, indicadores, Plano B e planejamento dinâmico.",
  inteligencia:
    "aprofundar resiliência, recomposição de estado, aprendizagem com obstáculos, inteligência emocional, inteligência social e uso responsável de Inteligência Artificial como apoio.",
  excelencia:
    "aprofundar micro melhoria, padrão mínimo, prática deliberada, zonas de aprendizado, cultura de excelência, feedback, refinamento e extra mile.",
  amor:
    "aprofundar conexão, micro-momentos, amor-próprio, autocompaixão, perdão, gratidão, entusiasmo, compartilhamento, celebração e legado.",
};

export const PROTOCOLO = {
  composicao: [
    "10 Manuais",
    "10 Workbooks",
    "Ferramentas",
    "Sequência recomendada",
    "Mapa de progresso",
    "Orientações de aplicação",
  ],
};

export const MENTORIA = {
  formato: [
    "Leitura inicial do contexto",
    "4 encontros ao longo de 6 semanas",
    "Plano EPIC individual",
    "Tarefas entre encontros",
    "Materiais selecionados",
    "Acompanhamento estruturado",
  ],
};
