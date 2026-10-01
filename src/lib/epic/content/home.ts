// Home (Site e Arquitetura §8, Blueprint §9). Headlines marcadas como
// aprovadas no Blueprint entram como string; o resto é rascunho pendente.

import { pendente, type Copy } from "./copy";

export const HOME = {
  hero: {
    titulo: "Tem uma distância entre a vida que você vive e a vida que sabe que poderia viver?",
    subtexto:
      "Nem sempre o problema é falta de disciplina, informação ou vontade. Às vezes existe um ponto de fricção que você ainda não identificou.",
    ctaPrimario: "Descubra seu ponto de fricção",
    ctaSecundario: "Conheça o EPIC247",
  },
  reconhecimento: {
    titulo: "Sua vida pode estar funcionando e ainda assim alguma coisa não estar funcionando para você.",
    // Cenas: COPY PENDENTE no Blueprint. Rascunho com cenas e frases-teste dos documentos.
    cenas: [
      pendente(
        "Tem gente chegando em casa e ficando cinco minutos dentro do carro porque ainda não tem energia para ser necessária para mais ninguém."
      ),
      pendente(
        "Você passou o dia resolvendo coisas importantes e, às 22h, finalmente teve tempo para aquilo que poderia mudar sua própria vida. Só que já estava cansado demais."
      ),
      pendente(
        "Você já sabe tanto sobre o que precisa fazer que aprender mais uma coisa virou uma forma de não começar."
      ),
      pendente("Você conquistou exatamente aquilo que queria cinco anos atrás. E isso já não parece suficiente."),
    ] as Copy[],
  },
  dimensoes: {
    titulo: "10 dimensões da sua vida. Diferentes pontos de fricção.",
  },
  mapa: {
    titulo: "Descubra onde está sua fricção.",
    texto: pendente(
      "Sete perguntas, cerca de dois minutos. O resultado aparece na hora, sem pedir e-mail, e mostra por qual dimensão vale começar."
    ),
  },
  primeiroPasso: {
    titulo: "Comece onde sua vida está pedindo atenção.",
    cards: [
      {
        titulo: pendente("Faça o Mapa"),
        texto: pendente("Gratuito. Descubra em qual dimensão está sua principal fricção hoje."),
        href: "/mapa",
      },
      {
        titulo: pendente("Leia e assista"),
        texto: pendente("Ideias, histórias e ferramentas para entender o que está acontecendo antes de se cobrar."),
        href: "/ideias",
      },
      {
        titulo: pendente("Trabalhe uma dimensão"),
        texto: pendente("Os Kits reúnem Manual, Workbook e ferramentas para aprofundar uma dimensão específica."),
        href: "/dimensoes/energia",
      },
      {
        titulo: pendente("Acompanhamento individual"),
        texto: pendente("A Mentoria EPIC é para quem quer acelerar uma mudança com acompanhamento da Ju."),
        href: "/mentoria",
      },
    ],
  },
  protocolo: {
    titulo: "10 dimensões. Um sistema.",
    mensagem:
      "Você pode começar por uma dimensão específica. Mas algumas mudanças exigem olhar o sistema inteiro.",
    cta: "Conhecer o Protocolo",
  },
  ideias: {
    titulo: "Ideias para viver melhor.",
  },
  ju: {
    mensagem:
      "O EPIC247 nasceu de anos observando uma pergunta que se repetia: por que pessoas inteligentes, conscientes e capazes continuam sabendo tanto e mudando tão pouco?",
    cta: "Conheça a Ju",
  },
};

/** Manifesto v1 (Posicionamento §12). Aprovado. */
export const MANIFESTO = {
  abertura: [
    "A vida pode estar funcionando e ainda assim não estar fazendo sentido.",
    "Você pode ser competente, responsável, inteligente e continuar adiando uma conversa, uma mudança, um projeto, uma escolha ou uma parte importante de si mesmo.",
    "Pode saber exatamente o que fazer e ainda não conseguir fazer.",
    "Pode ter conquistado muito e, mesmo assim, sentir que alguma coisa ficou para trás.",
    "Nós não acreditamos que isso se resolva com mais uma frase de motivação.",
    "Nem com mais cobrança.",
    "Nem com a promessa de uma vida perfeita.",
    "Mudanças reais precisam de condições reais.",
  ],
  fechamento: [
    "Chamamos esse conjunto de Infraestrutura Humana.",
    "O EPIC247 existe para ajudar você a enxergar onde sua vida está encontrando fricção, entender o que está acontecendo e construir condições para avançar.",
    "Sem fórmula mágica.",
    "Sem personagem perfeito.",
    "Sem precisar esperar a hora ideal.",
    "Porque viver conscientemente não é controlar tudo o que acontece.",
    "É participar das escolhas que constroem quem você está se tornando.",
  ],
  promessa: "Da vida que acontece para a vida que você escolhe.",
};
