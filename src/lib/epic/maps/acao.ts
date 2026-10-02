// Mapa de Ação v1.0 — texto transcrito do documento
// "EPIC247 2.0 — Mapa de Ação v1.0" (pasta 08). Os nomes editoriais são
// rótulos de momento: na interface, sempre "Seu padrão predominante neste
// momento parece ser...", nunca "Você é...".

import type { DimensionalMapConfig } from "./types";

export const ACAO: DimensionalMapConfig = {
  kind: "dimensional",
  mapType: "acao",
  mapVersion: "1.0",
  scoringVersion: "1.0",
  resultCopyVersion: "1.0",
  title: "Mapa de Ação",
  disclaimer:
    "Este Mapa EPIC é uma autoavaliação educativa e comportamental. Não é instrumento clínico, psicológico ou diagnóstico, e não substitui avaliação profissional adequada.",
  estimatedMinutes: "3 a 4 minutos",
  axes: [
    { key: "inicio", label: "Início" },
    { key: "friccao", label: "Fricção" },
    { key: "distracao", label: "Distração" },
    { key: "consistencia", label: "Consistência" },
    { key: "retomada", label: "Retomada" },
  ],
  questions: [
    { id: "A1", axis: "inicio", reverse: false, text: "Mesmo quando uma tarefa é importante para mim, costumo adiar o momento de começar." },
    { id: "A2", axis: "inicio", reverse: false, text: "Espero me sentir mais preparado, mais certo ou em uma condição melhor antes de iniciar algo relevante." },
    { id: "A3", axis: "inicio", reverse: true, text: "Quando sei qual é o próximo passo, consigo começar sem precisar organizar tudo antes." },
    { id: "A4", axis: "friccao", reverse: false, text: "Quando uma tarefa parece grande, ambígua ou desconfortável, minha tendência é evitá-la por mais tempo do que gostaria." },
    { id: "A5", axis: "friccao", reverse: false, text: "Quanto mais importante algo é para mim, maior pode ser minha dificuldade de transformá-lo em ação concreta." },
    { id: "A6", axis: "friccao", reverse: true, text: "Consigo reduzir projetos importantes a uma próxima ação simples o bastante para acontecer." },
    { id: "A7", axis: "distracao", reverse: false, text: "Quando preciso fazer algo desconfortável, tarefas menores ou menos importantes ficam subitamente mais atraentes." },
    { id: "A8", axis: "distracao", reverse: false, text: "Interrompo atividades importantes para checar mensagens, pesquisar, organizar ou resolver pequenas pendências." },
    { id: "A9", axis: "distracao", reverse: true, text: "Consigo proteger períodos curtos de execução sem alternar continuamente entre estímulos." },
    { id: "A10", axis: "consistencia", reverse: false, text: "Tenho tendência a começar com muita intensidade e perder ritmo depois de alguns dias ou semanas." },
    { id: "A11", axis: "consistencia", reverse: false, text: "Minha execução depende demais de estar motivado, inspirado ou no “clima certo”." },
    { id: "A12", axis: "consistencia", reverse: true, text: "Consigo manter uma versão mínima da ação mesmo nos dias em que não consigo cumprir o plano ideal." },
    { id: "A13", axis: "retomada", reverse: false, text: "Quando quebro uma sequência, demoro mais do que gostaria para voltar." },
    { id: "A14", axis: "retomada", reverse: false, text: "Um dia ruim ou uma interrupção costuma virar vários dias de afastamento daquilo que eu estava tentando sustentar." },
    { id: "A15", axis: "retomada", reverse: true, text: "Consigo retomar rapidamente depois de uma falha, sem transformar a interrupção em recomeço total." },
  ],
  profiles: {
    inicio: {
      editorialName: "O Preparador",
      title: "Seu principal ponto de fricção hoje parece estar no Início.",
      interpretation:
        "Suas respostas sugerem que existe uma distância relevante entre estar pronto o suficiente e começar de fato. Você pode estar usando preparação, pesquisa, organização ou busca de certeza como forma legítima de adiar exposição ao primeiro passo.",
      recognition:
        "Você não está parado porque não sabe nada. Pode estar parado porque quer saber o suficiente para não precisar começar no desconforto.",
      firstMove:
        "Escolha uma tarefa real e escreva qual é a menor versão executável dela que cabe em 10 minutos. Faça essa versão antes de melhorar o plano.",
      concepts: ["Síndrome do Preparo Eterno", "Mínimo Viável"],
    },
    friccao: {
      editorialName: "O Perfeccionista",
      title: "Seu principal ponto de fricção hoje parece estar na Fricção.",
      interpretation:
        "Seu mapa sugere que a importância do que você quer fazer pode estar aumentando o peso do começo. Quanto maior o significado, maior a exigência, a complexidade percebida e a tentação de esperar condições ideais.",
      recognition: "O projeto ficou tão importante que ficou difícil demais começar de forma imperfeita.",
      firstMove:
        "Pegue algo que está grande demais e responda: “Qual versão disso seria pequena demais para me assustar, mas real o suficiente para contar como avanço?”",
      concepts: ["Paralisia do Perfeito", "Mínimo Viável"],
    },
    distracao: {
      editorialName: "O Disperso",
      title: "Seu principal ponto de fricção hoje parece estar na Distração.",
      interpretation:
        "Suas respostas sugerem que talvez você consiga começar, mas perde força quando estímulos concorrentes oferecem alívio rápido, novidade ou sensação de produtividade. O problema pode não ser falta de intenção, mas excesso de portas abertas ao mesmo tempo.",
      recognition:
        "Você começa o que importa e, poucos minutos depois, está resolvendo outra coisa que parecia urgente.",
      firstMove:
        "Amanhã, escolha uma única tarefa importante e proteja 20 minutos sem notificações, abas extras ou pequenas pendências. Compare como termina esse bloco com um bloco fragmentado comum.",
    },
    consistencia: {
      editorialName: "O Arrancador",
      title: "Seu principal ponto de fricção hoje parece estar na Consistência.",
      interpretation:
        "Seu mapa sugere que iniciar não é necessariamente o problema. A dificuldade aparece depois, quando o entusiasmo inicial cai e o plano precisa sobreviver aos dias comuns. A intensidade do começo pode estar sendo maior do que a rotina consegue sustentar.",
      recognition:
        "Você não tem dificuldade de começar de novo. Tem dificuldade de continuar quando deixa de parecer novo.",
      firstMove:
        "Reduza por 7 dias uma ação importante para uma versão mínima que você consiga cumprir inclusive num dia ruim. O objetivo é testar sustentabilidade, não desempenho máximo.",
      concepts: ["Mínimo Viável", "Consistência independente de motivação"],
    },
    retomada: {
      editorialName: "O Reiniciador",
      title: "Seu principal ponto de fricção hoje parece estar na Retomada.",
      interpretation:
        "Suas respostas sugerem que o maior custo pode estar acontecendo depois da interrupção. Você consegue construir movimento, mas quando a sequência quebra existe tendência de interpretar a falha como perda do processo inteiro, criando novos ciclos de “segunda eu volto”.",
      recognition: "Talvez seu problema não seja cair. Seja demorar demais para voltar depois que caiu.",
      firstMove:
        "Defina antes da próxima interrupção a sua regra de retorno: qual é a menor ação que você fará no primeiro dia possível, sem compensar o que perdeu?",
      concepts: ["Regra do Não Zerar"],
    },
  },
  dualMessage:
    "Seu mapa mostra duas fricções muito próximas: {A} e {B}. Isso faz sentido porque padrões de ação costumam se alimentar. Em vez de forçar um vencedor, vale observar como os dois aparecem na mesma sequência.",
  closingPhrase:
    "Você não precisa esperar a versão perfeita do plano. Precisa descobrir qual é o próximo passo pequeno o bastante para acontecer.",
  ctaPlan: "Quero meu Plano EPIC Ação de 7 dias.",
  ctaKit: "Conhecer o Kit Ação.",
  // Mapa de Ação §16: autoavaliação comportamental não substitui avaliação profissional.
  safetyNote:
    "Se você vive sofrimento relevante, prejuízo importante no dia a dia ou sintomas persistentes que vão além de hábitos e execução, uma autoavaliação comportamental não substitui avaliação profissional adequada.",
  related: [
    { dimension: "energia", when: "quando a pessoa sabe o que fazer, mas não tem recurso físico/mental para sustentar." },
    { dimension: "mentalidade", when: "quando ruminação, antecipação, perfeccionismo ou justificativas dominam antes da ação." },
    { dimension: "planejamento", when: "quando o problema central é não saber transformar intenção em prioridade e sequência." },
    { dimension: "coragem", when: "quando a decisão está clara, mas a consequência ou exposição impede o movimento." },
    { dimension: "excelencia", when: "quando a questão principal é manutenção, qualidade e evolução de uma prática já existente." },
  ],
};
