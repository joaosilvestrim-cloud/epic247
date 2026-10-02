// Página da Mentoria EPIC Individual: "Copy Final do Site" §21 (PROPOSTA
// FINAL), texto do cliente sem edição. Microcopy do formulário: §21 a §23
// do Sistema Global de Microcopy e "Microcopy específica — Mentoria".
// Ficam de fora as notas internas do documento (de implementação, de
// precisão e comerciais): elas orientam a equipe, não o visitante.

import { pendente, type Copy } from "./copy";

export const MENTORIA_SEO = {
  title: "Mentoria EPIC Individual | Acompanhamento de transformação pessoal aplicada",
  description:
    "Conheça a Mentoria EPIC Individual: 4 encontros ao longo de 6 semanas, Plano EPIC individual, tarefas, materiais selecionados e acompanhamento estruturado.",
  ogTitle: "Quando entender não basta. É hora de construir o próximo movimento.",
  ogDescription:
    "Um processo individual com Ju Ferreira para organizar contexto, prioridades, aplicação e ajustes ao longo de seis semanas.",
};

export const MENTORIA_PAGINA = {
  hero: {
    eyebrow: "Mentoria EPIC Individual",
    titulo:
      "Quando você não quer apenas entender o que precisa mudar. Quer construir o próximo movimento com acompanhamento.",
    sub: "A Mentoria EPIC Individual combina leitura inicial do seu contexto, Plano EPIC individual, quatro encontros ao longo de seis semanas, tarefas entre os encontros, materiais selecionados e acompanhamento estruturado.",
    cta: "Quero conhecer a Mentoria",
    ctaSecundario: "Entender como funciona",
    micro: "Formato piloto. Capacidade inicial limitada a 5 clientes ativos.",
  },
  reconhecimento: {
    titulo: "Talvez você já tenha clareza suficiente para perceber que sozinho continua voltando aos mesmos pontos.",
    abertura: [
      "Você pode já ter lido, refletido, feito planos e entendido bastante sobre si.",
      "Mesmo assim, algumas decisões continuam difíceis de organizar.",
      "Algumas fricções aparecem ao mesmo tempo.",
      "Alguns movimentos perdem força quando a vida real entra no caminho.",
    ],
    cenas: [
      "Você sabe que precisa mudar alguma coisa, mas ainda não conseguiu transformar percepção em sequência prática.",
      "Já começou processos importantes e percebe que perde consistência quando surgem pressão, dúvida ou imprevisto.",
      "Existem várias dimensões envolvidas e você não sabe qual merece prioridade agora.",
      "Você consegue enxergar o problema, mas tem dificuldade de observar o próprio padrão enquanto está dentro dele.",
      "Quer um espaço estruturado para pensar, escolher, aplicar e revisar sem depender apenas de conteúdo genérico.",
    ],
    fechamento: [
      "A Mentoria não substitui sua decisão.",
      "Ela cria estrutura para que você consiga enxergá-la, testá-la e sustentá-la com mais clareza.",
    ],
  },
  oQueE: {
    eyebrow: "Acompanhamento individual",
    titulo: "Um processo estruturado para transformar contexto em próximos passos reais.",
    texto: [
      "A Mentoria EPIC Individual é a camada de acompanhamento direto do ecossistema EPIC247.",
      "O trabalho parte da sua realidade, identifica as fricções mais relevantes, organiza prioridades e constrói um Plano EPIC individual para as semanas seguintes.",
    ],
    encontrosIntro: "Durante o processo, os encontros servem para:",
    encontros: [
      "compreender melhor o contexto;",
      "organizar prioridades;",
      "transformar reflexão em decisão prática;",
      "revisar o que aconteceu entre os encontros;",
      "ajustar o plano quando a realidade muda;",
      "selecionar ferramentas e materiais que façam sentido para o momento.",
    ],
    destaque: [
      "A Mentoria não existe para dizer como você deve viver.",
      "Existe para ajudar você a participar com mais clareza das escolhas que já são suas.",
    ],
  },
  formato: {
    titulo: "Quatro encontros. Seis semanas. Um processo individual.",
    intro: "Formato inicial:",
    itens: [
      "4 encontros individuais;",
      "distribuídos ao longo de 6 semanas;",
      "leitura inicial do contexto;",
      "Plano EPIC individual;",
      "tarefas entre encontros;",
      "materiais selecionados;",
      "acompanhamento estruturado ao longo do processo.",
    ],
  },
  processo: {
    titulo: "O processo começa pela vida real, não por um roteiro pronto.",
    etapas: [
      { nome: "Leitura inicial", texto: "Entender o contexto atual, as principais tensões, o que já foi tentado e quais dimensões parecem mais relevantes." },
      { nome: "Prioridade", texto: "Separar o que é importante do que é urgente, identificar o principal ponto de fricção e escolher onde concentrar atenção primeiro." },
      { nome: "Plano EPIC individual", texto: "Transformar a leitura do contexto em um conjunto de próximos movimentos, observações e práticas ajustadas à realidade da pessoa." },
      { nome: "Aplicação entre encontros", texto: "Testar decisões, ferramentas, tarefas e pequenas mudanças na vida real." },
      { nome: "Revisão e ajuste", texto: "Observar o que funcionou, o que travou, o que mudou e como o plano precisa ser ajustado." },
      { nome: "Continuidade", texto: "Encerrar o ciclo com mais clareza sobre o que deve continuar sendo trabalhado e quais próximos passos fazem sentido." },
    ],
  },
  dimensoes: {
    eyebrow: "Infraestrutura Humana",
    titulo: "Nem todo problema precisa das 10 dimensões ao mesmo tempo. Mas enxergar o sistema evita trabalhar a parte errada.",
    texto: [
      "Energia, Mentalidade, Autoconhecimento, Felicidade, Planejamento, Coragem, Ação, Inteligência, Excelência e Amor funcionam como lentes para entender onde a transformação encontra mais fricção.",
      "Na Mentoria, essas dimensões podem ajudar a organizar a conversa e a escolha de ferramentas.",
      "Isso não significa percorrer obrigatoriamente as dez em seis semanas.",
      "O foco deve acompanhar o contexto real da pessoa.",
    ],
    destaque: "Começar pelo lugar certo vale mais do que tentar trabalhar tudo ao mesmo tempo.",
  },
  paraQuem: {
    titulo: "A Mentoria faz mais sentido quando você quer acompanhamento para aplicar, escolher e ajustar.",
    simIntro: "Pode fazer sentido para você se:",
    sim: [
      "existe uma mudança importante que você quer organizar e colocar em movimento;",
      "mais de uma dimensão da sua vida parece envolvida no problema;",
      "você já percebeu padrões recorrentes e quer trabalhar com mais estrutura;",
      "sente que conteúdo e ferramentas ajudam, mas não substituem uma conversa individual sobre o seu contexto;",
      "quer um processo com encontros, tarefas e revisão ao longo de algumas semanas;",
      "consegue assumir responsabilidade pelas decisões e aplicações construídas durante o processo.",
    ],
    naoIntro: "Talvez não seja a oferta adequada se:",
    nao: [
      "você procura psicoterapia, diagnóstico ou tratamento de saúde mental;",
      "espera que alguém tome decisões pessoais por você;",
      "busca apenas material para consumir no próprio ritmo. Nesse caso, Kits ou Protocolo podem fazer mais sentido;",
      "precisa de suporte emergencial ou de manejo de crise, que não é a função da Mentoria EPIC.",
    ],
  },
  comparacao: {
    titulo: "Sistema para aplicar sozinho ou acompanhamento individual?",
    colunas: [
      {
        nome: "Protocolo EPIC247",
        formato: "Jornada estruturada pelas 10 dimensões com materiais, ferramentas e mapa de progresso.",
        indicado: "Quem quer trabalhar com autonomia e no próprio ritmo.",
        precoRotulo: "Preço inicial",
        preco: "R$497.",
        href: "/protocolo",
      },
      {
        nome: "Mentoria EPIC Individual",
        formato:
          "4 encontros ao longo de 6 semanas + leitura inicial + Plano EPIC individual + tarefas + materiais selecionados + acompanhamento estruturado.",
        indicado: "Quem quer acompanhamento direto para organizar contexto, prioridades, aplicação e ajustes.",
        precoRotulo: "Preço piloto",
        preco: "R$1.997.",
        href: null,
      },
    ],
    fechamento: [
      "A Mentoria não substitui o Protocolo, e o Protocolo não substitui a Mentoria.",
      "São níveis diferentes de profundidade e acompanhamento dentro do mesmo ecossistema.",
    ],
  },
  recebe: {
    titulo: "Um processo individual com estrutura suficiente para não depender apenas da conversa do encontro.",
    intro: "Inclui:",
    itens: [
      "leitura inicial do contexto;",
      "4 encontros individuais ao longo de 6 semanas;",
      "Plano EPIC individual;",
      "tarefas entre os encontros;",
      "materiais selecionados de acordo com o processo;",
      "acompanhamento estruturado.",
    ],
  },
  plano: {
    eyebrow: "Do contexto para o movimento",
    titulo: "Seu processo precisa produzir próximos passos, não apenas boas conversas.",
    texto: [
      "O Plano EPIC individual organiza o que foi compreendido durante o processo em prioridades, próximos movimentos, observações e práticas aplicáveis.",
      "Ele deve funcionar como referência para as semanas da Mentoria e ser ajustado conforme a experiência real produz novos dados.",
    ],
    destaque: ["Plano não é sentença.", "É hipótese de ação que melhora quando encontra a vida real."],
  },
  vagas: {
    eyebrow: "Formato piloto",
    titulo: "A primeira fase será limitada a 5 clientes ativos.",
    texto: [
      "O formato inicial prevê quatro encontros por cliente ao longo de seis semanas.",
      "Com cinco clientes ativos, isso representa 20 encontros no ciclo, além de preparação e acompanhamento.",
      "Por isso, a capacidade inicial foi limitada a cinco vagas.",
    ],
    listaEspera: "Deixe seus dados para ser avisado quando houver possibilidade real de abertura de uma nova vaga.",
    destaque: "A limitação é operacional. Não é escassez artificial.",
  },
  investimento: {
    eyebrow: "Mentoria EPIC Individual",
    titulo: "Investimento do formato piloto: R$1.997",
    intro: "Inclui:",
    itens: [
      "4 encontros ao longo de 6 semanas;",
      "leitura inicial do contexto;",
      "Plano EPIC individual;",
      "tarefas entre encontros;",
      "materiais selecionados;",
      "acompanhamento estruturado.",
    ],
    pagamentoRotulo: "Pagamento:",
    pagamento: "Pix ou cartão.",
    ctaDisponivel: "Quero participar da Mentoria EPIC",
    ctaEspera: "Entrar na lista de espera",
    micro: [
      "Máximo inicial de 5 clientes ativos no piloto.",
      "O envio do formulário não reserva automaticamente uma vaga. A vaga é confirmada após retorno e pagamento.",
    ],
  },
  ju: {
    titulo: "A Mentoria acontece diretamente com Ju Ferreira.",
    texto:
      "No EPIC247, Ju conduz o processo individual usando a arquitetura das dez dimensões, os Mapas, ferramentas e materiais do ecossistema como apoio para organizar reflexão e aplicação.",
    cta: "Conhecer a Ju",
  },
  naoE: {
    titulo: "Acompanhamento individual não significa terceirizar a própria vida.",
    intro: "A Mentoria EPIC Individual não é:",
    itens: [
      "psicoterapia;",
      "avaliação psicológica;",
      "diagnóstico clínico;",
      "tratamento de saúde mental;",
      "consultoria médica;",
      "promessa de transformação garantida;",
      "serviço em que Ju decide o que você deve fazer.",
    ],
    complemento:
      "Decisões sobre relacionamento, carreira, saúde, finanças ou outras áreas de alto impacto continuam pertencendo à pessoa e podem exigir profissionais especializados quando apropriado.",
    destaque:
      "A Mentoria organiza reflexão, escolha e aplicação. Não substitui especialistas quando o contexto exige especialização.",
  },
  // As três respostas marcadas como pendentes descrevem decisões que a
  // operação ainda não tomou. Aparecem só em staging até a definição.
  faq: [
    { p: "Quantos encontros estão incluídos?", r: "O formato piloto inclui quatro encontros individuais distribuídos ao longo de seis semanas." },
    {
      p: "Quanto tempo dura cada encontro?",
      r: pendente("A duração de cada encontro ainda precisa ser formalmente definida na operação antes da publicação final. Não deve ser inferida ou anunciada sem essa decisão."),
    },
    {
      p: "Existe suporte entre os encontros?",
      r: pendente("O formato aprovado prevê acompanhamento estruturado e tarefas entre encontros. O canal, frequência e prazo de resposta desse acompanhamento ainda precisam ser definidos operacionalmente antes de serem prometidos ao cliente."),
    },
    { p: "Preciso ter feito o Protocolo antes?", r: "Não. A escada do EPIC247 não é obrigatória. A pessoa pode entrar diretamente na Mentoria quando esse formato fizer sentido para seu momento." },
    { p: "Preciso fazer os Mapas antes?", r: "Não obrigatoriamente. Mapas podem ser usados como apoio para organizar a leitura do contexto, mas a documentação aprovada não os define como pré-requisito de compra." },
    {
      p: "A Mentoria inclui o Protocolo completo?",
      r: pendente("A documentação atual informa materiais selecionados dentro da Mentoria, mas não estabelece que a compra inclua automaticamente o Protocolo EPIC247 completo. Não comunicar inclusão do Protocolo sem uma decisão comercial explícita."),
    },
    { p: "A Mentoria é terapia?", r: "Não. É um processo de transformação pessoal aplicada e acompanhamento estruturado. Não substitui psicoterapia, avaliação psicológica, atendimento médico ou outros serviços profissionais quando necessários." },
    { p: "Existem quantas vagas?", r: "A capacidade inicial do piloto é de cinco clientes ativos. Quando esse limite for atingido, novas pessoas entram em lista de espera." },
    { p: "O investimento pode ser parcelado?", r: "O pagamento poderá ser feito por Pix ou cartão. As condições específicas de parcelamento devem ser mostradas apenas conforme configuração real do checkout." },
  ] as { p: string; r: Copy }[],
  fechamento: {
    titulo: "Você continua sendo a pessoa que escolhe. A Mentoria ajuda a transformar escolha em caminho.",
    sub: "Se o que falta agora não é mais informação, mas estrutura para organizar contexto, prioridade, aplicação e ajuste, a Mentoria EPIC Individual pode ser o próximo passo.",
    ctaDisponivel: "Quero participar da Mentoria EPIC",
    ctaEspera: "Entrar na lista de espera",
    ctaSecundario: "Prefiro começar pelo meu ponto de fricção",
    marca: "Da vida que acontece para a vida que você escolhe.",
  },
};

/** Formulário e confirmações (Microcopy §3, §4, §21 e §23). */
export const MENTORIA_FORM = {
  tituloInteresse: "Conte um pouco sobre o que você quer trabalhar.",
  tituloEspera: "Entrar na lista de espera",
  textoEspera: "Deixe seus dados para ser avisado quando houver possibilidade real de abertura de uma nova vaga.",
  nome: "Nome",
  email: "E-mail",
  whatsapp: "WhatsApp",
  opcional: "opcional",
  pergunta: "Em poucas palavras, o que você gostaria de trabalhar neste momento?",
  marketing: "Quero receber também ideias, conteúdos e novidades do EPIC247.",
  operacional: "Ao enviar, você autoriza o uso dos dados informados para responder a esta solicitação.",
  sensiveis:
    "Não envie informações médicas, psicológicas ou outros dados pessoais sensíveis que não sejam necessários para esta solicitação.",
  enviarInteresse: "Enviar meu interesse",
  enviarEspera: "Entrar na lista de espera",
  enviando: "Só um instante…",
  falha: "Não conseguimos enviar agora. Seus dados não foram confirmados. Tente novamente.",
  conexao: "Parece que a conexão foi interrompida. Verifique sua internet e tente novamente.",
  okInteresse: "Recebemos seu interesse na Mentoria EPIC Individual.",
  okInteresseTexto:
    "Vamos revisar as informações enviadas e entrar em contato para confirmar se existe aderência e disponibilidade real para este ciclo. O pagamento só acontece depois dessa confirmação.",
  okEspera: "Você entrou na lista de espera da Mentoria EPIC Individual.",
  okEsperaTexto: "Avisaremos quando houver possibilidade real de abertura de uma nova vaga.",
};
