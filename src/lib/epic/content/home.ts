// Home (Copy Final do Site §4 e §7). APROVADO no Editorial Freeze de
// 02/10/2026: texto literal do documento (conferido por copy-final.test.ts).
// A ordem dos blocos é a do documento; o layout está em src/app/(site)/page.tsx.

import type { DimensionId } from "../dimensions";

export const HOME = {
  seo: {
    titulo: "EPIC247 | Descubra seu ponto de fricção e comece por onde importa",
    descricao:
      "EPIC247 é uma plataforma de transformação pessoal aplicada. Descubra seu ponto de fricção entre 10 dimensões e encontre um próximo passo prático.",
    ogTitulo: "Existe uma distância entre a vida que você vive e a vida que sabe que poderia viver?",
    ogDescricao: "Descubra onde está seu ponto de fricção e comece pela dimensão que mais pede atenção hoje.",
  },
  hero: {
    titulo: "Tem uma distância entre a vida que você vive e a vida que sabe que poderia viver?",
    subtexto: [
      "Nem sempre o problema é falta de disciplina, informação ou vontade.",
      "Às vezes existe um ponto de fricção que você ainda não identificou.",
    ],
    ctaPrimario: "Descubra seu ponto de fricção",
    ctaSecundario: "Entenda o EPIC247",
    micro: "Leva poucos minutos. O resultado aparece na hora.",
    lateral: "Você pode saber o que quer mudar e ainda não saber o que está impedindo essa mudança.",
  },
  reconhecimento: {
    titulo: "Sua vida pode estar funcionando e ainda assim alguma coisa não estar funcionando para você.",
    subtitulo:
      "Às vezes o problema não é que sua vida esteja dando errado. É que você ficou bom demais em fazê-la funcionar no automático.",
    abertura: [
      "Você trabalha. Resolve. Cuida. Entrega. Cumpre o que precisa ser cumprido.",
      "Por fora, muita coisa pode até estar no lugar.",
      "Mas, por dentro, talvez alguma coisa continue pedindo atenção.",
    ],
    cenas: [
      "Você chega ao fim do dia sem energia para aquilo que também importa para você.",
      "Você sabe exatamente o que deveria fazer, mas continua adiando o primeiro passo.",
      "Você conquistou coisas que queria e percebeu que elas já não significam o que significavam antes.",
      "Existe uma decisão que parece tomada por dentro, mas ainda não virou movimento por fora.",
      "Você começa, melhora por alguns dias e depois volta para o mesmo padrão.",
      "Sua vida não está necessariamente ruim. Ela só parece pequena demais para quem você se tornou.",
    ],
    fechamento: [
      "Essas situações parecem diferentes.",
      "Mas todas podem ser sinais de que existe uma fricção entre sua intenção e a forma como sua vida está acontecendo hoje.",
    ],
  },
  mecanismo: {
    eyebrow: "Toda mudança encontra um ponto de fricção",
    titulo: "Talvez você esteja tentando resolver o sintoma certo pelo lugar errado.",
    tentativas: [
      "Às vezes você tenta criar mais disciplina quando está sem energia.",
      "Tenta planejar quando ainda não sabe o que realmente quer.",
      "Tenta agir quando o medo ainda está comandando a decisão.",
      "Tenta descansar quando o problema não é cansaço, mas falta de sentido.",
    ],
    ideia: [
      "O EPIC247 parte de uma ideia simples:",
      "Você não muda sua vida atacando apenas o sintoma.",
      "Você muda quando constrói a infraestrutura que torna essa nova vida possível.",
    ],
    infraestrutura: [
      "Chamamos isso de Infraestrutura Humana.",
      "Ela é formada por dez dimensões que influenciam a forma como você vive, escolhe, muda e sustenta mudanças.",
    ],
    cta: "Veja as 10 dimensões",
  },
  dimensoes: {
    titulo: "10 dimensões da sua vida. Diferentes pontos de fricção.",
    subtitulo: "Você pode começar exatamente onde sua vida pede atenção hoje.",
    fechamento: "Dez portas de entrada. Um sistema integrado.",
  },
  mapa: {
    eyebrow: "Não sabe por onde começar?",
    titulo: "Descubra onde está seu ponto de fricção hoje.",
    texto: [
      "Você não precisa escolher uma dimensão no escuro.",
      "Responda algumas perguntas sobre o que está acontecendo na sua vida agora e descubra qual dimensão parece pedir mais atenção.",
    ],
    listaIntro: "O Mapa de Fricção ajuda você a identificar:",
    lista: ["a dimensão principal", "uma segunda dimensão relacionada", "por onde faz mais sentido aprofundar agora"],
    cta: "Fazer meu Mapa de Fricção",
    micro: "Gratuito. Resultado imediato. Sem diagnóstico clínico.",
  },
  comoFunciona: {
    titulo: "Entender antes de se cobrar. Agir antes de tentar mudar tudo.",
    passos: [
      { nome: "Descubra", texto: "Veja onde sua vida está encontrando mais fricção agora." },
      { nome: "Entenda", texto: "Aprofunde a dimensão e reconheça o padrão que está interferindo no movimento." },
      { nome: "Movimente", texto: "Comece com um primeiro passo concreto, compatível com o que você descobriu." },
      { nome: "Aprofunde", texto: "Use ferramentas, Planos e Kits para trabalhar uma dimensão com mais estrutura." },
      { nome: "Integre", texto: "Quando fizer sentido, conecte as dez dimensões pelo Protocolo EPIC247." },
    ],
    fechamento: ["Você não precisa mudar tudo de uma vez.", "Precisa começar pelo lugar certo."],
  },
  portas: {
    titulo: "Comece onde sua vida está pedindo atenção.",
    subtitulo: "Há mais de uma forma de entrar no EPIC247. Escolha o nível de profundidade que faz sentido agora.",
    // product: o preço vem do catálogo (fonte comercial vigente), não do texto.
    cards: [
      {
        titulo: "Mapas EPIC",
        product: null,
        texto: "Autoavaliações para identificar fricções, padrões e um primeiro movimento em cada dimensão.",
        cta: "Descobrir meu ponto de fricção",
        href: "/mapa",
      },
      {
        titulo: "Plano EPIC 7 Dias",
        product: "plan_energia",
        texto:
          "Um plano curto, personalizado a partir das suas respostas, para transformar reconhecimento em uma semana de movimento intencional.",
        cta: "Entender o Plano",
        href: "/dimensoes#plano",
      },
      {
        titulo: "Kit EPIC da Dimensão",
        product: "kit_energia",
        texto: "Manual, workbook e ferramentas práticas para aprofundar uma dimensão específica.",
        cta: "Explorar os Kits",
        href: "/dimensoes#kits",
      },
      {
        titulo: "Protocolo EPIC247",
        product: "protocol",
        texto: "As dez dimensões organizadas em um sistema para quem quer trabalhar a infraestrutura inteira.",
        cta: "Conhecer o Protocolo",
        href: "/protocolo",
      },
      {
        titulo: "Mentoria EPIC Individual",
        product: "mentoring",
        prefixo: "Preço piloto",
        texto:
          "Acompanhamento individual para quem quer aplicar o sistema a uma mudança específica com mais contexto, estrutura e ritmo.",
        cta: "Conhecer a Mentoria",
        href: "/mentoria",
      },
    ] as { titulo: string; product: string | null; prefixo?: string; texto: string; cta: string; href: string }[],
  },
  protocolo: {
    eyebrow: "Quando uma dimensão não explica tudo",
    titulo: "10 dimensões. Um sistema.",
    texto: [
      "Você pode começar por Energia, Coragem, Ação ou qualquer outra dimensão.",
      "Mas a vida raramente funciona em compartimentos.",
    ],
    cadeia: [
      "Às vezes você tem um plano, mas não tem energia.",
      "Tem energia, mas não tem clareza.",
      "Tem clareza, mas ainda não atravessou o medo.",
      "Começou a agir, mas não consegue sustentar.",
    ],
    fechamento:
      "O Protocolo EPIC247 conecta as dez dimensões da Infraestrutura Humana em uma jornada estruturada de transformação pessoal aplicada.",
    cta: "Conhecer o Protocolo EPIC247",
  },
  ideias: {
    eyebrow: "Ler. Ver. Pensar. Testar.",
    titulo: "Ideias para viver melhor.",
    texto: [
      "Nem toda transformação começa com uma ferramenta.",
      "Às vezes começa com uma pergunta, uma história, um filme, um estudo ou uma ideia que muda a forma como você olha para alguma coisa.",
      "No EPIC247, conteúdo também é parte do método.",
    ],
    categorias: [
      { nome: "Artigos", href: "/ideias/artigos" },
      { nome: "Vídeos", href: "/ideias/videos" },
      { nome: "Newsletter", href: "/ideias/newsletter" },
      { nome: "Repertório", href: "/ideias/repertorio" },
    ],
    cta: "Explorar Ideias",
  },
  ju: {
    eyebrow: "Por trás do EPIC247",
    titulo: "Por que pessoas inteligentes, conscientes e capazes continuam sabendo tanto e mudando tão pouco?",
    texto: [
      "Essa pergunta atravessou anos de trabalho, estudo, observação, construção de negócios e transformação pessoal da Ju Ferreira.",
      "O EPIC247 nasceu da tentativa de organizar essa inquietação em algo aplicável: um sistema para entender onde a mudança encontra fricção e construir as condições para seguir em frente.",
      "Aqui, comportamento não é tratado como fórmula mágica.",
      "A proposta é combinar repertório, método, curiosidade e vida real.",
    ],
    cta: "Conheça a Ju",
  },
  fechamento: {
    titulo: "Você não precisa mudar de vida inteira hoje.",
    subtitulo: "Talvez precise descobrir qual parte dela está pedindo uma escolha diferente agora.",
    ctaPrimario: "Descubra seu ponto de fricção",
    ctaSecundario: "Explorar as 10 dimensões",
    marca: "Da vida que acontece para a vida que você escolhe.",
  },
};

/** Card de cada dimensão no bloco "10 dimensões" da Home (Copy Final §4, bloco 4). */
export const CARD_DIMENSAO: Record<DimensionId, { pergunta: string; texto: string }> = {
  energia: {
    pergunta: "Você está tentando funcionar sem combustível?",
    texto: "Sono, alimentação, estresse, atenção e movimento influenciam muito mais do que disposição.",
  },
  mentalidade: {
    pergunta: "O jeito como você pensa está ajudando ou travando o movimento?",
    texto: "Inteligência pode abrir caminhos. Também pode criar justificativas sofisticadas para não atravessá-los.",
  },
  autoconhecimento: {
    pergunta: "Você ainda está vivendo escolhas feitas por uma versão antiga de você?",
    texto:
      "Identidade, valores, desejos, limites e coerência ajudam a distinguir o que é seu do que apenas continuou acontecendo.",
  },
  felicidade: {
    pergunta: "Sua vida está sendo vivida agora ou sempre depois da próxima coisa?",
    texto:
      "Felicidade não precisa ser um prêmio no final do caminho. Ela também pode fazer parte da forma como o caminho é vivido.",
  },
  planejamento: {
    pergunta: "Você tem direção ou apenas muitas coisas para organizar?",
    texto:
      "Planejar não é controlar tudo. É construir uma rota clara o suficiente para agir e flexível o suficiente para sobreviver à realidade.",
  },
  coragem: {
    pergunta: "O que você já sabe que precisa fazer, mas ainda não atravessou?",
    texto:
      "Algumas mudanças não pedem mais informação. Pedem disposição para lidar com incerteza, consequência e exposição.",
  },
  acao: {
    pergunta: "Você está se preparando para começar ou realmente começou?",
    texto: "Ideias só mudam alguma coisa quando encontram comportamento, repetição e retomada.",
  },
  inteligencia: {
    pergunta: "Você consegue aprender com a realidade quando ela não segue o plano?",
    texto: "Adaptar não é desistir. É usar feedback, emoção e contexto para escolher uma resposta melhor.",
  },
  excelencia: {
    pergunta: "Você está ficando melhor ou apenas mais experiente em repetir o mesmo padrão?",
    texto: "Excelência não é perfeição. É aprimoramento intencional, feedback, prática e refinamento.",
  },
  amor: {
    pergunta: "A transformação que você busca também está produzindo mais presença e sentido?",
    texto:
      "Conexão, relação consigo, pertencimento e contribuição também fazem parte da vida que vale a pena construir.",
  },
};

/** Promessa de marca (Posicionamento §9; fecha a Home e o rodapé na Copy Final). */
export const MANIFESTO = {
  promessa: "Da vida que acontece para a vida que você escolhe.",
};
