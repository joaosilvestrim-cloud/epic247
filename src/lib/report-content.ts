import { DRENOS, type DrenoId } from "./drenos";

// Conteúdo dos relatórios em PDF (um por dreno dominante).
// RASCUNHO ESTRUTURAL: o texto base vem das definições dos drenos. Expanda
// cada seção com o conteúdo final escrito/revisado pela Ju (4 a 6 páginas).

export interface ReportSection {
  titulo: string;
  paragrafos: string[];
}

export interface DrenoReport {
  drenoId: DrenoId;
  titulo: string;
  subtitulo: string;
  secoes: ReportSection[];
  passos: string[];
}

export function getReport(id: DrenoId): DrenoReport {
  const d = DRENOS[id];
  return {
    drenoId: id,
    titulo: d.nome,
    subtitulo: "Seu relatório de energia · Módulo Energia EPIC247",
    secoes: [
      {
        titulo: "O que está acontecendo com você",
        paragrafos: [
          d.descricao,
          "Este relatório foi gerado a partir do seu diagnóstico dos 5 Drenos. Ele não é um diagnóstico clínico — é um mapa prático para você entender onde sua energia está vazando e por onde começar.",
        ],
      },
      {
        titulo: "Por que isso acontece",
        paragrafos: [
          "A maioria das pessoas tenta resolver a falta de execução com mais disciplina, mais método e mais força de vontade. Mas quando a biologia está drenada, nenhuma técnica se sustenta por muito tempo.",
          "O seu Dreno Dominante — " +
            d.nome +
            " — é a alavanca de maior impacto agora. Corrigir a fundação antes de tudo o mais é o que faz a mudança finalmente grudar.",
          "[Espaço para aprofundamento da Ju: mecanismo fisiológico, exemplos e referências.]",
        ],
      },
      {
        titulo: "O princípio do Mínimo Viável",
        paragrafos: [
          "Você não precisa mudar tudo de uma vez. Escolha UM micro-hábito e mantenha por uma semana. Mínimo viável vence ideal abandonado.",
          "Para o seu dreno, o micro-hábito sugerido para começar é: " +
            d.microHabito +
            ".",
        ],
      },
      {
        titulo: "Seu plano de ação",
        paragrafos: [
          "Estes são os 4 próximos passos práticos para reverter o seu Dreno Dominante. Comece pelo primeiro e só avance quando ele estiver consolidado.",
        ],
      },
      {
        titulo: "O próximo passo",
        paragrafos: [
          "Este relatório é o ponto de partida. O Módulo Energia te dá o sistema completo — Manual, Workbook e a plataforma que monitora sua Bateria Vital dia a dia — para transformar estes passos em resultado real.",
          "Acesse: epic247.com.br (Módulo Energia · R$97).",
        ],
      },
    ],
    passos: d.passos,
  };
}
