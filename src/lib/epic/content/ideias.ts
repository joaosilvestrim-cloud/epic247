// Página Ideias (Copy Final §23). PROPOSTA FINAL.
// As perguntas por dimensão são as mesmas do mega-menu (navegacao.ts).

export const IDEIAS_PAGINA = {
  seo: {
    titulo: "Ideias | EPIC247",
    descricao:
      "Artigos, vídeos, histórias, repertório e ferramentas sobre transformação pessoal aplicada, escolhas, comportamento e as 10 dimensões da Infraestrutura Humana.",
    ogTitulo: "Ideias para enxergar a vida de outro jeito | EPIC247",
    ogDescricao:
      "Perguntas, histórias, vídeos, artigos e ferramentas para observar melhor o que está acontecendo e descobrir onde uma mudança pode começar.",
  },
  hero: {
    eyebrow: "Ideias",
    titulo: "Nem toda mudança começa com uma resposta.",
    sub: "Algumas começam com uma ideia que faz você enxergar a própria vida de outro jeito.",
    texto: "Artigos, vídeos, histórias, repertório e ferramentas para observar melhor o que está acontecendo antes de tentar consertar tudo.",
    cta: "Explorar ideias",
    cta2: "Descobrir meu ponto de fricção",
    micro: "Comece pela pergunta que mais se parece com a sua vida hoje.",
  },
  papel: {
    titulo: "Antes do método, existe uma pergunta.",
    abertura: "O EPIC247 nasceu de perguntas humanas que continuam aparecendo em lugares diferentes.",
    perguntas: [
      "Por que eu sei o que preciso fazer e ainda assim não faço?",
      "Por que uma vida pode funcionar por fora e deixar de fazer sentido por dentro?",
      "Quanto de uma decisão é dúvida e quanto é medo da consequência?",
      "Quando insistir é consistência e quando é apenas medo de mudar de rota?",
      "Como saber se estou construindo a vida que escolhi ou apenas ficando melhor em sustentar a vida que aconteceu?",
    ],
    fechamento: "Ideias é o lugar onde essas perguntas ganham espaço antes de virar Mapa, ferramenta ou produto.",
    destaque: ["A emoção captura.", "A curiosidade segura.", "O mecanismo explica.", "A ferramenta ajuda.", "O método organiza."],
  },
  destaque: {
    eyebrow: "Ideia em destaque",
    cta: "Continuar esta ideia",
  },
  explore: {
    titulo: "Qual dessas perguntas está mais perto de você hoje?",
    cta: (d: string) => `Explorar ideias sobre ${d}`,
  },
  artigos: {
    eyebrow: "Para ir mais fundo",
    titulo: "Algumas ideias precisam de mais espaço.",
    texto: "Artigos para investigar tensões, contradições e mecanismos com mais profundidade sem transformar a vida em lista de dicas.",
    cta: "Ver todos os artigos",
    ctaCard: "Ler artigo",
  },
  videos: {
    eyebrow: "Ju pensa",
    titulo: "Uma pergunta. Uma ideia. Sem precisar fingir que existe resposta pronta para tudo.",
    texto: [
      "Vídeos curtos em que Ju observa, comenta, questiona e organiza uma tese por vez.",
      "A lógica não é transformar Ju em guru.",
      "É criar um espaço em que a pessoa pense:",
    ],
    citacao: "“Quero ouvir o que a Ju pensa sobre isso.”",
    cta: "Ver todos os vídeos",
  },
  historias: {
    eyebrow: "A vida às vezes fica mais clara quando a gente a vê em outra história",
    titulo: "Filmes, livros, personagens e histórias que ajudam a enxergar alguma coisa que já estava acontecendo com a gente.",
    texto: [
      "Cultura entra no EPIC247 como gatilho emocional e pedagógico.",
      "Não para explicar um filme.",
      "Não para transformar entretenimento em aula.",
      "Mas porque uma boa história às vezes consegue mostrar uma tensão humana antes que a gente consiga nomeá-la.",
    ],
    principio: "vida → cultura → conceito → movimento",
    cta: "Explorar repertório",
  },
  ferramentas: {
    eyebrow: "Quando a ideia precisa encontrar a vida real",
    titulo: "Algumas reflexões merecem um próximo movimento.",
    texto:
      "Perguntas, exercícios, checklists, Mapas e pequenas ferramentas para transformar uma percepção em alguma coisa que possa ser observada, testada ou aplicada.",
    cta: "Explorar ferramentas",
    cta2: "Descobrir meu ponto de fricção",
  },
  newsletter: {
    eyebrow: "Ideias que não precisam disputar sua atenção com o feed",
    titulo: "Uma conversa que pode continuar fora daqui.",
    texto: [
      "Receba ideias, perguntas, histórias, repertório e novas investigações do EPIC247 por e-mail.",
      "Sem a obrigação de transformar toda mensagem em aula ou oferta.",
      "A proposta é continuar a conversa com mais espaço e menos ruído.",
    ],
    consentimento: "Ao assinar, você recebe ideias, conteúdos e novidades do EPIC247. Você pode sair quando quiser.",
  },
  movimento: {
    eyebrow: "Nem toda ideia precisa virar produto",
    titulo: "Mas algumas perguntas pedem que a gente faça alguma coisa com elas.",
    texto: "Quando uma ideia encontra um ponto real de fricção, você pode aprofundar por diferentes caminhos.",
    caminhos: [
      { nome: "Mapa", texto: "Para descobrir onde existe mais fricção hoje.", cta: "Fazer o Mapa", href: "/mapa" },
      { nome: "Dimensão", texto: "Para entender melhor uma área específica da sua Infraestrutura Humana.", cta: "Explorar as dimensões", href: "/dimensoes" },
      { nome: "Plano EPIC", texto: "Para transformar seu resultado em uma semana curta de aplicação.", cta: "Conhecer os Planos", href: "/dimensoes#plano" },
      { nome: "Kit", texto: "Para aprofundar uma dimensão com Manual, Workbook e ferramentas.", cta: "Conhecer os Kits", href: "/dimensoes#kits" },
      { nome: "Protocolo", texto: "Para trabalhar as 10 dimensões como um sistema integrado.", cta: "Conhecer o Protocolo", href: "/protocolo" },
      { nome: "Mentoria", texto: "Para quem quer acompanhamento individual direto.", cta: "Conhecer a Mentoria", href: "/mentoria" },
    ],
  },
  fechamento: {
    titulo: "Uma boa ideia talvez não mude sua vida.",
    sub: "Mas pode mudar a pergunta que você está fazendo. E, às vezes, é daí que uma escolha diferente começa.",
    cta: "Explorar as ideias",
    cta2: "Descobrir meu ponto de fricção",
  },
};
