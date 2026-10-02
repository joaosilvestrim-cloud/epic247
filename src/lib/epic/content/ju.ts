// Página Ju (Copy Final do Site §22). APROVADO por Luiz/Ju: texto literal.
// Voz em primeira pessoa. "destaque" marca a frase que a página puxa para
// fora do corpo; o resto segue a ordem do documento.

export interface SecaoJu {
  titulo: string;
  linhas: string[];
  destaque?: string;
  /** Linhas que voltam ao corpo depois do destaque. */
  depois?: string[];
  cta?: { label: string; href: string };
}

export const JU = {
  seo: {
    titulo: "Ju Ferreira | Transformação Pessoal Aplicada e EPIC247",
    descricao:
      "Conheça Ju Ferreira, criadora do EPIC247, e a investigação por trás de seu trabalho sobre comportamento, escolhas e transformação pessoal aplicada.",
  },
  hero: {
    nome: "Ju Ferreira",
    titulo:
      "Passei a vida resolvendo problemas. Até perceber que alguns dos mais difíceis não estavam nas empresas, nos sistemas ou na tecnologia. Estavam em nós.",
    texto: [
      "Passei mais de duas décadas entre tecnologia, vendas, empresas, liderança, empreendedorismo, erros, recomeços e decisões que precisavam funcionar fora do PowerPoint.",
    ],
    pergunta:
      "Por que pessoas inteligentes conseguem entender tanto sobre a própria vida e, ainda assim, têm tanta dificuldade para mudar algumas partes dela?",
    depois:
      "Essa pergunta passou a atravessar meu trabalho, meus estudos e também minhas próprias contradições. Foi dela, muito mais do que de uma resposta pronta, que nasceu boa parte do que faço hoje.",
    ctaPrimario: { label: "Conheça as ideias da Ju", href: "/ideias" },
    ctaSecundario: { label: "Entenda o EPIC247", href: "#epic247" },
  },
  secoes: [
    {
      titulo: "Uma pergunta que foi crescendo",
      linhas: [
        "Durante muito tempo, achei que transformação fosse principalmente um problema de conhecimento.",
        "Se uma pessoa tivesse mais informação, poderia decidir melhor.",
        "Se tivesse um bom plano, conseguiria executar.",
        "Se entendesse o que precisava mudar, mudaria.",
        "A vida foi me mostrando que não era tão simples.",
        "Conheci pessoas extremamente inteligentes que permaneciam anos diante da mesma decisão.",
        "Profissionais competentes que construíram carreiras bem-sucedidas, mas não reconheciam mais a própria vida.",
        "Pessoas que sabiam exatamente o que deveriam fazer e, ainda assim, não conseguiam fazer.",
        "E também vivi minhas próprias contradições.",
        "Construí empresas. Acertei. Errei. Perdi dinheiro. Recomecei. Soube o que precisava fazer e nem sempre consegui fazer.",
        "Foi ficando difícil ignorar a distância entre duas coisas:",
      ],
      destaque: "saber o que fazer e conseguir transformar esse saber em vida.",
      depois: ["Essa distância passou a me interessar profundamente."],
    },
    {
      titulo: "Uma trajetória que não começou aqui",
      linhas: [
        "Eu não cheguei até essa pergunta por uma linha reta.",
        "Sou engenheira de formação e mestre em Administração.",
        "Minha trajetória passou por tecnologia, vendas, estratégia, liderança, empreendedorismo, inovação e construção de negócios.",
        "Durante muitos anos, meu trabalho foi resolver problemas.",
        "Entender sistemas.",
        "Encontrar gargalos.",
        "Criar estratégias.",
        "Tomar decisões.",
        "Construir caminhos para sair de um estado e chegar a outro.",
        "Com o tempo, comecei a perceber algo curioso:",
        "os sistemas mais difíceis de transformar não eram necessariamente tecnológicos ou empresariais. Eram humanos.",
        "Porque uma empresa pode ter um plano e não executá-lo.",
        "Uma equipe pode conhecer a estratégia e continuar repetindo os mesmos comportamentos.",
        "Uma pessoa pode desejar profundamente uma mudança e continuar construindo, todos os dias, exatamente a vida da qual gostaria de sair.",
        "Foi aí que estratégia e comportamento começaram a se encontrar para mim.",
      ],
    },
    {
      titulo: "O problema nem sempre é falta de vontade",
      linhas: [
        "Talvez a pergunta não seja “por que você ainda não mudou?”",
        "Talvez seja:",
        "o que está tornando essa mudança tão difícil?",
        "Essa diferença parece pequena.",
        "Não é.",
        "Durante muito tempo, tratamos transformação pessoal como uma questão quase moral.",
        "Disciplina.",
        "Força de vontade.",
        "Foco.",
        "Comprometimento.",
        "Mentalidade.",
        "Mas pessoas reais são mais complexas.",
        "Você pode querer mudar e estar exausto.",
        "Pode saber o que quer e ter medo das consequências.",
        "Pode ter um plano e não conseguir começar.",
        "Pode conquistar aquilo que desejou durante anos e descobrir que já não deseja mais a mesma coisa.",
        "Pode continuar funcionando perfeitamente enquanto alguma parte da sua vida deixou de fazer sentido.",
        "Foi daí que nasceu uma das ideias centrais do meu trabalho:",
      ],
      destaque: "Antes de se cobrar mais, talvez seja preciso entender melhor onde está a fricção.",
    },
    {
      titulo: "Da performance para a vida",
      linhas: [
        "Eu me interesso menos pela ideia de “virar sua melhor versão” e mais pela possibilidade de viver uma vida que ainda faça sentido para você.",
        "Não acredito que a vida seja um projeto permanente de otimização.",
        "Nem que toda dificuldade precise ser convertida em produtividade.",
        "Nem que exista uma fórmula universal para uma vida bem vivida.",
        "O que me interessa é outra coisa.",
        "Como fazemos escolhas mais conscientes?",
        "Como percebemos quando estamos vivendo por repetição?",
        "Como distinguimos aquilo que realmente queremos daquilo que simplesmente aprendemos a querer?",
        "Como transformamos consciência em movimento?",
        "Como construímos uma vida capaz de comportar aquilo que estamos nos tornando?",
        "Essas perguntas estão no centro do meu trabalho hoje.",
      ],
      destaque: "Possibilidade sem realidade vira fantasia. Realidade sem possibilidade vira resignação.",
      depois: [
        "O que me interessa é o espaço entre as duas: imaginar o que pode ser diferente sem perder contato com aquilo que a realidade exige para que a mudança exista de verdade.",
      ],
    },
    {
      titulo: "Infraestrutura Humana",
      linhas: [
        "Mudar uma decisão é relativamente fácil. Sustentar uma vida diferente é outra história.",
        "Trabalhando durante anos com tecnologia, empresas e transformação, fui percebendo que nenhum sistema muda sozinho. Sempre existe gente decidindo, resistindo, interpretando, tentando, errando, se adaptando ou protegendo alguma coisa.",
        "E, ao longo da própria vida, empreender, errar, recomeçar e me tornar mãe também foram mudando a natureza das perguntas que eu fazia.",
        "Quanto mais estudei e observei processos de transformação, mais uma ideia começou a aparecer:",
        "algumas mudanças fracassam porque tentamos construir uma vida nova usando a mesma infraestrutura que sustentava a vida anterior.",
        "Você decide mudar.",
        "Mas sua energia continua no limite.",
        "Sua forma de interpretar continua igual.",
        "Sua rotina continua ocupada pelas mesmas prioridades.",
        "Seu medo continua tomando decisões silenciosamente.",
        "Seu ambiente continua puxando você na direção anterior.",
        "Sua capacidade de agir continua dependendo de motivação.",
        "A mudança existe como intenção, mas não encontra estrutura para permanecer.",
        "É isso que passei a chamar de Infraestrutura Humana.",
        "O conjunto de condições internas e práticas que torna uma determinada forma de viver possível.",
      ],
    },
    {
      titulo: "O EPIC247",
      linhas: [
        "O EPIC247 nasceu dessa investigação.",
        "Não para ensinar uma fórmula de felicidade.",
        "Não para dizer quem alguém deveria se tornar.",
        "E muito menos para diagnosticar pessoas.",
        "O EPIC247 é uma plataforma de Transformação Pessoal Aplicada.",
        "Um sistema para ajudar pessoas a observar a própria vida, identificar pontos de fricção e construir condições mais favoráveis para mudar aquilo que escolheram mudar.",
        "Organizamos essa investigação em dez dimensões que atravessam a vida real, da energia e da forma de pensar à coragem, à ação, às relações, ao aprendizado e ao sentido.",
        "Nenhuma dessas dimensões explica uma pessoa inteira. Juntas, ajudam a fazer perguntas melhores.",
      ],
      cta: { label: "Explorar as dimensões", href: "/dimensoes" },
    },
    {
      titulo: "Como eu penso",
      linhas: [
        "Não quero ensinar você a viver a minha vida.",
        "Tenho cada vez menos interesse em respostas universais.",
        "Prefiro boas perguntas.",
        "Modelos que ajudam a enxergar.",
        "Ferramentas que podem ser testadas.",
        "Ideias que sobrevivem ao encontro com a vida real.",
        "Meu trabalho mistura repertórios diferentes porque minha própria trajetória sempre foi assim.",
        "Estratégia.",
        "Comportamento.",
        "Tecnologia.",
        "Negócios.",
        "Cultura.",
        "Filosofia.",
        "Ciência.",
        "Experiência.",
        "Não para transformar tudo em uma teoria única.",
        "Mas para procurar conexões que possam ajudar alguém a olhar para uma questão conhecida de um jeito diferente.",
        "Quase sempre me interesso pelo espaço entre duas coisas.",
        "Entre saber e fazer.",
        "Entre querer mudar e conseguir sustentar a mudança.",
        "Entre capacidade e direção.",
        "Entre aquilo que aconteceu e aquilo que ainda pode ser escolhido.",
        "Talvez seja por isso que meu trabalho quase sempre comece no “entre”.",
        "Existe uma frase que resume bem essa postura:",
      ],
      destaque: "A escolha continua sendo sua.",
    },
    {
      titulo: "O que você não vai encontrar aqui",
      linhas: [
        "Este trabalho tem limites. E eles importam.",
        "Não sou psicóloga, e o EPIC247 não oferece diagnóstico psicológico ou médico. Os Mapas são ferramentas educativas de autoavaliação e reflexão e não substituem psicoterapia, avaliação profissional ou cuidados de saúde quando necessários.",
        "Também não acredito que toda dificuldade seja individual. Contexto, relações, saúde, dinheiro e ambiente importam.",
        "Reconhecer esses limites não diminui nossa capacidade de escolha. Torna essa escolha mais humana e mais honesta.",
      ],
    },
  ] as SecaoJu[],
  ideias: {
    titulo: "Ideias",
    linhas: [
      "Meu trabalho começa quase sempre com uma pergunta.",
      "Algumas viram artigos.",
      "Outras viram vídeos.",
      "Algumas aparecem em uma terça-feira qualquer.",
      "Outras passam meses ou anos sendo investigadas antes de encontrar uma forma.",
      "Na página Ideias, reúno aquilo que estou pensando, estudando, questionando e tentando compreender sobre futuros, tecnologia, comportamento e transformação humana.",
    ],
    cta: "Explorar Ideias",
  },
  trabalhar: {
    titulo: "Trabalhar comigo",
    linhas: [
      "Algumas perguntas precisam de mais espaço.",
      "Para quem quer atravessar uma questão individual com acompanhamento estruturado, existe a Mentoria EPIC Individual.",
      "Não é terapia.",
      "Não é aconselhamento sobre como você deveria viver.",
      "É um processo para organizar a questão, identificar fricções, transformar reflexão em escolhas e construir um plano de aplicação.",
    ],
    cta: "Conhecer a Mentoria",
  },
  fechamento: {
    linhas: [
      "Eu também continuo tentando entender, escolher, construir, errar melhor e mudar de ideia quando a realidade pede.",
      "Talvez transformar a própria vida não comece encontrando uma resposta.",
      "Talvez comece percebendo que algumas das respostas que você vinha usando já não servem mais.",
      "E então fazendo uma pergunta diferente.",
    ],
    pergunta: "Que vida você escolheria construir se não precisasse continuar vivendo apenas a vida que aconteceu?",
    cta: "Descubra seu ponto de fricção",
  },
};
