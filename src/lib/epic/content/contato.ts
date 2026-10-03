// Página Contato (Copy Final §24). APROVADO (Editorial Freeze 02/10/2026).
// Sem prazo de resposta prometido: a operação ainda não definiu SLA.

export const ASSUNTOS = {
  mentoria: "Mentoria",
  produtos: "Produtos e acesso",
  parcerias: "Parcerias e projetos",
  ju_imprensa: "Ju Ferreira / imprensa / palestras",
  outro: "Outro",
} as const;

export type Assunto = keyof typeof ASSUNTOS;

export const ehAssunto = (v: unknown): v is Assunto => typeof v === "string" && v in ASSUNTOS;

export const CONTATO_PAGINA = {
  seo: {
    titulo: "Contato | EPIC247",
    descricao:
      "Entre em contato com o EPIC247 para dúvidas sobre produtos, Mentoria, parcerias, projetos, imprensa ou outros assuntos.",
  },
  hero: {
    eyebrow: "Contato",
    titulo: "Se existe uma pergunta, uma ideia ou uma conversa que vale continuar, comece por aqui.",
    sub: "Escolha o caminho que mais combina com o que você precisa agora. Isso ajuda a mensagem a chegar ao lugar certo e evita transformar tudo em uma única caixa de entrada.",
  },
  escolha: {
    titulo: "Como podemos ajudar?",
    cards: [
      {
        assunto: "mentoria" as Assunto,
        titulo: "Mentoria EPIC Individual",
        texto: "Quer saber mais sobre a Mentoria, disponibilidade de vagas ou formato do processo?",
        cta: "Falar sobre Mentoria",
      },
      {
        assunto: "produtos" as Assunto,
        titulo: "Dúvidas sobre produtos e acesso",
        texto: "Tem alguma dúvida sobre Mapa, Plano, Kit, Protocolo, compra ou acesso aos materiais?",
        cta: "Preciso de ajuda",
      },
      {
        assunto: "parcerias" as Assunto,
        titulo: "Parcerias e projetos",
        texto: "Quer conversar sobre parceria, colaboração, conteúdo, projeto ou outra possibilidade envolvendo o EPIC247?",
        cta: "Propor uma conversa",
      },
      {
        assunto: "ju_imprensa" as Assunto,
        titulo: "Palestras, imprensa e Ju Ferreira",
        texto: "O assunto é palestra, evento, entrevista, imprensa ou um convite relacionado diretamente à Ju Ferreira?",
        cta: "Palestras, imprensa e convites",
      },
      {
        assunto: "outro" as Assunto,
        titulo: "Outro assunto",
        texto: "Nenhuma das opções acima descreve bem sua mensagem?",
        cta: "Enviar outra mensagem",
      },
    ],
  },
  form: {
    titulo: "Conte pra gente.",
    placeholderMensagem: "Escreva o contexto necessário para entendermos como podemos ajudar.",
    cta: "Enviar convite ou proposta",
    sensiveis:
      "Não use este formulário para compartilhar informações médicas, psicológicas ou outros dados pessoais sensíveis desnecessários para o atendimento.",
  },
  confirmacao: {
    cta: "Voltar para o EPIC247",
    cta2: "Explorar Ideias",
  },
  atalhos: {
    titulo: "Talvez você não precise esperar uma resposta.",
    texto: "Alguns caminhos podem começar agora.",
    links: [
      { texto: "Quero descobrir meu ponto de fricção", destino: "Mapa de Fricção", href: "/mapa" },
      { texto: "Quero entender as 10 dimensões", destino: "Dimensões", href: "/dimensoes" },
      { texto: "Quero conhecer o sistema completo", destino: "Protocolo", href: "/protocolo" },
      { texto: "Quero acompanhamento individual", destino: "Mentoria", href: "/mentoria" },
      { texto: "Quero ler, assistir e explorar ideias", destino: "Ideias", href: "/ideias" },
      { texto: "Quero conhecer a Ju", destino: "Ju", href: "/ju" },
    ],
  },
  fechamento: {
    titulo: "Nem toda conversa precisa começar pronta.",
    sub: "Às vezes basta saber qual é a pergunta e encontrar o lugar certo para colocá-la.",
    cta: "Enviar uma mensagem",
  },
};
