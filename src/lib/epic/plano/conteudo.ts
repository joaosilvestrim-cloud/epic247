// Conteúdo do Plano EPIC 7 Dias por perfil.
//
// "foco" = "Lógica preliminar do Plano por perfil" de cada documento de Mapa
// (texto APROVADO). Energia não tem essa seção no documento: o foco de
// Energia é rascunho.
//
// "reduzir", "movimentos" e "pratica" = RASCUNHO para a Ju aprovar. Onda 1
// (Energia e Ação) tem rascunho completo por perfil; as demais dimensões
// usam só o foco aprovado + o primeiro movimento do Mapa até o texto vir.

import type { DimensionId } from "../dimensions";

export interface ConteudoPerfil {
  foco: string;
  focoAprovado: boolean;
  reduzir?: string;
  movimentos?: [string, string, string];
  pratica?: string;
  gatilho?: string;
  retomada?: string;
  /**
   * Relatório por e-mail (seção 9 de cada Mapa): "3 sinais cotidianos ligados
   * ao padrão" e "pergunta de observação". Os documentos pedem esses itens mas
   * não trazem o texto: entram aqui quando forem escritos e aprovados.
   */
  sinais?: [string, string, string];
  perguntaObservacao?: string;
}

type Mapa = Record<string, ConteudoPerfil>;

const ENERGIA: Mapa = {
  sono: {
    foco: "Separar dormir de recuperar: observar regularidade e sensação ao acordar antes de mudar qualquer coisa.",
    focoAprovado: false,
    reduzir: "Uma tela ou estímulo nos 30 minutos antes de deitar.",
    movimentos: [
      "Escolher um horário de acordar e mantê-lo nos 7 dias, inclusive no fim de semana.",
      "Criar um sinal de fim de dia: o mesmo gesto, todas as noites, no mesmo horário aproximado.",
      "Expor-se à luz natural nos primeiros 30 minutos depois de acordar.",
    ],
    pratica: "Ao acordar, anotar o horário aproximado de sono e uma palavra para a sensação de recuperação.",
  },
  combustivel: {
    foco: "Encontrar o padrão das quedas antes de procurar a solução: picos e quedas viram ritmo quando ficam visíveis.",
    focoAprovado: false,
    reduzir: "Um período longo do dia sem nenhuma pausa para comer.",
    movimentos: [
      "Marcar no calendário o horário das duas refeições que mais costumam ser puladas.",
      "Ter à mão uma opção simples para o horário em que a queda costuma aparecer.",
      "Trocar um estímulo de compensação (café extra, açúcar) por uma pausa curta de 5 minutos, uma vez por dia.",
    ],
    pratica: "Anotar os horários em que a disposição cai e o que aconteceu nas 2 horas anteriores.",
  },
  alerta: {
    foco: "Marcar fronteiras entre demanda e pausa, para o sistema perceber que o dia terminou.",
    focoAprovado: false,
    reduzir: "Uma checagem de mensagens depois do horário em que o seu dia deveria ter acabado.",
    movimentos: [
      "Definir um horário de encerramento do dia e fazer um ritual curto de fechamento.",
      "Fazer uma pausa real de 3 minutos sem estímulos no meio da tarde.",
      "Escolher um momento da semana para não estar disponível, e avisar quem precisa saber.",
    ],
    pratica: "Três minutos no fim do dia, sem estímulos, percebendo a transição entre demanda e pausa.",
  },
  atencao: {
    foco: "Proteger blocos curtos sem fragmentação e comparar como você termina cada tipo de período.",
    focoAprovado: false,
    reduzir: "Uma fonte de notificação que interrompe o dia sem trazer nada importante.",
    movimentos: [
      "Proteger um bloco de 25 minutos por dia para uma única atividade importante.",
      "Agrupar respostas a mensagens em dois horários fixos.",
      "Deixar o celular fora do alcance durante o bloco protegido.",
    ],
    pratica: "Um bloco curto por dia sem notificações nem troca de telas, anotando como você termina.",
  },
  movimento: {
    foco: "Consistência antes de intensidade: devolver ao corpo um lugar fixo na rotina.",
    focoAprovado: false,
    reduzir: "Um período de mais de 2 horas seguidas sentado sem levantar.",
    movimentos: [
      "Escolher um ponto fixo da rotina para uma janela curta de movimento.",
      "Levantar e caminhar alguns minutos a cada bloco longo sentado.",
      "Fazer uma ligação ou reunião em pé ou caminhando, uma vez na semana.",
    ],
    pratica: "Uma pequena janela de movimento por dia, compatível com as suas condições atuais.",
  },
};

const ACAO: Mapa = {
  inicio: {
    foco: "Começar antes de se sentir totalmente pronto; reduzir preparação; definir ação de 10 minutos.",
    focoAprovado: true,
    reduzir: "Uma rodada de pesquisa ou organização antes de começar algo que já está claro.",
    movimentos: [
      "Escrever a versão de 10 minutos de uma tarefa importante e fazê-la antes de melhorar o plano.",
      "Começar a tarefa do dia sem abrir nenhuma referência nova.",
      "Contar para alguém o que você vai começar hoje, antes de começar.",
    ],
    pratica: "Uma ação de 10 minutos por dia, feita antes de qualquer preparação extra.",
    gatilho: "Depois do primeiro café, antes de abrir mensagens.",
  },
  friccao: {
    foco: "Baixar o padrão de entrada; reduzir escopo; usar versão mínima aceitável.",
    focoAprovado: true,
    reduzir: "O tamanho do primeiro passo do projeto que está grande demais.",
    movimentos: [
      "Responder: qual versão disso é pequena demais para assustar, mas real o bastante para contar?",
      "Definir o critério de 'bom o suficiente' antes de começar.",
      "Entregar uma versão imperfeita de algo e observar o que aconteceu de fato.",
    ],
    pratica: "Uma versão mínima aceitável por dia, sem revisar antes de terminar.",
    gatilho: "No primeiro bloco livre da manhã.",
  },
  distracao: {
    foco: "Proteger contexto; reduzir alternância; criar bloco curto sem interrupção.",
    focoAprovado: true,
    reduzir: "Abas, notificações e pequenas pendências abertas durante a tarefa importante.",
    movimentos: [
      "Proteger 20 minutos por dia para uma única tarefa importante.",
      "Anotar num papel cada impulso de trocar de tarefa e voltar ao que estava fazendo.",
      "Fechar o dia escolhendo a tarefa importante de amanhã.",
    ],
    pratica: "Um bloco de 20 minutos por dia sem alternar entre estímulos.",
    gatilho: "No mesmo horário todos os dias, com o celular fora do alcance.",
  },
  consistencia: {
    foco: "Sustentabilidade; reduzir intensidade inicial; construir um mínimo repetível.",
    focoAprovado: true,
    reduzir: "A meta diária: corte pela metade o que você planejava fazer.",
    movimentos: [
      "Definir a versão mínima da ação que cabe até no pior dia da semana.",
      "Cumprir a versão mínima todos os dias, mesmo quando der para fazer mais.",
      "Registrar só se cumpriu ou não, sem avaliar a qualidade.",
    ],
    pratica: "A versão mínima da ação, todo dia, inclusive nos dias ruins.",
    gatilho: "Atrelada a um hábito que já existe e não falha.",
  },
  retomada: {
    foco: "Retorno rápido; abandonar compensação; usar regra de retomada previamente definida.",
    focoAprovado: true,
    reduzir: "A tentação de compensar o dia perdido com um dia dobrado.",
    movimentos: [
      "Escrever agora a sua regra de retorno: a menor ação do primeiro dia possível.",
      "Quando falhar, voltar no dia seguinte com a regra, sem compensar.",
      "Observar quantas horas, não dias, você levou para voltar.",
    ],
    pratica: "Uma ação mínima por dia, e a regra de retorno pronta para o dia que falhar.",
    retomada: "Falhou? No primeiro dia possível, faça só a menor ação. Nada de compensar.",
  },
};

// Demais dimensões: só o foco aprovado do documento até o rascunho do Plano vir.
const so = (foco: string): ConteudoPerfil => ({ foco, focoAprovado: true });

const CORAGEM: Mapa = {
  decisao: so("Nomear a escolha e parar de buscar clareza infinita."),
  consequencia: so("Separar responsabilidade real de controle impossível e mapear consequências."),
  exposicao: so("Exposição gradual e proporcional."),
  incerteza: so("Dissecar risco, prevenção, reparo e custo da inércia."),
  travessia: so("Ritual de partida e microação concreta."),
};
const AUTOCONHECIMENTO: Mapa = {
  identidade: so("Separar papéis de identidade atual e observar autoimagem."),
  valores: so("Inventário de valores e decisão prática."),
  desejos: so("Distinguir desejo próprio de expectativa herdada e revisar objetivos."),
  limites: so("Limites, medo associado ao “não” e proteção de prioridade."),
  coerencia: so("Alinhar rotina, escolhas e identidade futura por meio de uma ação concreta."),
};
const MENTALIDADE: Mapa = {
  analise: so("Limite de análise e informação suficiente para agir."),
  crencas: so("Transformar crença em hipótese testável."),
  erro: so("Separar erro de identidade e transformar resultado em dado."),
  autoprotecao: so("Identificar a ameaça protegida por justificativas sofisticadas."),
  reatividade: so("Mindfulness funcional e microespaço entre estímulo e resposta."),
};
const FELICIDADE: Mapa = {
  emocoes_positivas: so("Saborear experiências e reduzir a lógica do “quando”."),
  engajamento: so("Inserir experiências de engajamento e presença real."),
  relacoes: so("Qualidade de conexão e nutrição de relações."),
  significado: so("Significado cotidiano, valores e contribuição."),
  realizacao: so("Registrar progresso, realização e satisfação sem exigir perfeição."),
};
const PLANEJAMENTO: Mapa = {
  direcao: so("Resultado específico, propósito e medida concreta."),
  realidade: so("Recursos, restrições, premissas e obstáculos reais."),
  prioridade: so("Escolher uma coisa principal e explicitar renúncias temporárias."),
  progresso: so("Indicadores simples de execução e resultado."),
  adaptacao: so("Plano B, gatilhos de revisão e ajuste contínuo."),
};
const INTELIGENCIA: Mapa = {
  realidade: so("Separar fato de narrativa e reduzir conclusões definitivas a partir de um episódio."),
  recuperacao: so("Protocolo de retorno ao estado, rede de apoio e microação possível."),
  aprendizado: so("Transformar resultado em dado sem romantizar erro."),
  adaptacao: so("Improvisação, Plano B e alternativas que preservam o objetivo."),
  agencia_emocional: so("Scanner emocional, pausa e escolha consciente antes da resposta."),
};
const EXCELENCIA: Mapa = {
  padrao: so("Distinguir níveis de qualidade e criar critério de parada."),
  pratica: so("Quebrar habilidades em partes e treinar fora do automático."),
  feedback: so("Feedback objetivo e aplicável."),
  refinamento: so("Revisão deliberada e pequenos ciclos de melhoria."),
  sustentabilidade: so("Processo, sustentabilidade e qualidade que não dependa de esforço extremo."),
};
const AMOR: Mapa = {
  conexao: so("Conversa real, escuta e expressão de afeto ou necessidade."),
  presenca: so("Micro-momentos de atenção total e redução de distração relacional."),
  relacao_consigo: so("Autocompaixão prática, linguagem interna e responsabilidade sem ataque pessoal."),
  pertencimento: so("Pertencimento, autenticidade e reconhecimento de onde existe espaço para ser inteiro."),
  expansao: so("Contribuição, compartilhamento, entusiasmo e sentido humano daquilo que foi construído."),
};

export const CONTEUDO_PLANO: Record<DimensionId, Mapa> = {
  energia: ENERGIA,
  mentalidade: MENTALIDADE,
  autoconhecimento: AUTOCONHECIMENTO,
  felicidade: FELICIDADE,
  planejamento: PLANEJAMENTO,
  coragem: CORAGEM,
  acao: ACAO,
  inteligencia: INTELIGENCIA,
  excelencia: EXCELENCIA,
  amor: AMOR,
};
