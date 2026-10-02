// Templates canônicos de Plano EPIC 7 Dias e Kit EPIC [Dimensão]
// (Copy Final §25 e §26). PROPOSTA FINAL. [DIMENSÃO] entra pelos parâmetros.
// Preços e meios de pagamento vêm do catálogo/checkout, nunca daqui.

export const PLANO_PAGINA = {
  eyebrow: (d: string) => `Plano EPIC 7 Dias · ${d}`,
  titulo: "Você já entendeu onde está a fricção. Agora precisa transformar clareza em movimento.",
  sub: (d: string) =>
    `Receba um plano prático para os próximos 7 dias, personalizado a partir das suas respostas no Mapa de ${d}. Uma sequência curta para sair da leitura e começar a agir sobre o ponto que mais pede atenção agora.`,
  cta: "Quero meu Plano EPIC 7 Dias",
  micro: "Personalizado a partir das suas respostas.",
  prioritario: (eixo: string) => `Seu ponto prioritário hoje: ${eixo}.`,
  transicao: {
    titulo: "Clareza ajuda. Movimento muda a experiência.",
    texto: [
      "O Mapa mostra onde existe fricção. O próximo passo é experimentar uma forma diferente de responder a ela na vida real.",
      "O Plano EPIC 7 Dias foi criado para encurtar essa distância: menos conteúdo para acumular, mais direção para testar nos próximos dias.",
    ],
  },
  recebe: {
    titulo: "Um próximo passo pequeno o suficiente para começar. Estruturado o suficiente para não ficar no improviso.",
    texto: [
      "Seu Plano EPIC organiza uma sequência de 7 dias a partir do padrão identificado no seu Mapa.",
      "A proposta não é mudar tudo em uma semana. É criar um primeiro ciclo de aplicação que ajude você a observar, agir e gerar evidência real sobre o que funciona para você.",
    ],
    itens: [
      "ponto de atenção prioritário",
      "direção prática para os próximos 7 dias",
      "ações organizadas em uma sequência curta",
      "perguntas de observação e registro quando aplicável",
      "fechamento do ciclo com orientação de próximo passo",
    ],
  },
  personalizacao: {
    titulo: "Não é um plano genérico de 7 dias.",
    texto: (d: string) => [
      `O ponto de partida vem das respostas que você deu no seu Mapa de ${d}.`,
      "Por isso, duas pessoas que chegam à mesma dimensão podem receber direções diferentes. O Plano considera o padrão que apareceu com mais força no seu resultado para organizar o primeiro ciclo de ação.",
    ],
    selo: "Gerado a partir das suas respostas. Sem análise clínica. Sem promessa de resultado automático.",
  },
  paraQuem: {
    titulo: "Este é o próximo passo certo se…",
    itens: [
      "você terminou o Mapa e quer transformar o resultado em ação",
      "você prefere começar pequeno antes de entrar em um programa maior",
      "você quer testar uma mudança concreta na rotina antes de aprofundar a dimensão",
      "você precisa de direção prática agora, sem acumular mais teoria",
    ],
  },
  limites: {
    titulo: "Talvez você precise de outra coisa.",
    texto: [
      "O Plano EPIC 7 Dias é uma ferramenta de transformação pessoal aplicada. Ele não é terapia, diagnóstico clínico nem atendimento de saúde.",
      "Se a situação que você está vivendo envolve sofrimento intenso, risco, crise ou uma questão que pede cuidado especializado, o caminho mais adequado pode ser procurar um profissional qualificado.",
    ],
  },
  comparacao: {
    titulo: "Comece no tamanho da mudança que você quer fazer agora.",
    plano: { texto: "Para transformar o resultado do Mapa em um primeiro ciclo curto de ação.", cta: "Quero começar por 7 dias" },
    kit: { texto: "Para aprofundar uma dimensão com Manual, Workbook e ferramentas práticas.", cta: "Conhecer o Kit" },
    protocolo: { texto: "Para trabalhar as 10 dimensões como um sistema integrado.", cta: "Conhecer o Protocolo" },
  },
  oferta: {
    titulo: "Seu próximo movimento pode começar hoje.",
    produto: (d: string) => `Plano EPIC 7 Dias · ${d}`,
    pagamento: "Pix ou cartão.",
    micro: (d: string) => `Personalizado a partir das suas respostas no Mapa de ${d}.`,
  },
  faq: [
    {
      p: "O Plano é feito pela Ju pessoalmente?",
      r: "Não. O Plano é gerado automaticamente e personalizado a partir das suas respostas no Mapa.",
    },
    {
      p: "Preciso fazer o Mapa antes?",
      r: "O Plano depende das suas respostas para ser personalizado. Na jornada padrão, ele é oferecido depois do Mapa da dimensão. Se você comprar antes, o Plano fica pronto assim que você terminar o Mapa.",
    },
    {
      p: "É um curso?",
      r: "Não. O Plano EPIC 7 Dias é um plano curto de aplicação, organizado para transformar o resultado do Mapa em um primeiro ciclo de ação.",
    },
    {
      p: "Vou resolver minha questão em 7 dias?",
      r: "Essa não é a promessa. Sete dias são o primeiro ciclo de aplicação. Mudanças pessoais dependem de contexto, repetição, escolhas e continuidade.",
    },
    {
      p: "Qual a diferença para o Kit?",
      r: "O Plano é curto e orientado ao primeiro movimento. O Kit aprofunda uma dimensão com Manual, Workbook e ferramentas práticas.",
    },
    {
      p: "Qual a diferença para o Protocolo?",
      r: "O Plano trabalha o próximo movimento em uma dimensão. O Protocolo integra as dez dimensões da Infraestrutura Humana em um sistema mais amplo.",
    },
  ],
  fechamento: {
    titulo: "Você não precisa resolver tudo agora. Precisa tornar possível o próximo movimento.",
    texto: ["Seu Mapa mostrou onde prestar atenção.", "Agora você pode transformar essa clareza em sete dias de aplicação."],
  },
  seo: {
    titulo: (d: string) => `Plano EPIC 7 Dias de ${d} | EPIC247`,
    descricao: (d: string) =>
      `Transforme o resultado do seu Mapa de ${d} em um plano prático de 7 dias, personalizado a partir das suas respostas.`,
  },
};

export const KIT_PAGINA = {
  eyebrow: (d: string) => `Kit EPIC · ${d}`,
  titulo: (d: string) => `Entender ${d} é uma coisa. Construir condições para viver diferente é outra.`,
  sub: (d: string) =>
    `O Kit EPIC ${d} reúne Manual, Workbook e ferramentas práticas para ajudar você a aprofundar essa dimensão e transformar reflexão em aplicação na vida real.`,
  cta: (d: string) => `Quero meu Kit EPIC ${d}`,
  cta2: "Ver o que está incluído",
  contexto: (d: string) =>
    `Você chegou aqui depois do seu Mapa de ${d}. Use esse resultado como ponto de partida para aprofundar o que apareceu com mais força.`,
  reconhecimento: {
    titulo: "Algumas questões não pedem mais conteúdo solto. Pedem profundidade, prática e continuidade.",
    tensao: (frase: string) => `Talvez você já tenha percebido que ${frase}`,
    texto:
      "Um insight pode abrir uma porta. Um Plano de 7 Dias pode colocar algo em movimento. Mas, quando você quer compreender melhor uma dimensão e trabalhar nela com mais estrutura, precisa de mais do que uma ação isolada.",
    fechamento: "O Kit existe para esse momento.",
  },
  camadas: {
    titulo: "Uma dimensão. Três camadas de aplicação.",
    itens: [
      { nome: "Manual", texto: "Para compreender melhor a dimensão, organizar conceitos e enxergar com mais clareza o que está sendo trabalhado." },
      { nome: "Workbook", texto: "Para transformar leitura em reflexão orientada, registro e aplicação." },
      { nome: "Ferramentas práticas", texto: "Para levar a dimensão para situações concretas da vida real." },
    ],
  },
  pratica: {
    titulo: "Porque saber mais sobre o problema nem sempre muda a forma como você responde a ele.",
    texto: [
      "O Kit foi desenhado para evitar duas armadilhas comuns: consumir teoria sem aplicar e tentar mudar comportamento sem compreender o que está sustentando o padrão.",
      "A proposta é trabalhar as duas coisas juntas: entender melhor e testar novas formas de agir, observar e ajustar.",
    ],
    destaque: "Clareza → Ação → Consistência.",
  },
  paraQuem: {
    titulo: "O Kit pode fazer sentido se…",
    itens: [
      "esta dimensão está claramente pedindo mais atenção na sua vida",
      "você quer ir além do primeiro movimento e aprofundar o tema",
      "prefere trabalhar uma dimensão por vez antes de entrar no sistema completo",
      "quer material estruturado para estudar, refletir e aplicar no próprio ritmo",
      "já fez o Mapa ou reconhece com clareza que esta dimensão é relevante agora",
    ],
  },
  escada: {
    titulo: "A escada existe para orientar. Não para obrigar.",
    texto: [
      "Você pode chegar ao Kit depois do Mapa, depois do Plano EPIC 7 Dias ou diretamente pela página da dimensão.",
      "O Plano é útil quando você quer um primeiro ciclo curto de ação. O Kit faz mais sentido quando você já quer aprofundar a dimensão com mais repertório e estrutura.",
    ],
  },
  comparacao: {
    titulo: "Escolha a profundidade que combina com o seu momento.",
    plano: "Um primeiro ciclo curto de aplicação, personalizado a partir das respostas do Mapa.",
    kit: "Manual + Workbook + ferramentas práticas para aprofundar uma única dimensão.",
    protocolo:
      "10 Manuais + 10 Workbooks + ferramentas + sequência recomendada + mapa de progresso + orientações de aplicação para trabalhar o sistema completo.",
  },
  recebe: {
    titulo: (d: string) => `Tudo o que compõe o Kit de ${d}.`,
    itens: (d: string) => [`1 Manual da dimensão ${d}`, `1 Workbook da dimensão ${d}`, `ferramentas práticas da dimensão ${d}`],
  },
  comoUsar: {
    titulo: "Não existe obrigação de consumir tudo de uma vez.",
    texto: [
      "O Kit foi pensado para ser usado no seu ritmo.",
      "Você pode começar pelo Manual para ganhar contexto, usar o Workbook para organizar a reflexão e recorrer às ferramentas práticas conforme a dimensão encontra situações reais da sua vida.",
      "O objetivo não é terminar material. É conseguir aplicar melhor aquilo que faz sentido para você.",
    ],
  },
  limites: {
    titulo: "Uma ferramenta de desenvolvimento pessoal não substitui cuidado profissional.",
    texto: (d: string) => [
      `O Kit EPIC ${d} é um produto educacional de transformação pessoal aplicada.`,
      "Não é psicoterapia, diagnóstico psicológico, tratamento médico ou orientação clínica. Se o contexto envolver sofrimento intenso, crise, risco ou uma questão que exija especialização, procure o profissional adequado.",
    ],
  },
  oferta: {
    eyebrow: (d: string) => `Kit EPIC ${d}`,
    titulo: "Aprofunde a dimensão que está pedindo atenção agora.",
    inclui: "Manual + Workbook + ferramentas práticas.",
    pagamento: "Pix ou cartão.",
    micro: "Uma única dimensão. Material estruturado para compreender, refletir e aplicar.",
  },
  faq: (d: string) => [
    {
      p: "Preciso fazer o Mapa antes?",
      r: "Não. A escada do EPIC247 não é obrigatória. O Mapa pode ajudar a identificar onde está a principal fricção, mas o Kit pode ser comprado diretamente quando você já reconhece que quer trabalhar aquela dimensão.",
    },
    {
      p: "Preciso comprar o Plano de 7 Dias antes?",
      r: "Não. O Plano é um primeiro movimento curto. O Kit é um aprofundamento da dimensão. São ofertas diferentes e não dependem uma da outra.",
    },
    { p: "O Workbook pode ser comprado separado?", r: `Não nesta primeira fase. O Workbook faz parte do Kit EPIC ${d}.` },
    {
      p: "Qual a diferença para o Protocolo?",
      r: "O Kit aprofunda uma dimensão. O Protocolo integra as dez dimensões em um sistema completo com 10 Manuais, 10 Workbooks, ferramentas, sequência recomendada, mapa de progresso e orientações de aplicação.",
    },
    {
      p: "O Kit tem acompanhamento individual?",
      r: "Não. O Kit é Manual + Workbook + ferramentas práticas. Acompanhamento individual pertence à Mentoria EPIC Individual.",
    },
    {
      p: "O Kit garante resultado?",
      r: "Não. O Kit oferece estrutura, repertório e ferramentas para aplicação. Resultados dependem de contexto, escolhas, uso e continuidade.",
    },
  ],
  fechamento: {
    titulo: "Você não precisa trabalhar sua vida inteira de uma vez.",
    texto: [
      "Pode começar por uma dimensão.",
      "Compreender melhor. Observar com mais precisão. Aplicar com mais intenção.",
      "E então perceber o que muda quando essa parte da sua Infraestrutura Humana começa a ser construída de outro jeito.",
    ],
    cta2: "Quero conhecer o Protocolo completo",
  },
  seo: {
    titulo: (d: string) => `Kit EPIC ${d} | EPIC247`,
    descricao: (d: string) =>
      `Aprofunde ${d} com o Kit EPIC: Manual, Workbook e ferramentas práticas para transformar reflexão em aplicação.`,
  },
};
