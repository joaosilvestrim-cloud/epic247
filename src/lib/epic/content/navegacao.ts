// Header, mega-menu e footer (Copy Final §2, §3 e §5). PROPOSTA FINAL.

import type { DimensionId } from "../dimensions";
import { proposta, type Copy } from "./copy";

export const MEGA_MENU = {
  titulo: proposta("Por onde sua vida está pedindo atenção hoje?"),
  apoio: proposta(
    "Você não precisa começar por tudo. Comece pela dimensão que mais conversa com o que está acontecendo agora."
  ),
  fimPergunta: proposta("Não sabe por onde começar?"),
};

/** Pergunta de cada dimensão no mega-menu e no índice /dimensoes. */
export const PERGUNTA_MENU: Record<DimensionId, Copy> = {
  energia: proposta("Você está cansado porque sua vida exige demais ou porque sua energia está sendo drenada antes mesmo de o dia começar?"),
  mentalidade: proposta("O jeito como você está pensando está ajudando você a avançar ou criando argumentos cada vez melhores para continuar no mesmo lugar?"),
  autoconhecimento: proposta("As escolhas que você está fazendo ainda combinam com quem você se tornou?"),
  felicidade: proposta("Você está vivendo bem agora ou adiando a vida para depois da próxima conquista?"),
  planejamento: proposta("Você sabe para onde quer ir ou está apenas tentando organizar melhor tudo o que já está fazendo?"),
  coragem: proposta("Existe alguma decisão que você já tomou por dentro, mas ainda não conseguiu transformar em realidade?"),
  acao: proposta("Você precisa aprender mais alguma coisa ou precisa finalmente colocar alguma coisa em movimento?"),
  inteligencia: proposta("Quando a realidade muda, você consegue ajustar a rota ou continua tentando fazer funcionar o plano original?"),
  excelencia: proposta("Você está realmente melhorando ou apenas repetindo, com mais esforço, aquilo que já sabe fazer?"),
  amor: proposta("A vida que você está construindo também tem espaço para presença, vínculo, pertencimento e sentido?"),
};

export const FOOTER = {
  descricao: proposta(
    "Transformação pessoal aplicada para quem quer mudar, realinhar ou expandir uma dimensão da própria vida."
  ),
  newsletter: {
    titulo: proposta("Uma ideia pode mudar o jeito como você vive uma terça-feira qualquer."),
    texto: proposta("Receba ideias, perguntas, repertório e ferramentas do EPIC247 no seu e-mail."),
    campo: "Seu e-mail",
    cta: "Quero receber",
    consentimento: proposta(
      "Ao assinar, você concorda em receber comunicações editoriais do EPIC247. Você pode sair a qualquer momento."
    ),
  },
  direitos: "© EPIC247. Todos os direitos reservados.",
};
