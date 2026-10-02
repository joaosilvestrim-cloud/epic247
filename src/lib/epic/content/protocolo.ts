// Página do Protocolo EPIC247 (Copy Final §20). PROPOSTA FINAL.
// Preço e condições de pagamento vêm do catálogo/checkout (fonte comercial).

import type { DimensionId } from "../dimensions";

export const PROTOCOLO_PAGINA = {
  seo: {
    titulo: "Protocolo EPIC247 | 10 dimensões da Infraestrutura Humana",
    descricao:
      "Conheça o Protocolo EPIC247, uma jornada estruturada pelas 10 dimensões da Infraestrutura Humana com Manuais, Workbooks, ferramentas e mapa de progresso.",
    ogTitulo: "10 dimensões. Um sistema para construir a vida que você escolhe.",
    ogDescricao:
      "Integre Energia, Mentalidade, Autoconhecimento, Felicidade, Planejamento, Coragem, Ação, Inteligência, Excelência e Amor em uma jornada prática de transformação pessoal aplicada.",
  },
  hero: {
    eyebrow: "Protocolo EPIC247",
    titulo: "10 dimensões. Um sistema para construir a vida que você escolhe.",
    sub: [
      "Você pode começar exatamente onde sua vida pede atenção hoje.",
      "Mas algumas mudanças não se sustentam quando tratamos uma parte da vida isoladamente.",
      "O Protocolo EPIC247 integra as dez dimensões da Infraestrutura Humana em uma jornada prática de transformação pessoal aplicada.",
    ],
    cta: "Quero conhecer o Protocolo",
    cta2: "Ver as 10 dimensões",
    micro: "Acesso ao sistema completo. 10 Manuais + 10 Workbooks + ferramentas + sequência recomendada + mapa de progresso.",
  },
  reconhecimento: {
    titulo: "Às vezes você resolve uma parte e descobre que a próxima fricção estava esperando logo depois.",
    cadeia: [
      "Você organiza o plano, mas falta energia.",
      "Recupera energia, mas continua adiando uma decisão.",
      "Toma a decisão, mas o medo cresce.",
      "Atravessa o medo, começa, mas não sustenta.",
      "Sustenta, melhora, conquista e então percebe que ainda falta sentido.",
    ],
    texto: [
      "A vida não acontece em departamentos separados.",
      "As dimensões se encontram o tempo inteiro.",
      "Por isso, o EPIC247 pode ser usado de duas formas:",
    ],
    formas: [
      "começar por uma dimensão específica quando existe uma fricção clara",
      "percorrer o Protocolo completo quando a transformação exige olhar o sistema inteiro",
    ],
    fechamento: ["Uma dimensão pode abrir a porta.", "O Protocolo ajuda a enxergar a casa inteira."],
  },
  tese: {
    eyebrow: "Infraestrutura Humana",
    titulo: "Você não muda sua vida atacando apenas o sintoma.",
    texto: [
      "Mudanças sustentáveis não dependem apenas de informação, motivação ou força de vontade.",
      "Elas precisam de condições.",
    ],
    condicoes: [
      "Energia para começar.",
      "Mentalidade para interpretar.",
      "Autoconhecimento para escolher.",
      "Felicidade para não adiar a vida inteira.",
      "Planejamento para transformar desejo em caminho.",
      "Coragem para atravessar o medo.",
      "Ação para sair do papel.",
      "Inteligência para adaptar a rota.",
      "Excelência para continuar melhorando.",
      "Amor para lembrar por que tudo isso importa.",
    ],
    destaque: "Chamamos esse conjunto de Infraestrutura Humana.",
    fechamento: "O Protocolo EPIC247 é a forma estruturada de trabalhar essas dez dimensões como sistema.",
  },
  dimensoes: {
    titulo: "Dez dimensões. Dez perguntas diferentes. Uma vida só.",
  },
  funciona: {
    eyebrow: "Uma jornada estruturada",
    titulo: "Entender. Aplicar. Observar. Ajustar. Continuar.",
    texto: [
      "O Protocolo organiza a transformação em uma sequência recomendada pelas dez dimensões.",
      "A lógica não é consumir conteúdo por consumir.",
      "É trabalhar uma dimensão, aplicar ferramentas, observar o que muda, registrar aprendizados e avançar com mais clareza para a próxima.",
    ],
    passos: [
      { nome: "Compreender", texto: "Entender o papel da dimensão e reconhecer como ela aparece na sua vida." },
      { nome: "Observar", texto: "Identificar comportamentos, escolhas, padrões e situações que merecem atenção." },
      { nome: "Aplicar", texto: "Usar ferramentas e exercícios para transformar reflexão em prática." },
      { nome: "Registrar", texto: "Usar os Workbooks e o mapa de progresso para acompanhar o que foi percebido, testado e ajustado." },
      { nome: "Integrar", texto: "Conectar o aprendizado daquela dimensão ao restante da sua vida e seguir para a próxima etapa." },
    ],
    destaque: "Clareza → Ação → Consistência.",
  },
  incluido: {
    titulo: "Não é uma biblioteca de arquivos. É um sistema de aplicação.",
    abertura: "O Protocolo reúne os materiais das dez dimensões dentro de uma única jornada.",
    itens: [
      "10 Manuais EPIC, um para cada dimensão",
      "10 Workbooks de aplicação",
      "ferramentas práticas associadas às dimensões",
      "sequência recomendada das 10 etapas",
      "mapa de progresso",
      "orientações de aplicação",
      "conexão entre as dimensões para evitar trabalhar sintomas isoladamente",
    ],
  },
  paraQuem: {
    titulo: "O Protocolo faz mais sentido quando você quer trabalhar a transformação como sistema.",
    sim: [
      "já percebeu que uma única dimensão não explica tudo o que está acontecendo",
      "sente diferentes fricções aparecendo em sequência",
      "quer uma estrutura para trabalhar as dez dimensões de forma organizada",
      "prefere aplicar no próprio ritmo usando materiais e ferramentas práticas",
      "quer construir condições para sustentar mudança, e não apenas resolver um episódio isolado",
      "já entrou no EPIC por um Mapa, Plano ou Kit e quer integrar o processo",
    ],
    nao: [
      "existe uma única questão muito clara que você quer trabalhar agora",
      "você ainda não sabe por onde começar e prefere primeiro fazer o Mapa de Fricção",
      "o que você busca é acompanhamento individual direto da Ju. Nesse caso, veja a Mentoria EPIC Individual",
    ],
    ctas: ["Descobrir meu ponto de fricção", "Conhecer a Mentoria"],
  },
  kitOuProtocolo: {
    titulo: "Começar por uma parte ou trabalhar o sistema inteiro?",
    kit: { paraQuem: "Tem uma fricção específica e quer aprofundar uma única dimensão.", inclui: "Manual + Workbook + ferramentas práticas daquela dimensão." },
    protocolo: {
      paraQuem: "Quer integrar as dez dimensões em uma jornada completa.",
      inclui: "10 Manuais + 10 Workbooks + ferramentas + sequência recomendada + mapa de progresso + orientações de aplicação.",
    },
    fechamento: [
      "Você não precisa comprar o Protocolo para começar no EPIC247.",
      "Mas, quando a questão deixa de ser uma dimensão isolada e passa a ser a forma como as dimensões se conectam, o Protocolo é a oferta de integração.",
    ],
  },
  mapas: {
    eyebrow: "Comece pelo que está acontecendo agora",
    titulo: "Você não precisa percorrer o sistema fingindo que todas as dimensões estão igualmente importantes hoje.",
    texto: "Os Mapas EPIC ajudam você a identificar onde existe mais fricção no momento.",
    podeIntro: "Você pode:",
    pode: [
      "fazer o Mapa de Fricção para encontrar a dimensão que mais pede atenção",
      "aprofundar com o Mapa específico daquela dimensão",
      "usar essa leitura como contexto de entrada no Protocolo",
    ],
    importante: "Os Mapas são ferramentas educativas de autoavaliação. Não são diagnósticos clínicos nem avaliações psicológicas.",
    cta: "Descobrir meu ponto de fricção",
  },
  naoPromete: {
    titulo: "Sem fórmula mágica. Sem personagem perfeito. Sem promessa de transformação instantânea.",
    texto: [
      "O EPIC247 não é terapia.",
      "Não é coaching motivacional.",
      "Não é curso de produtividade.",
      "Não promete alta performance permanente.",
      "Não oferece uma rotina perfeita para copiar.",
      "O Protocolo oferece estrutura para compreender, aplicar, observar e ajustar.",
    ],
    destaque: [
      "O objetivo não é controlar tudo o que acontece.",
      "É participar mais conscientemente das escolhas que constroem quem você está se tornando.",
    ],
  },
  oferta: {
    eyebrow: "Protocolo EPIC247",
    titulo: "Construa sua Infraestrutura Humana como um sistema.",
    itens: ["10 Manuais", "10 Workbooks", "ferramentas práticas", "sequência recomendada", "mapa de progresso", "orientações de aplicação"],
    pagamento: "Pix ou cartão.",
    cta: "Quero acessar o Protocolo EPIC247",
    cta2: "Ainda quero descobrir por onde começar",
    micro: "Compra única. Condições finais de pagamento aparecem no checkout.",
  },
  mentoria: {
    titulo: "E se eu quiser acompanhamento individual?",
    texto: [
      "O Protocolo foi desenhado para aplicação estruturada com os materiais do EPIC247.",
      "Para quem deseja acompanhamento direto, leitura do contexto individual, construção de um Plano EPIC e encontros com a Ju, existe a Mentoria EPIC Individual.",
      "A Mentoria é uma oferta separada, com capacidade limitada.",
    ],
    cta: "Conhecer a Mentoria EPIC Individual",
  },
  faq: [
    {
      p: "Preciso fazer as 10 dimensões obrigatoriamente na ordem?",
      r: "O Protocolo possui uma sequência recomendada porque as dimensões formam um sistema. Ao mesmo tempo, os Mapas ajudam a reconhecer qual área pede mais atenção no momento. Você pode usar esse contexto sem transformar a jornada em uma regra rígida e cega à vida real.",
    },
    {
      p: "Posso comprar o Protocolo sem ter feito nenhum Mapa?",
      r: "Sim. A escada de produtos do EPIC247 não é obrigatória. Você pode entrar diretamente pelo Protocolo. Os Mapas continuam disponíveis como ferramentas para orientar sua leitura ao longo da jornada.",
    },
    {
      p: "Qual a diferença entre o Protocolo e os Kits?",
      r: "Cada Kit aprofunda uma dimensão específica. O Protocolo integra as dez dimensões, seus materiais, ferramentas e uma sequência de aplicação dentro de um único sistema.",
    },
    {
      p: "O Protocolo inclui Mentoria com a Ju?",
      r: "Não. A Mentoria EPIC Individual é uma oferta separada, com acompanhamento direto e capacidade limitada.",
    },
    {
      p: "Isso é terapia ou acompanhamento psicológico?",
      r: "Não. O EPIC247 é uma plataforma de transformação pessoal aplicada. Seus Mapas e materiais são educativos e comportamentais e não substituem avaliação, diagnóstico ou acompanhamento profissional de saúde quando necessários.",
    },
    {
      p: "O Protocolo promete que eu vou mudar minha vida?",
      r: "Não existe promessa responsável de resultado individual garantido. O Protocolo oferece estrutura, ferramentas e uma sequência para transformar reflexão em aplicação. O resultado depende do contexto e da forma como cada pessoa utiliza o processo.",
    },
  ],
  fechamento: {
    titulo: "Você não precisa mudar tudo de uma vez.",
    sub: "Mas pode começar a construir, dimensão por dimensão, as condições para participar mais conscientemente da vida que está escolhendo viver.",
    cta: "Quero acessar o Protocolo EPIC247",
    cta2: "Descobrir meu ponto de fricção primeiro",
  },
};

/** As 10 dimensões no Protocolo: pergunta e função no sistema (Copy Final §20, bloco 4). */
export const DIMENSAO_NO_PROTOCOLO: Record<DimensionId, { pergunta: string; funcao: string }> = {
  energia: {
    pergunta: "Você está tentando mudar sem combustível suficiente para sustentar a mudança?",
    funcao: "Criar condições físicas e mentais para que intenção consiga virar movimento.",
  },
  mentalidade: {
    pergunta: "O jeito como você interpreta a realidade está ampliando ou reduzindo suas possibilidades?",
    funcao: "Observar padrões de interpretação, proteção e pensamento que influenciam escolha e ação.",
  },
  autoconhecimento: {
    pergunta: "As escolhas que você faz ainda combinam com quem você se tornou?",
    funcao: "Construir clareza sobre identidade, valores, desejos, limites e coerência.",
  },
  felicidade: {
    pergunta: "Você está vivendo bem agora ou adiando a vida para depois da próxima conquista?",
    funcao: "Observar presença, engajamento, relações, significado e realização enquanto a vida acontece.",
  },
  planejamento: {
    pergunta: "Você sabe para onde quer ir e como transformar intenção em rota?",
    funcao: "Construir direção, prioridade, progresso e capacidade de ajustar o caminho.",
  },
  coragem: {
    pergunta: "Existe uma escolha que você já tomou por dentro, mas ainda não conseguiu atravessar por fora?",
    funcao: "Reconhecer medo, consequência, exposição e incerteza sem entregar a decisão a eles.",
  },
  acao: {
    pergunta: "Em que ponto sua intenção perde força antes de virar comportamento?",
    funcao: "Transformar clareza em movimento, consistência e capacidade de retomada.",
  },
  inteligencia: {
    pergunta: "O que acontece quando a realidade deixa de obedecer ao plano?",
    funcao: "Interpretar melhor, recompor estado, aprender e adaptar quando algo sai do previsto.",
  },
  excelencia: {
    pergunta: "Você está melhorando de verdade ou apenas repetindo com mais esforço?",
    funcao: "Transformar experiência em aprendizado, feedback, refinamento e qualidade sustentável.",
  },
  amor: {
    pergunta: "A transformação que você está construindo também produz mais presença, vínculo e sentido humano?",
    funcao: "Integrar conexão, presença, relação consigo, pertencimento e capacidade de compartilhar quem você se tornou.",
  },
};
