// Conteúdo das 10 páginas de dimensão (Blueprint §8).
//
// APROVADO (vem dos documentos, entra direto): reconhecimento = frases de
// reconhecimento dos 5 perfis de cada Mapa; áreas = eixos do Mapa; frase de
// fechamento; linha do manifesto; filme de referência (Sistema Editorial §9).
//
// PENDENTE (rascunho para a Ju/Luiz): pergunta-título, subtítulo e
// explicação curta. Foram escritos a partir de frases dos próprios
// documentos, mas o encaixe na página ainda precisa de aprovação.

import type { DimensionId } from "../dimensions";
import { pendente, type Copy } from "./copy";

export interface DimensaoConteudo {
  /** Pergunta humana do Hero e do bloco "10 dimensões" da Home. */
  pergunta: Copy;
  subtitulo: Copy;
  explicacao: Copy;
  /** Filme do mapa emocional (Sistema Editorial §9). */
  filme: string;
}

export const DIMENSAO_CONTEUDO: Record<DimensionId, DimensaoConteudo> = {
  energia: {
    pergunta: pendente("Você chega ao fim do dia sem energia para o que é seu?"),
    subtitulo: pendente(
      "Antes de pedir mais disciplina de si mesmo, vale olhar se existe combustível suficiente para o que você quer construir."
    ),
    explicacao: pendente(
      "O EPIC trabalha cinco origens distintas de desgaste: sono, combustível, alerta, atenção e corpo. Descobrir qual delas pesa mais hoje é a porta para mudar o que realmente importa, sem tentar consertar a vida inteira de uma vez."
    ),
    filme: "Livre (Wild)",
  },
  mentalidade: {
    pergunta: pendente("Você pensa tanto antes de decidir que a decisão nunca chega?"),
    subtitulo: pendente("Pensar melhor não significa pensar mais."),
    explicacao: pendente(
      "Mentalidade, no EPIC247, não é pensar positivo. É perceber quando a forma de interpretar a realidade está ajudando você a escolher e quando está apenas criando uma explicação sofisticada para não se mover."
    ),
    filme: "À Procura da Felicidade",
  },
  autoconhecimento: {
    pergunta: pendente("Sua vida ainda combina com quem você se tornou?"),
    subtitulo: pendente(
      "É possível continuar funcionando muito bem e ainda assim caminhar numa direção que já não combina com você."
    ),
    explicacao: pendente(
      "Autoconhecimento, no EPIC247, não é pensar indefinidamente sobre si. É construir um mapa suficientemente claro para fazer escolhas mais alinhadas."
    ),
    filme: "Comer, Rezar e Amar",
  },
  felicidade: {
    pergunta: pendente("Sua vida está funcionando. Mas você está vivendo?"),
    subtitulo: pendente("Felicidade não é um prêmio que começa quando a vida finalmente fica pronta."),
    explicacao: pendente(
      "É a capacidade de construir presença, conexão, significado e realização enquanto a vida ainda está acontecendo."
    ),
    filme: "Antes de Partir",
  },
  planejamento: {
    pergunta: pendente("Você planeja muito e avança pouco no que importa?"),
    subtitulo: pendente("Planejamento não é prever o caminho inteiro."),
    explicacao: pendente(
      "É construir direção suficiente para agir, medir o que acontece e ajustar a rota sem perder de vista o que importa."
    ),
    filme: "Onze Homens e um Segredo",
  },
  coragem: {
    pergunta: pendente(
      "Tem alguma decisão que você já tomou por dentro, mas ainda não teve coragem de transformar em realidade?"
    ),
    subtitulo: pendente("Coragem não é ausência de medo."),
    explicacao: pendente(
      "É a capacidade de deixar o medo suficientemente claro para que ele pare de decidir sozinho."
    ),
    filme: "Joy",
  },
  acao: {
    pergunta: pendente("Você sabe exatamente o que deveria fazer, mas não faz?"),
    subtitulo: pendente("Você não precisa esperar a versão perfeita do plano."),
    explicacao: pendente(
      "A pergunta aqui não é por que você procrastina. É em que ponto a sua intenção está perdendo força antes de virar comportamento."
    ),
    filme: "A Corrente do Bem",
  },
  inteligencia: {
    pergunta: pendente("Quando a realidade foge do plano, você se adapta ou trava?"),
    subtitulo: pendente("Inteligência, no EPIC247, não é saber mais."),
    explicacao: pendente(
      "É conseguir responder melhor quando a realidade deixa de obedecer ao plano: interpretar, recuperar, aprender e mudar a rota sem perder o objetivo."
    ),
    filme: "Jerry Maguire",
  },
  excelencia: {
    pergunta: pendente("Você entrega bem, mas só à custa de um esforço heroico?"),
    subtitulo: pendente("Excelência não é exigir mais de si o tempo todo."),
    explicacao: pendente(
      "É aprender a elevar qualidade com método, feedback e refinamento sem transformar melhoria em autodestruição."
    ),
    filme: "Homens de Honra",
  },
  amor: {
    pergunta: pendente("Em quais relações você consegue ser inteiro?"),
    subtitulo: pendente("Amor, no EPIC247, não é apenas vida romântica."),
    explicacao: pendente(
      "É a infraestrutura relacional que sustenta ou restringe a forma como você vive: conexão, presença, a relação consigo, pertencimento e o que você compartilha."
    ),
    filme: "Patch Adams",
  },
};
