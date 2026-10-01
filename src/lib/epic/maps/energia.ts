// Mapa de Energia v1.0 — texto transcrito do documento
// "EPIC247 2.0 — Mapa de Energia v1.0" (pasta 08). Os drenos usam a
// linguagem externa v1.0 (Combustível Instável, Alerta Constante); os nomes
// originais do método (Combustível Errado, Cortisol Crônico) ficam internos.

import type { DimensionalMapConfig } from "./types";

export const ENERGIA: DimensionalMapConfig = {
  kind: "dimensional",
  mapType: "energia",
  mapVersion: "1.0",
  scoringVersion: "1.0",
  resultCopyVersion: "1.0",
  title: "Mapa de Energia",
  disclaimer:
    "Este Mapa EPIC é uma ferramenta educativa de autoavaliação sobre hábitos e rotina. Ele não diagnostica condições médicas, nutricionais ou psicológicas e não substitui orientação profissional.",
  estimatedMinutes: "3 a 4 minutos",
  axes: [
    { key: "sono", label: "Sono Quebrado" },
    { key: "combustivel", label: "Combustível Instável" },
    { key: "alerta", label: "Alerta Constante" },
    { key: "atencao", label: "Atenção Sequestrada" },
    { key: "movimento", label: "Corpo Parado" },
  ],
  questions: [
    { id: "E1", axis: "sono", reverse: false, text: "Mesmo quando tenho tempo suficiente para dormir, acordo sentindo que não recuperei minha energia." },
    { id: "E2", axis: "sono", reverse: false, text: "Meu horário de dormir e acordar varia bastante ao longo da semana." },
    { id: "E3", axis: "sono", reverse: true, text: "Na maioria dos dias, acordo com sensação de recuperação e disposição suficiente para começar o dia." },
    { id: "E4", axis: "combustivel", reverse: false, text: "Ao longo do dia, passo por quedas de disposição que me fazem buscar café, açúcar ou algum estímulo para continuar funcionando." },
    { id: "E5", axis: "combustivel", reverse: false, text: "Minha rotina faz com que eu passe períodos longos sem comer ou coma de maneira muito irregular." },
    { id: "E6", axis: "combustivel", reverse: true, text: "Minha alimentação e meus horários costumam sustentar uma energia relativamente estável ao longo do dia." },
    { id: "E7", axis: "alerta", reverse: false, text: "Mesmo quando as demandas do dia terminam, tenho dificuldade de desacelerar por dentro." },
    { id: "E8", axis: "alerta", reverse: false, text: "Sinto que meu corpo ou minha cabeça permanecem em estado de alerta durante grande parte do dia." },
    { id: "E9", axis: "alerta", reverse: true, text: "Tenho momentos reais de pausa em que consigo me desligar das demandas e recuperar presença." },
    { id: "E10", axis: "atencao", reverse: false, text: "Notificações, mensagens e interrupções quebram minha concentração muitas vezes ao longo do dia." },
    { id: "E11", axis: "atencao", reverse: false, text: "Chego ao fim do dia mentalmente cansado mesmo quando sinto que avancei pouco no que era realmente importante." },
    { id: "E12", axis: "atencao", reverse: true, text: "Consigo manter períodos de atenção em uma atividade importante sem alternar constantemente entre estímulos." },
    { id: "E13", axis: "movimento", reverse: false, text: "Passo grande parte do meu dia sentado ou com pouquíssima movimentação corporal." },
    { id: "E14", axis: "movimento", reverse: false, text: "Quando fico vários dias com pouco movimento, percebo queda na minha disposição ou sensação de vitalidade." },
    { id: "E15", axis: "movimento", reverse: true, text: "Movimento corporal faz parte da minha rotina de forma relativamente consistente." },
  ],
  profiles: {
    sono: {
      title: "Seu maior vazamento hoje parece estar no Sono Quebrado.",
      interpretation:
        "Suas respostas sugerem que dormir e recuperar não estão acontecendo como a mesma coisa. O ponto aqui não é contar apenas horas de sono, mas observar regularidade, sensação de recuperação e o quanto você começa o dia já tentando compensar uma noite que não restaurou o suficiente.",
      recognition: "Você pode estar começando o dia antes de recuperar o dia anterior.",
      firstMove:
        "Durante 7 dias, registre apenas duas coisas ao acordar: horário aproximado de sono e uma palavra para sua sensação de recuperação. Não mude tudo ainda. Primeiro, veja o padrão.",
    },
    combustivel: {
      title: "Seu maior vazamento hoje parece estar no Combustível Instável.",
      interpretation:
        "Seu mapa sugere que a forma como alimentação, horários e estímulos entram na rotina pode estar contribuindo para oscilações de disposição. O objetivo não é dizer o que você deve comer, mas perceber se sua rotina cria longos períodos de baixa sustentação seguidos de tentativas de compensação.",
      recognition: "Talvez você esteja atravessando o dia em picos e quedas, em vez de sustentar um ritmo.",
      firstMove:
        "Por 7 dias, anote apenas os horários em que percebe uma queda clara de disposição e o que aconteceu nas 2 horas anteriores. Procure padrão antes de procurar solução.",
    },
    alerta: {
      title: "Seu maior vazamento hoje parece estar no Alerta Constante.",
      interpretation:
        "Suas respostas sugerem dificuldade de sair do modo de demanda mesmo quando a demanda objetiva já terminou. Isso pode aparecer como cabeça acelerada, dificuldade de desligar, sensação de urgência permanente ou incapacidade de transformar pausa em recuperação real.",
      recognition: "O dia termina, mas seu sistema continua trabalhando.",
      firstMove:
        "Escolha um momento fixo de 3 minutos no fim do dia para retirar estímulos e perceber conscientemente a transição entre demanda e pausa. A função é marcar uma fronteira, não produzir relaxamento perfeito.",
    },
    atencao: {
      title: "Seu maior vazamento hoje parece estar na Atenção Sequestrada.",
      interpretation:
        "Seu resultado sugere que parte importante do desgaste pode vir da fragmentação. Não é apenas quanto você faz, mas quantas vezes precisa interromper, trocar de contexto, responder, voltar e reconstruir o foco ao longo do dia.",
      recognition:
        "Você pode estar gastando energia demais voltando para aquilo que nunca conseguiu terminar de começar.",
      firstMove:
        "Escolha uma atividade importante amanhã e proteja um único bloco curto sem notificações nem alternância de telas. O objetivo não é virar uma pessoa hiperfocada. É comparar como seu corpo e sua mente terminam um período menos fragmentado.",
    },
    movimento: {
      title: "Seu maior vazamento hoje parece estar no Corpo Parado.",
      interpretation:
        "Suas respostas sugerem que a baixa presença de movimento na rotina pode estar acompanhando sua sensação de pouca disposição. O EPIC não trata movimento como performance esportiva. Trata como uma variável básica da infraestrutura cotidiana.",
      recognition: "Seu dia pode estar exigindo muito da cabeça e quase nada do corpo.",
      firstMove:
        "Escolha um ponto fixo da rotina e acrescente uma pequena janela de movimento compatível com suas condições atuais. O objetivo inicial é consistência, não intensidade.",
    },
  },
  dualMessage:
    "Seu mapa mostra dois vazamentos muito próximos: {A} e {B}. Isso é comum porque essas áreas podem se alimentar. Em vez de forçar um vencedor, vale observar a relação entre as duas.",
  generalTitle: "Seu maior vazamento de energia hoje parece estar em {DRENO}.",
  generalSubtitle:
    "Seu mapa não mede saúde. Ele mostra onde, na sua rotina, existe mais fricção percebida neste momento.",
  closingPhrase:
    "Você não precisa consertar sua vida inteira hoje. Precisa descobrir qual vazamento merece atenção primeiro.",
  ctaPlan: "Quero meu Plano EPIC Energia de 7 dias.",
  ctaKit: "Conhecer o Kit Energia.",
  // O documento de Energia não traz seção de conexão com outras dimensões.
  related: [],
};
